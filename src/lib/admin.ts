import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export interface CurrentUser {
  id: string
  email: string | undefined
  isAdmin: boolean
}

/**
 * Returns the current authenticated user and whether they are an admin.
 * Returns null if not logged in — does not redirect.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: admin } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  return {
    id: user.id,
    email: user.email,
    isAdmin: admin !== null,
  }
}

/**
 * Requires the current user to be logged in and an admin.
 * Redirects to /login or / if the check fails.
 * Use in admin layouts and server actions.
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    redirect('/login')
  }

  if (!currentUser.isAdmin) {
    redirect('/')
  }

  return currentUser
}
