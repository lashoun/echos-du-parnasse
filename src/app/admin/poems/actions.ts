'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function createPoem(formData: FormData) {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const authorId = formData.get('author_id') as string
  const collectionId = formData.get('collection_id') as string
  const position = formData.get('position_in_collection') as string
  const language = (formData.get('language') as string) || 'fr'
  const tagIds = formData.getAll('tag_ids') as string[]

  if (!title?.trim()) {
    redirect('/admin/poems/new?error=Le titre est requis')
  }

  if (!content?.trim()) {
    redirect('/admin/poems/new?error=Le contenu est requis')
  }

  const { data: poem, error } = await supabase
    .from('poems')
    .insert({
      title: title.trim(),
      content: content.trim(),
      author_id: authorId || null,
      collection_id: collectionId || null,
      position_in_collection: position ? Number(position) : null,
      language,
    })
    .select('id')
    .single()

  if (error) {
    redirect('/admin/poems/new?error=' + encodeURIComponent(error.message))
  }

  // Link tags
  if (poem && tagIds.length > 0) {
    const { error: tagError } = await supabase
      .from('poem_tags')
      .insert(tagIds.map((tagId) => ({ poem_id: poem.id, tag_id: tagId })))

    if (tagError) {
      redirect('/admin/poems/new?error=' + encodeURIComponent(tagError.message))
    }
  }

  revalidatePath('/admin/poems')
  redirect('/admin/poems?message=Poème créé')
}

export async function updatePoem(poemId: string, formData: FormData) {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const authorId = formData.get('author_id') as string
  const collectionId = formData.get('collection_id') as string
  const position = formData.get('position_in_collection') as string
  const language = (formData.get('language') as string) || 'fr'
  const tagIds = formData.getAll('tag_ids') as string[]

  if (!title?.trim()) {
    redirect(`/admin/poems/${poemId}/edit?error=Le titre est requis`)
  }

  if (!content?.trim()) {
    redirect(`/admin/poems/${poemId}/edit?error=Le contenu est requis`)
  }

  const { error } = await supabase
    .from('poems')
    .update({
      title: title.trim(),
      content: content.trim(),
      author_id: authorId || null,
      collection_id: collectionId || null,
      position_in_collection: position ? Number(position) : null,
      language,
    })
    .eq('id', poemId)

  if (error) {
    redirect(
      `/admin/poems/${poemId}/edit?error=` + encodeURIComponent(error.message),
    )
  }

  // Replace tags: delete existing, insert new
  await supabase.from('poem_tags').delete().eq('poem_id', poemId)

  if (tagIds.length > 0) {
    const { error: tagError } = await supabase
      .from('poem_tags')
      .insert(tagIds.map((tagId) => ({ poem_id: poemId, tag_id: tagId })))

    if (tagError) {
      redirect(
        `/admin/poems/${poemId}/edit?error=` +
          encodeURIComponent(tagError.message),
      )
    }
  }

  revalidatePath('/admin/poems')
  redirect('/admin/poems?message=Poème mis à jour')
}

export async function deletePoemAction(formData: FormData) {
  const poemId = formData.get('poem_id') as string
  if (!poemId) return

  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from('poems').delete().eq('id', poemId)

  if (error) {
    redirect('/admin/poems?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/poems')
  redirect('/admin/poems?message=Poème supprimé')
}
