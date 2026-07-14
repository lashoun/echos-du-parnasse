'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { requireSupabaseConfig } from '@/lib/supabase/env'

/**
 * Delete the currently logged-in user's account.
 * Requires a confirmation text to prevent accidental deletion.
 */
export async function deleteAccount(formData: FormData) {
  const confirmation = formData.get('confirmation') as string
  if (confirmation !== 'SUPPRIMER') {
    redirect('/account?error=Confirmation invalide')
  }

  const config = requireSupabaseConfig()

  // Get the current user session
  const cookieStore = await cookies()
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          /* ignore */
        }
      },
    },
  })

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Use the service role client to delete the user from auth.users
  // This cascades to user_poem_status via ON DELETE CASCADE.
  const adminSupabase = createClient(
    config.url,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    },
  )

  const { error } = await adminSupabase.auth.admin.deleteUser(user.id)

  if (error) {
    redirect('/account?error=' + encodeURIComponent(error.message))
  }

  // Sign out locally to clear the session cookie
  await supabase.auth.signOut()

  redirect('/?message=' + encodeURIComponent('Compte supprimé'))
}
