import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function BillingPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, email, name')
    .eq('id', user.id)
    .single()

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('plan, status, current_period_end, cancel_at_period_end')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-semibold">Billing</h1>
      <p className="mt-2 text-gray-600">
        Manage your subscription and keep your access active.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Current plan</h2>
          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p><strong>Name:</strong> {profile?.name || '—'}</p>
            <p><strong>Email:</strong> {profile?.email || '—'}</p>
            <p><strong>Profile plan:</strong> {profile?.plan || 'free'}</p>
            <p><strong>Subscription plan:</strong> {subscription?.plan || 'none'}</p>
            <p><strong>Status:</strong> {subscription?.status || 'inactive'}</p>
            <p><strong>Renews:</strong> {subscription?.current_period_end ? new Date(subscription.current_period_end).toLocaleString() : '—'}</p>
            <p><strong>Cancel at period end:</strong> {subscription?.cancel_at_period_end ? 'Yes' : 'No'}</p>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Plans</h2>
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border p-4">
              <p className="font-medium">Founder List</p>
              <p className="text-sm text-gray-600">$9.99/mo to publish an offer and stay visible.</p>
              <a
                href="/api/stripe/checkout?plan=founder_list"
                className="mt-3 inline-flex rounded-md bg-black px-4 py-2 text-white"
              >
                Subscribe as founder
              </a>
            </div>

            <div className="rounded-lg border p-4">
              <p className="font-medium">Investor Access</p>
              <p className="text-sm text-gray-600">$19.99/mo to read offer requests and request contact.</p>
              <a
                href="/api/stripe/checkout?plan=investor_access"
                className="mt-3 inline-flex rounded-md bg-black px-4 py-2 text-white"
              >
                Subscribe as investor
              </a>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-xl border border-dashed bg-gray-50 p-5">
        <h2 className="text-lg font-semibold">Access rules</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-gray-700">
          <li>Founder List subscription required to publish or keep offers visible.</li>
          <li>Investor Access subscription required to view requests and submit contact requests.</li>
          <li>If billing lapses, the app should pause visibility or premium actions until renewed.</li>
        </ul>
      </section>

      <div className="mt-6">
        <Link href="/dashboard" className="text-sm underline">
          Back to dashboard
        </Link>
      </div>
    </main>
  )
}