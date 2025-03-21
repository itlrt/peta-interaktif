import type React from "react"
import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Peta Interaktif LRT Jabodebek",
  description: "Peta interaktif untuk jalur LRT Jabodebek dengan stasiun-stasiun utama",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}

