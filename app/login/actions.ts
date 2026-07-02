'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function loginAction(formData: FormData) {
  const supabase = createClient()
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)

  redirect('/dashboard')
}

export async function signupAction(formData: FormData) {
  const supabase = createClient()
  const email = String(formData.get('email') || '')
  const password = String(formData.get('password') || '')
  const name = String(formData.get('name') || '')

  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw new Error(error.message)

  const user = data.user
  if (user) {
    await supabase.from('profiles').upsert({
      id: user.id,
      email,
      name,
      plan: 'free'
    })
  }

  redirect('/dashboard')
}