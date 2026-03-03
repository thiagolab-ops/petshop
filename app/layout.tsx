import './globals.css'
import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import SessionProviderWrapper from '@/components/session-provider-wrapper'
import { CartProvider } from '@/lib/cart-context'
import { hexToHsl } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const dynamic = 'force-dynamic'

const metadataBase = process.env.NEXTAUTH_URL
  ? new URL(process.env.NEXTAUTH_URL)
  : new URL('http://localhost:3000')

const appName = process.env.NEXT_PUBLIC_APP_NAME || 'Bela Pet'
const appDescription = process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Cuidado estético e bem-estar para o seu pet'
const themeColor = process.env.NEXT_PUBLIC_THEME_COLOR || '#D4AF37'
const secondaryColor = process.env.NEXT_PUBLIC_SECONDARY_COLOR || '#FADADD'

export const metadata: Metadata = {
  metadataBase,
  title: `${appName} - ${appDescription}`,
  description: appDescription,
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: appName,
  },
  openGraph: {
    title: `${appName} - ${appDescription}`,
    description: appDescription,
    images: ['/og-image.png'],
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const primaryHsl = hexToHsl(themeColor)
  const secondaryHsl = hexToHsl(secondaryColor)

  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content={themeColor} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary: ${primaryHsl};
              --secondary: ${secondaryHsl};
              --ring: ${primaryHsl};
              --border: ${primaryHsl};
            }
          `
        }} />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-brand-nude text-brand-dark min-h-screen flex flex-col w-full`}>
        <SessionProviderWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            forcedTheme="light"
          >
            <CartProvider>
              {children}
              <Toaster />
            </CartProvider>
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
