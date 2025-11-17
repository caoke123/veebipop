import type { Metadata } from 'next'
import { Instrument_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import '@/styles/styles.scss'
import ClientRoot from './ClientRoot'
import CountdownTimeType from '@/type/CountdownType'
import { countdownTime } from '@/store/countdownTime'

const serverTimeLeft: CountdownTimeType = countdownTime();

const instrument = Instrument_Sans({ subsets: ['latin'], adjustFontFallback: true, variable: '--font-instrument' })

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
  title: 'Anvogue',
  description: 'Multipurpose eCommerce Template',
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
