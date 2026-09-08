import type { Metadata, Viewport } from 'next'
import { Noto_Sans, Noto_Sans_Devanagari } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'

const noto = Noto_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-noto',
  display: 'swap',
})

const deva = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  variable: '--font-deva',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'KrishiRakshak AI | Detect Early. Protect Your Crop.',
  description: 'AI-powered crop care for Indian farmers — scan, understand, prevent and find help.',
}

export const viewport: Viewport = {
  themeColor: '#1b3d2a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${noto.variable} ${deva.variable}`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&family=Noto+Sans+Gujarati:wght@400;600;700&family=Noto+Sans+Tamil:wght@400;600;700&family=Noto+Sans+Telugu:wght@400;600;700&family=Noto+Sans+Gurmukhi:wght@400;600;700&family=Noto+Sans+Kannada:wght@400;600;700&family=Noto+Sans+Malayalam:wght@400;600;700&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
