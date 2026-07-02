import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatCard from '@/components/dashboard/stat-card'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, name')
    .eq('id', user.id)
    .single()

  const { data: offers } = await supabase
    .from('offers')
    .select('id, title, is_public, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  const { data: requests } = await supabase
    .from('contact_requests')
    .select('id, status')
    .eq('owner_id', user.id)

  const activeOffers = offers?.filter((o) => o.is_public).length ?? 0
  const pendingRequests = requests?.filter((r) => r.status === 'pending').length ?? 0
  const approvedRequests = requests?.filter((r) => r.status === 'approved').length ?? 0

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold">
          Hi, {profile?.name || 'Founder'}
        </h1>
        <p className="mt-2 text-gray-600">
          {profile?.plan === 'founder_list' ? 'Your listing is active.' : 'Upgrade to publish and stay visible.'}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Plan" value={profile?.plan ?? 'free'} />
        <StatCard label="Active offers" value={activeOffers} />
        <StatCard label="Pending requests" value={pendingRequests} />
        <StatCard label="Approved requests" value={approvedRequests} />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Your offers</h2>
            <Link href="/my-offers" className="text-sm text-blue-600 underline">
              View all
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {offers?.slice(0, 5).map((offer) => (
              <div key={offer.id} className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{offer.title}</p>
                  <p className="text-sm text-gray-500">{offer.is_public ? 'Visible' : 'Hidden'}</p>
                </div>
                <Link href={`/my-offers/${offer.id}`} className="text-sm underline">
                  Manage
                </Link>
              </div>
            ))}
            {!offers?.length ? <p className="text-sm text-gray-500">No offers yet.</p> : null}
          </div>
        </div>

        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Inbox preview</h2>
            <Link href="/requests/inbox" className="text-sm text-blue-600 underline">
              Open inbox
            </Link>
          </div>
          <div className="mt-4 space-y-3">
            {requests?.slice(0, 5).map((req) => (
              <div key={req.id} className="flex items-center justify-between rounded-lg border p-3">
                <p className="font-medium capitalize">{req.status}</p>
                <span className="text-sm text-gray-500">Contact request</span>
              </div>
            ))}
            {!requests?.length ? <p className="text-sm text-gray-500">No requests yet.</p> : null}
          </div>
        </div>
      </section>

      <section className="flex gap-3">
        <Link href="/my-offers/new" className="rounded-md bg-black px-4 py-2 text-white">
          Create offer
        </Link>
        <Link href="/requests/inbox" className="rounded-md border px-4 py-2">
          Review requests
        </Link>
      </section>
    </div>
  )
}