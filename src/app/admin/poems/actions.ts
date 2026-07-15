'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

/**
 * Given new tag names from the form, ensure they exist in the tags table
 * and return their IDs, combined with the pre-existing tag IDs.
 */
async function resolveTagIds(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  formData: FormData,
): Promise<string[]> {
  const existingTagIds = formData.getAll('tag_ids') as string[]
  const newTagNames = formData.getAll('new_tag_names') as string[]

  if (newTagNames.length === 0) return existingTagIds

  // Create missing tags one by one (only the seed script's ensureTag pattern)
  const createdIds: string[] = []
  for (const name of newTagNames) {
    const trimmed = name.trim()
    if (!trimmed) continue

    // Check if it exists already (race-condition-safe via UNIQUE constraint)
    const { data: existing } = await supabase
      .from('tags')
      .select('id')
      .eq('name', trimmed)
      .maybeSingle()

    if (existing) {
      createdIds.push(existing.id)
    } else {
      const { data: created } = await supabase
        .from('tags')
        .insert({ name: trimmed })
        .select('id')
        .single()

      if (created) createdIds.push(created.id)
    }
  }

  return [...existingTagIds, ...createdIds]
}

export async function createPoem(formData: FormData) {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const title = formData.get('title') as string
  const content = formData.get('content') as string
  const authorId = formData.get('author_id') as string
  const collectionId = formData.get('collection_id') as string
  const position = formData.get('position_in_collection') as string
  const language = (formData.get('language') as string) || 'fr'
  const tagIds = await resolveTagIds(supabase, formData)

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
  const tagIds = await resolveTagIds(supabase, formData)

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
