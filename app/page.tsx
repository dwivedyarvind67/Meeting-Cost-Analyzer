"use client"

import { useEffect, useState } from "react"
import { signIn, signOut, useSession } from "next-auth/react"

export default function Home() {
  const { data: session } = useSession()

  const [stats, setStats] = useState<any>(null)
  const [hourlyRate, setHourlyRate] = useState<number>(500)

  useEffect(() => {
    // hydrate value immediately from localStorage, then fetch from server
    const stored = localStorage.getItem("hourlyRate")
    if (stored !== null) {
      setHourlyRate(Number(stored))
    }

    async function loadRate() {
      if (!session) return
      try {
        const res = await fetch("/api/get-hourly-rate")
        const result = await res.json()
        if (result.hourly_rate) {
          const num = Number(result.hourly_rate)
          setHourlyRate(num)
          localStorage.setItem("hourlyRate", String(num))
        }
      } catch (err) {
        console.error("Failed to load hourly rate", err)
      }
    }

    loadRate()

    if (session) {
      fetch(`/api/calendar?hourlyRate=${hourlyRate}`)
        .then((res) => res.json())
        .then((data) => {
          setStats(data)
        })
    }
  }, [session, hourlyRate])

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <button
          onClick={() => signIn("google")}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Login with Google
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Meeting Cost Dashboard
        </h1>
        <button
          onClick={() => signOut()}
          className="px-4 py-2 bg-red-500 text-white rounded"
        >
          Logout
        </button>
      </div>

      {/* Hourly Rate Input */}
      <div className="mb-8">
        <label className="font-semibold mr-4">
          Hourly Rate (₹)
        </label>
        <input
          type="number"
          value={hourlyRate}
          onChange={(e) => {
            const value = Number(e.target.value)
            setHourlyRate(value)
            localStorage.setItem("hourlyRate", String(value))
          }}
          onBlur={(e) => {
            const value = Number(e.target.value)
            fetch("/api/save-hourly-rate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ hourlyRate: value }),
            })
              .then(res => res.json())
              .then(data => console.log("SAVE RESPONSE:", data))
              .catch(err => console.error("Failed to save rate", err))
          }}
          className="border px-3 py-2 rounded"
        />
      </div>

      {stats && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card title="Total Meetings" value={stats.totalMeetings} />
            <Card title="Total Hours" value={stats.totalHours} />
            <Card title="Weekly Burn (₹)" value={stats.totalWeeklyCost} />
            <Card title="Avg Cost / Meeting (₹)" value={stats.averageCost} />
          </div>

          {stats.mostExpensiveMeeting && (
            <div className="mt-10 bg-white p-6 rounded shadow">
              <h2 className="font-semibold mb-2">
                🔥 Most Expensive Meeting
              </h2>
              <p>
                ₹{stats.mostExpensiveMeeting.cost} for{" "}
                {stats.mostExpensiveMeeting.durationMinutes} minutes
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function Card({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-gray-500 text-sm">{title}</h2>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  )
}