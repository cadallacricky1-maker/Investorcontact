import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBillingAccess } from '@/lib/access'

export default async function MyOffersPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getBillingAccess(user.id)

  const { data: offers, error } = await supabase
    .from('offers')
    .select('id, title, summary, is_public, created_at')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return <main className="p-6 text-red-600">Failed to load offers: {error.message}</main>
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">My offers</h1>
          <p className="mt-2 text-gray-600">
            Manage your listing visibility and keep your subscription active to stay public.
          </p>
        </div>
        <Link href="/my-offers/new" className="rounded-md bg-black px-4 py-2 text-white">
          Create offer
        </Link>
      </div>

      {!access.founderListActive ? (
        <div className="mt-6 rounded-xl border border-dashed p-5 text-sm text-gray-600">
          Your Founder List subscription is inactive. Public visibility is paused.
        </div>
      ) : null}

      <div className="mt-8 grid gap-4">
        {offers?.length ? (
          offers.map((offer) => (
            <article key={offer.id} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{offer.title}</h2>
                  <p className="mt-2 text-sm text-gray-600">{offer.summary}</p>
                  <p className="mt-3 text-xs text-gray-500">
                    {new Date(offer.created_at).toLocaleString()}
                  </p>
                </div>

                <span
                  className={[
                    'rounded-full px-3 py-1 text-xs font-medium',
                    offer.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  ].join(' ')}
                >
                  {offer.is_public && access.founderListActive ? 'Visible' : 'Paused'}
                </span>
              </div>

              <div className="mt-5 flex gap-3">
                <Link href={`/my-offers/${offer.id}`} className="rounded-md border px-4 py-2 text-sm">
                  Manage
                </Link>
                <Link href={`/offers/${offer.id}`} className="rounded-md border px-4 py-2 text-sm">
                  View public page
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-sm text-gray-600">
            You have no offers yet.
          </div>
        )}
      </div>
    </main>
  )
}