import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ThirdwebProvider } from 'thirdweb/react'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Trust Wallet AML Service',
  description: 'Verify USDT legal status and compliance with Trust Wallet AML Service',
  openGraph: {
    title: 'Trust Wallet AML Service',
    description: 'Verify USDT compliance with regulatory standards.',
    type: 'website',
  },
  icons: {
    icon: '/shield-icon.png',
    apple: '/shield-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased relative">
        <ThirdwebProvider>
          <div className="relative z-10">
            {children}
          </div>
        </ThirdwebProvider>
        <Analytics />

        {/* Tawk.to Chat Widget */}

      </body>
    </html>
  )
}
