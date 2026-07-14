'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function createTag(formData: FormData) {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()
  const name = (formData.get('name') as string)?.trim()

  if (!name) {
    redirect('/admin/tags?error=Le nom est requis')
  }

  const { error } = await supabase.from('tags').insert({ name })

  if (error) {
    redirect('/admin/tags?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/tags')
  redirect('/admin/tags?message=Tag créé')
}

export async function updateTag(tagId: string, formData: FormData) {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()
  const name = (formData.get('name') as string)?.trim()

  if (!name) {
    throw new Error('Le nom est requis')
  }

  const { error } = await supabase.from('tags').update({ name }).eq('id', tagId)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/tags')
}

export async function deleteTagAction(formData: FormData) {
  const tagId = formData.get('tag_id') as string
  if (!tagId) return

  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from('tags').delete().eq('id', tagId)

  if (error) {
    redirect('/admin/tags?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/tags')
  redirect('/admin/tags?message=Tag supprimé')
}
