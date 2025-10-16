/**
 * @fileoverview Root layout with SessionProvider for Next.js App Router
 * @version Next.js 15.5.4 / Auth.js v5 / Prisma 6.17.1
 * @author Bagizi-ID Development Team
 * @see {@link /docs/copilot-instructions.md} Development Guidelines
 */

import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    template: "%s | Bagizi-ID",
    default: "Bagizi-ID - SPPG Management Platform"
  },
  description: "Platform manajemen SPPG enterprise untuk program gizi di Indonesia. Kelola menu, procurement, produksi, dan distribusi dengan mudah dan efisien.",
  keywords: ["SPPG", "program gizi", "manajemen", "Indonesia", "nutrisi", "makanan", "sekolah"],
  authors: [{ name: "Bagizi-ID Development Team" }],
  creator: "Bagizi-ID",
  publisher: "Bagizi-ID",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://bagizi.id",
    title: "Bagizi-ID - SPPG Management Platform",
    description: "Platform manajemen SPPG enterprise untuk program gizi di Indonesia.",
    siteName: "Bagizi-ID"
  },
  twitter: {
    card: "summary_large_image",
    title: "Bagizi-ID - SPPG Management Platform",
    description: "Platform manajemen SPPG enterprise untuk program gizi di Indonesia."
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" }
  ]
}

interface RootLayoutProps {
  children: React.ReactNode
}

/**
 * Root layout with enterprise-grade providers and configuration
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
