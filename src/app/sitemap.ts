import type { MetadataRoute } from 'next'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createSupabaseServerClient()

  // Fetch all dynamic routes
  const [
    { data: poems },
    { data: collections },
    { data: authors },
    { data: tags },
  ] = await Promise.all([
    supabase.from('poems').select('id'),
    supabase.from('collections').select('id'),
    supabase.from('authors').select('id'),
    supabase.from('tags').select('id'),
  ])

  const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000'

  // Static routes
  const staticRoutes = ['/', '/poems', '/about', '/privacy', '/legal'].map(
    (path) => ({
      url: `${siteUrl}${path}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: path === '/' ? 1 : 0.5,
    }),
  )

  // Dynamic routes
  const poemRoutes = (poems ?? []).map((p) => ({
    url: `${siteUrl}/poems/${p.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const collectionRoutes = (collections ?? []).map((c) => ({
    url: `${siteUrl}/collections/${c.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const authorRoutes = (authors ?? []).map((a) => ({
    url: `${siteUrl}/authors/${a.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const tagRoutes = (tags ?? []).map((t) => ({
    url: `${siteUrl}/tags/${t.id}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.3,
  }))

  return [
    ...staticRoutes,
    ...poemRoutes,
    ...collectionRoutes,
    ...authorRoutes,
    ...tagRoutes,
  ]
}
