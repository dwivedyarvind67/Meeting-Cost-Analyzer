"use client"

import { SessionProvider } from "next-auth/react"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <div className="min-h-screen flex flex-col bg-linear-to-b from-slate-50 to-white">
            <Header />
            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  )
}