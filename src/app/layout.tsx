import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import SiteHeader from '@/components/site-header'
import SiteFooter from '@/components/site-footer'
import './globals.css'

export const dynamic = 'force-dynamic'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const siteUrl = process.env.SITE_URL ?? 'http://localhost:3000'

export const viewport: Viewport = {
  themeColor: '#f5f5f4',
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
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  )
}
