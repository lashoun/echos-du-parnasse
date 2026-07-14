import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { requireSupabaseConfig } from './env'

export async function createSupabaseServerClient() {
  const { url, publishableKey } = requireSupabaseConfig()
  const cookieStore = await cookies()

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      setAll(cookiesToSet, _) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        } catch {
          // Called from a Server Component – safe to ignore when
          // the proxy.ts handles session refresh.
        }
      },
    },
  })
}
