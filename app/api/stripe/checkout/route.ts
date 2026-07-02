import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.redirect(new URL('/login', req.url))

  const { searchParams } = new URL(req.url)
  const plan = searchParams.get('plan')

  if (plan !== 'founder_list' && plan !== 'investor_access') {
    return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
  }

  const priceId =
    plan === 'founder_list'
      ? process.env.STRIPE_FOUNDER_PRICE_ID!
      : process.env.STRIPE_INVESTOR_PRICE_ID!

  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', user.id)
    .single()

  let customerId: string | null = null

  const { data: existingCustomer } = await supabase
    .from('stripe_customers')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (existingCustomer?.stripe_customer_id) {
    customerId = existingCustomer.stripe_customer_id
  } else {
    const customer = await stripe.customers.create({
      email: profile?.email,
      metadata: { user_id: user.id }
    })

    customerId = customer.id

    await supabase.from('stripe_customers').insert({
      user_id: user.id,
      stripe_customer_id: customerId
    })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/billing?success=1`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=1`,
    metadata: {
      user_id: user.id,
      plan
    }
  })

  return NextResponse.redirect(session.url!, { status: 303 })
}