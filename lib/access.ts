import { createClient } from '@/lib/supabase/server'

export async function getBillingAccess(userId: string) {
  const supabase = createClient()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const founderListActive =
    subscription?.plan === 'founder_list' &&
    (subscription.status === 'active' || subscription.status === 'trialing')

  const investorAccessActive =
    subscription?.plan === 'investor_access' &&
    (subscription.status === 'active' || subscription.status === 'trialing')

  return {
    founderListActive,
    investorAccessActive
  }
}