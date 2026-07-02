import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

type SearchParams = {
  q?: string
  stage?: string
  industry?: string
  geography?: string
}

export default async function OffersPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const { q, stage, industry, geography } = await searchParams
  const supabase = createClient()

  let query = supabase
    .from('offers')
    .select('id, title, summary, stage, industry, geography, is_public, created_at')
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(
      `title.ilike.%${q}%,summary.ilike.%${q}%,looking_for.ilike.%${q}%`
    )
  }

  if (stage) query = query.eq('stage', stage)
  if (industry) query = query.eq('industry', industry)
  if (geography) query = query.eq('geography', geography)

  const { data: offers, error } = await query

  if (error) {
    return <main className="p-6 text-red-600">Failed to load offers: {error.message}</main>
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Offers</h1>
          <p className="mt-2 text-gray-600">
            Browse active founder offers and request contact when there's a fit.
          </p>
        </div>

        <form className="grid gap-3 md:grid-cols-4">
          <input
            name="q"
            defaultValue={q || ''}
            placeholder="Search"
            className="rounded-md border p-3"
          />
          <input
            name="stage"
            defaultValue={stage || ''}
            placeholder="Stage"
            className="rounded-md border p-3"
          />
          <input
            name="industry"
            defaultValue={industry || ''}
            placeholder="Industry"
            className="rounded-md border p-3"
          />
          <input
            name="geography"
            defaultValue={geography || ''}
            placeholder="Geography"
            className="rounded-md border p-3"
          />
          <button className="rounded-md bg-black px-4 py-2 text-white md:col-span-4">
            Apply filters
          </button>
        </form>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {offers?.length ? (
          offers.map((offer) => (
            <article key={offer.id} className="rounded-xl border bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">{offer.title}</h2>
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  Live
                </span>
              </div>

              <p className="mt-3 text-sm text-gray-600 line-clamp-3">
                {offer.summary || 'No summary provided.'}
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
                <span className="rounded-full bg-gray-100 px-2 py-1">{offer.stage || '—'}</span>
                <span className="rounded-full bg-gray-100 px-2 py-1">{offer.industry || '—'}</span>
                <span className="rounded-full bg-gray-100 px-2 py-1">{offer.geography || '—'}</span>
              </div>

              <div className="mt-5">
                <Link
                  href={`/offers/${offer.id}`}
                  className="inline-flex rounded-md border px-4 py-2 text-sm"
                >
                  View offer
                </Link>
              </div>
            </article>
          ))
        ) : (
          <div className="rounded-xl border border-dashed p-8 text-sm text-gray-600">
            No matching offers found.
          </div>
        )}
      </div>
    </main>
  )
}