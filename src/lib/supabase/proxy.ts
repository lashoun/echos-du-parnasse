import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { requireSupabaseConfig } from './env'

export async function updateSession(request: NextRequest) {
  const { url, publishableKey } = requireSupabaseConfig()
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
        for (const [key, value] of Object.entries(headers)) {
          supabaseResponse.headers.set(key, value)
        }
      },
    },
  })

  // Keep session alive – do not remove this call.
  await supabase.auth.getClaims()

  return supabaseResponse
}
