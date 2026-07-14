'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function createCollection(formData: FormData) {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const title = formData.get('title') as string
  const authorId = formData.get('author_id') as string
  const year = formData.get('year') as string
  const description = formData.get('description') as string

  if (!title?.trim()) {
    redirect('/admin/collections/new?error=Le titre est requis')
  }

  const { error } = await supabase.from('collections').insert({
    title: title.trim(),
    author_id: authorId || null,
    year: year ? Number(year) : null,
    description: description?.trim() || null,
  })

  if (error) {
    redirect(
      '/admin/collections/new?error=' + encodeURIComponent(error.message),
    )
  }

  revalidatePath('/admin/collections')
  redirect('/admin/collections?message=Collection créée')
}

export async function updateCollection(
  collectionId: string,
  formData: FormData,
) {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const title = formData.get('title') as string
  const authorId = formData.get('author_id') as string
  const year = formData.get('year') as string
  const description = formData.get('description') as string

  if (!title?.trim()) {
    redirect(
      `/admin/collections/${collectionId}/edit?error=Le titre est requis`,
    )
  }

  const { error } = await supabase
    .from('collections')
    .update({
      title: title.trim(),
      author_id: authorId || null,
      year: year ? Number(year) : null,
      description: description?.trim() || null,
    })
    .eq('id', collectionId)

  if (error) {
    redirect(
      `/admin/collections/${collectionId}/edit?error=` +
        encodeURIComponent(error.message),
    )
  }

  revalidatePath('/admin/collections')
  redirect('/admin/collections?message=Collection mise à jour')
}

export async function deleteCollectionAction(formData: FormData) {
  const collectionId = formData.get('collection_id') as string
  if (!collectionId) return

  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', collectionId)

  if (error) {
    redirect('/admin/collections?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/collections')
  redirect('/admin/collections?message=Collection supprimée')
}
