import type { Metadata } from 'next'
import { Instrument_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import '@/styles/styles.scss'
import ClientRoot from './ClientRoot'
import CountdownTimeType from '@/type/CountdownType'
import { countdownTime } from '@/store/countdownTime'

const serverTimeLeft: CountdownTimeType = countdownTime();

const instrument = Instrument_Sans({ 
  subsets: ['latin'], 
  adjustFontFallback: false, // Disable font fallback to avoid the error
  variable: '--font-instrument',
  display: 'swap',
})

// Load icomoon icon font via next/font/local with display swap
const icomoon = localFont({
  src: [
    // Prefer modern formats; keep woff, remove ttf fallback to reduce font swap CLS
    { path: '../styles/icomoon/fonts/icomoon.woff', weight: '400', style: 'normal' },
    // If a woff2 file is added later, include it here for best performance
    // { path: '../styles/icomoon/fonts/icomoon.woff2', weight: '400', style: 'normal' },
  ],
  variable: '--font-icomoon',
  display: 'swap',
  preload: true,
  adjustFontFallback: 'Arial',
})

export const metadata: Metadata = {
  title: 'Selmi Toys - Factory-Direct Custom Plush Toys & Accessories Manufacturer',
  description: 'Leading factory-direct manufacturer of custom plush toys, stuffed animals, and fashion accessories. We provide wholesale OEM/ODM services for global brands. Get a direct quote today.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://veebipop.com',
  },
  openGraph: {
    title: 'Selmi Toys | Your Factory-Direct Partner for Custom Plushies',
    description: 'Bring your designs to life! We are a premier manufacturer specializing in high-quality, custom-made plush toys and fashion accessories for brands worldwide. Factory-direct pricing and quality guaranteed.',
    type: 'website',
    url: 'https://www.veebipop.com/',
    images: [
      {
        url: 'https://image.veebipop.com/og-selmi-wholesale.jpg',
        width: 1200,
        height: 630,
      },
    ],
    siteName: 'Selmi Wholesale',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Selmi - Plush Dolls & Charms Wholesale Source Factory',
    description: '50pcs MOQ · Free samples · OEM/ODM · Global shipping from China',
    images: ['https://image.veebipop.com/twitter-og.jpg'],
  },
  other: {
    'pinterest-rich-pin': 'true',
    'product:brand': 'Selmi',
    'product:availability': 'in stock',
    'product:condition': 'new',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
        <html lang="en" className={`${instrument.variable} ${icomoon.variable}`}>
          <body className="font-sans">
        <ClientRoot serverTimeLeft={serverTimeLeft}>
          {children}
        </ClientRoot>
          </body>
        </html>
      )
}
