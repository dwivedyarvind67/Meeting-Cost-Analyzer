"use client"

export default function Sidebar() {
  return (
    <div className="fixed left-0 top-0 w-64 h-screen bg-white border-r shadow-sm p-6">

      <h2 className="text-2xl font-bold mb-10">
        Cost Analyzer
      </h2>

      <nav className="space-y-4">

        <a
          href="/dashboard"
          className="block p-3 rounded-lg hover:bg-gray-100"
        >
          Dashboard
        </a>

        <a
          href="/settings"
          className="block p-3 rounded-lg hover:bg-gray-100"
        >
          Settings
        </a>

      </nav>

    </div>
  )
}