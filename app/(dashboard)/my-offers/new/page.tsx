import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getBillingAccess } from '@/lib/access'

async function createOffer(formData: FormData) {
  'use server'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getBillingAccess(user.id)
  if (!access.founderListActive) throw new Error('Founder subscription required')

  const title = String(formData.get('title') || '').trim()
  const summary = String(formData.get('summary') || '').trim()
  const looking_for = String(formData.get('looking_for') || '').trim()
  const stage = String(formData.get('stage') || '').trim()
  const industry = String(formData.get('industry') || '').trim()
  const geography = String(formData.get('geography') || '').trim()
  const is_public = formData.get('is_public') === 'on'

  if (!title) throw new Error('Title is required')

  const { error } = await supabase.from('offers').insert({
    owner_id: user.id,
    title,
    summary,
    looking_for,
    stage,
    industry,
    geography,
    is_public
  })

  if (error) throw new Error(error.message)

  revalidatePath('/my-offers')
  revalidatePath('/dashboard')
  revalidatePath('/offers')
  redirect('/my-offers')
}

export default async function NewOfferPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const access = await getBillingAccess(user.id)
  if (!access.founderListActive) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-3xl font-semibold">Create offer</h1>
        <p className="mt-4 text-gray-600">
          You need an active Founder List subscription to publish an offer.
        </p>
        <Link href="/billing" className="mt-6 inline-flex rounded-md bg-black px-4 py-2 text-white">
          Upgrade
        </Link>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-3xl font-semibold">Create offer</h1>
      <p className="mt-2 text-gray-600">Publish what you're offering and let investors request contact.</p>

      <form action={createOffer} className="mt-6 space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <input name="title" placeholder="Title" className="w-full rounded-md border p-3" />
        <textarea name="summary" placeholder="Short summary" className="w-full rounded-md border p-3" rows={4} />
        <textarea name="looking_for" placeholder="What are you looking for?" className="w-full rounded-md border p-3" rows={3} />
        <input name="stage" placeholder="Stage" className="w-full rounded-md border p-3" />
        <input name="industry" placeholder="Industry" className="w-full rounded-md border p-3" />
        <input name="geography" placeholder="Geography" className="w-full rounded-md border p-3" />

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_public" defaultChecked />
          Visible to investors while subscription is active
        </label>

        <div className="flex gap-3">
          <button className="rounded-md bg-black px-4 py-2 text-white">Publish offer</button>
          <Link href="/my-offers" className="rounded-md border px-4 py-2">Cancel</Link>
        </div>
      </form>
    </main>
  )
}