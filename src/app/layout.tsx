import type { Metadata, Viewport } from 'next'
import { Geist, Literata, Crimson_Pro, Zilla_Slab } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import { PoemFontProvider } from '@/lib/use-preferences'
import './globals.css'

export const dynamic = 'force-dynamic'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const literata = Literata({
  variable: '--font-literata',
  subsets: ['latin'],
})

const crimsonPro = Crimson_Pro({
  variable: '--font-crimson-pro',
  subsets: ['latin'],
})

const zillaSlab = Zilla_Slab({
  variable: '--font-zilla-slab',
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
})

const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000'

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f4' },
    { media: '(prefers-color-scheme: dark)', color: '#1c1917' },
  ],
}

export const metadata: Metadata = {
  title: {
    default: 'Échos du Parnasse',
    template: '%s — Échos du Parnasse',
  },
  description: 'Bibliothèque numérique de poésie du domaine public.',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Échos du Parnasse',
    title: 'Échos du Parnasse',
    description: 'Bibliothèque numérique de poésie du domaine public.',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const fontVariables = `${geistSans.variable} ${literata.variable} ${crimsonPro.variable} ${zillaSlab.variable}`

  return (
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${fontVariables} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="parnasse:theme"
        >
          <PoemFontProvider>
            <SiteHeader />
            {children}
            <SiteFooter />
          </PoemFontProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
