import { redirect, notFound } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getBillingAccess } from '@/lib/access'

async function updateOffer(formData: FormData) {
  'use server'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const id = String(formData.get('id') || '')
  const title = String(formData.get('title') || '').trim()
  const summary = String(formData.get('summary') || '').trim()
  const looking_for = String(formData.get('looking_for') || '').trim()
  const stage = String(formData.get('stage') || '').trim()
  const industry = String(formData.get('industry') || '').trim()
  const geography = String(formData.get('geography') || '').trim()
  const is_public = formData.get('is_public') === 'on'

  if (!id) throw new Error('Missing offer id')
  if (!title) throw new Error('Title is required')

  const access = await getBillingAccess(user.id)
  if (is_public && !access.founderListActive) {
    throw new Error('Active Founder List subscription required to publish')
  }

  const { error } = await supabase
    .from('offers')
    .update({
      title,
      summary,
      looking_for,
      stage,
      industry,
      geography,
      is_public
    })
    .eq('id', id)
    .eq('owner_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath('/my-offers')
  revalidatePath('/dashboard')
  revalidatePath(`/offers/${id}`)
  redirect('/my-offers')
}

export default async function OfferManagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: offer, error } = await supabase
    .from('offers')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (error || !offer) notFound()

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-semibold">Manage offer</h1>
      <p className="mt-2 text-gray-600">Edit your public listing and control visibility.</p>

      <form action={updateOffer} className="mt-6 space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <input type="hidden" name="id" value={offer.id} />
        <input name="title" defaultValue={offer.title} className="w-full rounded-md border p-3" placeholder="Title" />
        <textarea name="summary" defaultValue={offer.summary ?? ''} className="w-full rounded-md border p-3" rows={4} placeholder="Summary" />
        <textarea name="looking_for" defaultValue={offer.looking_for ?? ''} className="w-full rounded-md border p-3" rows={3} placeholder="What are you looking for?" />
        <input name="stage" defaultValue={offer.stage ?? ''} className="w-full rounded-md border p-3" placeholder="Stage" />
        <input name="industry" defaultValue={offer.industry ?? ''} className="w-full rounded-md border p-3" placeholder="Industry" />
        <input name="geography" defaultValue={offer.geography ?? ''} className="w-full rounded-md border p-3" placeholder="Geography" />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_public" defaultChecked={offer.is_public} />
          Visible to investors
        </label>

        <button className="rounded-md bg-black px-4 py-2 text-white">
          Save changes
        </button>
      </form>
    </main>
  )
}