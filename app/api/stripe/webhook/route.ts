import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

async function syncSubscription(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  payload: {
    plan: 'founder_list' | 'investor_access'
    status: 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
    stripe_subscription_id?: string | null
    stripe_price_id?: string | null
    current_period_end?: string | null
    cancel_at_period_end?: boolean
  }
) {
  await supabase.from('subscriptions').upsert({
    user_id: userId,
    plan: payload.plan,
    status: payload.status,
    stripe_subscription_id: payload.stripe_subscription_id ?? null,
    stripe_price_id: payload.stripe_price_id ?? null,
    current_period_end: payload.current_period_end ?? null,
    cancel_at_period_end: payload.cancel_at_period_end ?? false
  }, { onConflict: 'stripe_subscription_id' })

  await supabase.from('profiles').update({
    plan: payload.status === 'active' || payload.status === 'trialing'
      ? payload.plan
      : 'free'
  }).eq('id', userId)
}

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = headers().get('stripe-signature')

  if (!sig) return NextResponse.json({ error: 'Missing signature' }, { status: 400 })

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  const supabase = createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const plan = session.metadata?.plan as 'founder_list' | 'investor_access' | undefined
        const subscriptionId = session.subscription as string | null
        const customerId = session.customer as string | null

        if (!userId || !plan || !subscriptionId || !customerId) break

        const sub = await stripe.subscriptions.retrieve(subscriptionId)
        const priceId = sub.items.data[0]?.price.id
        const status = sub.status as any

        await syncSubscription(supabase, userId, {
          plan,
          status,
          stripe_subscription_id: sub.id,
          stripe_price_id: priceId,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end
        })
        break
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id

        const { data: customerRow } = await supabase
          .from('stripe_customers')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (!customerRow?.user_id) break

        const priceId = sub.items.data[0]?.price.id
        const plan =
          priceId === process.env.STRIPE_FOUNDER_PRICE_ID
            ? 'founder_list'
            : 'investor_access'

        await syncSubscription(supabase, customerRow.user_id, {
          plan,
          status: sub.status as any,
          stripe_subscription_id: sub.id,
          stripe_price_id: priceId,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}