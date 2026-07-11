import { createBrowserClient } from '@supabase/ssr'
import { requireSupabaseConfig } from './env'

export function createSupabaseBrowserClient() {
  const { url, publishableKey } = requireSupabaseConfig()
  return createBrowserClient(url, publishableKey)
}
