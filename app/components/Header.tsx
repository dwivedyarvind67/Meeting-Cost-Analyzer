"use client"

import Link from "next/link"
import { signIn, signOut, useSession } from "next-auth/react"

export default function Header() {
  const { data: session } = useSession()

  return (
    <header className="w-full border-b py-4 mb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-2xl font-extrabold text-slate-800">MeetingCost</div>
          <nav className="hidden sm:flex gap-3 text-sm text-slate-600">
            <Link href="/">Home</Link>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/meetings">Meetings</Link>
            <Link href="/settings">Settings</Link>
          </nav>
        </div>

        <div>
          {session ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-700">{session.user?.name}</span>
              <button onClick={() => signOut()} className="px-3 py-1.5 bg-red-500 text-white rounded">Logout</button>
            </div>
          ) : (
            <button onClick={() => signIn("google")} className="px-3 py-1.5 bg-blue-600 text-white rounded">Sign in</button>
          )}
        </div>
      </div>
    </header>
  )
}
