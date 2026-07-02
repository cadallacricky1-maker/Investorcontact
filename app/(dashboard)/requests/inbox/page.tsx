import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function InboxPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: requests, error } = await supabase
    .from('contact_requests')
    .select('id, status, message, created_at, requester_id, offer_id')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return <main className="p-6 text-red-600">Failed to load requests: {error.message}</main>
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-semibold">Request inbox</h1>
      <p className="mt-2 text-gray-600">Review contact requests from interested investors.</p>

      <div className="mt-8 grid gap-4">
        {requests?.length ? (
          requests.map((req) => (
            <div key={req.id} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium capitalize">Status: {req.status}</p>
                  <p className="text-sm text-gray-600">{req.message || 'No message'}</p>
                  <p className="mt-2 text-xs text-gray-500">
                    {new Date(req.created_at).toLocaleString()}
                  </p>
                </div>
                <span
                  className={[
                    'rounded-full px-3 py-1 text-xs font-medium',
                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    req.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  ].join(' ')}
                >
                  {req.status}
                </span>
              </div>
              <div className="mt-4 flex gap-3">
                <Link href={`/requests/${req.id}`} className="rounded-md border px-4 py-2 text-sm">
                  Review
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-sm text-gray-600">
            No contact requests yet.
          </div>
        )}
      </div>
    </main>
  )
}