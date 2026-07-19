'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export async function createAuthor(formData: FormData) {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const name = formData.get('name') as string
  const birthYear = formData.get('birth_year')
  const deathYear = formData.get('death_year')
  const bio = formData.get('bio') as string

  if (!name?.trim()) {
    redirect('/admin/authors/new?error=Le nom est requis')
  }

  const { error } = await supabase.from('authors').insert({
    name: name.trim(),
    birth_year: birthYear ? Number(birthYear) : null,
    death_year: deathYear ? Number(deathYear) : null,
    bio: bio?.trim() || null,
  })

  if (error) {
    redirect('/admin/authors/new?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/authors')
  redirect('/admin/authors?message=Auteur créé')
}

export async function updateAuthor(authorId: string, formData: FormData) {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const name = formData.get('name') as string
  const birthYear = formData.get('birth_year')
  const deathYear = formData.get('death_year')
  const bio = formData.get('bio') as string

  if (!name?.trim()) {
    redirect(`/admin/authors/${authorId}/edit?error=Le nom est requis`)
  }

  const { error } = await supabase
    .from('authors')
    .update({
      name: name.trim(),
      birth_year: birthYear ? Number(birthYear) : null,
      death_year: deathYear ? Number(deathYear) : null,
      bio: bio?.trim() || null,
    })
    .eq('id', authorId)

  if (error) {
    redirect(
      `/admin/authors/${authorId}/edit?error=` +
        encodeURIComponent(error.message),
    )
  }

  revalidatePath('/admin/authors')
  redirect('/admin/authors?message=Auteur mis à jour')
}

export async function deleteAuthor(authorId: string) {
  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  const { error } = await supabase.from('authors').delete().eq('id', authorId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/authors')
}

export async function deleteAuthorAction(formData: FormData) {
  const authorId = formData.get('author_id') as string
  if (!authorId) return

  await requireAdmin()

  const supabase = await createSupabaseServerClient()

  // Delete associated collections first
  const { error: collError } = await supabase
    .from('collections')
    .delete()
    .eq('author_id', authorId)
  if (collError) {
    redirect('/admin/authors?error=' + encodeURIComponent(collError.message))
  }

  const { error } = await supabase.from('authors').delete().eq('id', authorId)

  if (error) {
    redirect('/admin/authors?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/authors')
  revalidatePath('/admin/collections')
  redirect('/admin/authors?message=Auteur supprimé')
}
