'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/admin'
import { createClient } from '@supabase/supabase-js'
import { requireSupabaseConfig } from '@/lib/supabase/env'

function createAdminClient() {
  const config = requireSupabaseConfig()
  return createClient(config.url, process.env.SUPABASE_SECRET_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export async function addAdmin(formData: FormData) {
  await requireAdmin()

  const adminSupabase = createAdminClient()
  const email = (formData.get('email') as string)?.trim()

  if (!email) {
    redirect("/admin/admins?error=L'email est requis")
  }

  // Use service role client to list users by email
  const { data: users, error: listError } =
    await adminSupabase.auth.admin.listUsers()

  if (listError) {
    redirect('/admin/admins?error=' + encodeURIComponent(listError.message))
  }

  const user = users?.users?.find((u) => u.email === email)

  if (!user) {
    redirect('/admin/admins?error=Aucun utilisateur trouvé avec cet email')
  }

  const { error } = await adminSupabase.from('admin_users').insert({
    user_id: user.id,
  })

  if (error) {
    redirect('/admin/admins?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/admins')
  redirect(
    '/admin/admins?message=' + encodeURIComponent('Administrateur ajouté'),
  )
}

export async function removeAdminAction(formData: FormData) {
  const userId = formData.get('user_id') as string
  if (!userId) return

  await requireAdmin()

  const adminSupabase = createAdminClient()

  const { error } = await adminSupabase
    .from('admin_users')
    .delete()
    .eq('user_id', userId)

  if (error) {
    redirect('/admin/admins?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/admin/admins')
  redirect(
    '/admin/admins?message=' + encodeURIComponent('Administrateur retiré'),
  )
}
