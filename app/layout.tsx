import './globals.css'
import { Playfair_Display, Great_Vibes } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'] })
const greatVibes = Great_Vibes({ weight: '400', subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={playfair.className}>
        {children}
      </body>
    </html>
  )
}