import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBillingAccess } from '@/lib/access'

async function requestContact(formData: FormData) {
  'use server'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const offer_id = String(formData.get('offer_id') || '')
  const message = String(formData.get('message') || '').trim()

  if (!offer_id) throw new Error('Missing offer id')

  const access = await getBillingAccess(user.id)
  if (!access.investorAccessActive) {
    throw new Error('Investor subscription required to request contact')
  }

  const { data: offer, error: offerError } = await supabase
    .from('offers')
    .select('id, owner_id, title, is_public')
    .eq('id', offer_id)
    .single()

  if (offerError || !offer) throw new Error('Offer not found')
  if (!offer.is_public) throw new Error('This offer is not currently visible')

  const { error } = await supabase.from('contact_requests').insert({
    offer_id,
    requester_id: user.id,
    owner_id: offer.owner_id,
    message,
    status: 'pending'
  })

  if (error) throw new Error(error.message)

  redirect(`/offers/${offer_id}?requested=1`)
}

export default async function OfferDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ requested?: string }>
}) {
  const { id } = await params
  const { requested } = await searchParams
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: offer, error } = await supabase
    .from('offers')
    .select('id, title, summary, looking_for, stage, industry, geography, is_public, owner_id')
    .eq('id', id)
    .single()

  if (error || !offer) notFound()

  const { data: owner } = await supabase
    .from('profiles')
    .select('id, name, avatar_url, email, plan')
    .eq('id', offer.owner_id)
    .single()

  const canRequest = !!user && offer.is_public

  const { data: approvedRequest } = user
    ? await supabase
        .from('contact_requests')
        .select('id, status')
        .eq('offer_id', offer.id)
        .eq('requester_id', user.id)
        .eq('status', 'approved')
        .maybeSingle()
    : { data: null }

  const canViewContact = !!approvedRequest

  return (
    <main className="mx-auto max-w-4xl p-6">
      <Link href="/offers" className="text-sm underline">
        ← Back to offers
      </Link>

      <div className="mt-4 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-xl border bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-semibold">{offer.title}</h1>
          <p className="mt-3 text-gray-600">{offer.summary}</p>

          <div className="mt-6 grid gap-3 text-sm text-gray-700">
            <p><strong>Stage:</strong> {offer.stage || '—'}</p>
            <p><strong>Industry:</strong> {offer.industry || '—'}</p>
            <p><strong>Geography:</strong> {offer.geography || '—'}</p>
            <p><strong>Looking for:</strong> {offer.looking_for || '—'}</p>
          </div>

          {requested ? (
            <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-800">
              Request sent. The founder will review it shortly.
            </div>
          ) : null}

          <div className="mt-8 rounded-xl border bg-gray-50 p-5">
            <h2 className="text-lg font-semibold">Contact access</h2>

            {canViewContact ? (
              <div className="mt-3 space-y-2 text-sm text-gray-700">
                <p><strong>Name:</strong> {owner?.name || 'Founder'}</p>
                <p><strong>Email:</strong> {owner?.email || 'Hidden'}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-600">
                Contact details unlock after the founder approves your request.
              </p>
            )}
          </div>
        </section>

        <aside className="rounded-xl border bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Request contact</h2>
          <p className="mt-2 text-sm text-gray-600">
            Send a short note. The founder will approve or reject it.
          </p>

          {canRequest ? (
            <form action={requestContact} className="mt-5 space-y-4">
              <input type="hidden" name="offer_id" value={offer.id} />
              <textarea
                name="message"
                rows={6}
                placeholder="Why are you interested?"
                className="w-full rounded-md border p-3"
              />
              <button className="w-full rounded-md bg-black px-4 py-2 text-white">
                Request contact
              </button>
            </form>
          ) : (
            <div className="mt-5 rounded-lg border border-dashed p-4 text-sm text-gray-600">
              You need an active investor subscription to request contact.
              <Link href="/pricing" className="mt-3 block underline">
                Upgrade
              </Link>
            </div>
          )}
        </aside>
      </div>
    </main>
  )
}