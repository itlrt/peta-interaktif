import type React from "react"
import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Peta Interaktif LRT JABODEBEK",
  description: "Peta interaktif untuk jalur LRT JABODEBEK dengan stasiun-stasiun utama",
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

