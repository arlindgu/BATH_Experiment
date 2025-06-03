import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Header } from "@/components/header"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "OST-Vote - Community Feature Requests",
  description: "Reiche Feature-Requests ein und stimme über deine Lieblingsfunktionen ab",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de-CH">
      <body className={inter.className}>
        <Header />
        <main className="min-h-screen bg-background">{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
