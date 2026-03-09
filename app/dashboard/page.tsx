"use client"

import Sidebar from "@/components/Sidebar"
import { useEffect, useState } from "react"
import LiveMeetingMeter from "@/components/LiveMeetingMeter"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts"

export default function Dashboard() {

  const [stats, setStats] = useState<any>({
    meetings: [],
    totalWeeklyCost: 0,
    totalMeetings: 0,
    totalHours: 0,
    averageCost: 0,
    mostExpensiveMeeting: null
  })

  const [hourlyRate, setHourlyRate] = useState(500)

  async function loadData() {

    // 🔹 FIX 1: include credentials
    const rateRes = await fetch("/api/get-hourly-rate", {
      credentials: "include"
    })

    const rateData = await rateRes.json()

    const rate = rateData.hourlyRate || 500
    setHourlyRate(rate)

    // 🔹 FIX 2: include credentials
    const res = await fetch(`/api/calendar?hourlyRate=${rate}`, {
      credentials: "include"
    })

    const data = await res.json()

    setStats(data)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Chart Data
  const chartData = (stats?.meetings || []).map((m: any, i: number) => ({
    name: `M${i + 1}`,
    cost: m.cost
  }))

  return (
    <div className="flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-64 w-full min-h-screen bg-gray-100 p-10">

        <h1 className="text-3xl font-bold mb-2">
          Meeting Cost Dashboard
        </h1>

        <p className="text-gray-500 mb-8">
          Track the real cost of meetings in your organization
        </p>

        {/* Analytics Cards */}

        <div className="grid grid-cols-4 gap-6 mb-10">

          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
            <p className="text-gray-500">Weekly Burn</p>
            <p className="text-3xl font-bold">
              ₹{stats.totalWeeklyCost}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
            <p className="text-gray-500">Total Meetings</p>
            <p className="text-3xl font-bold">
              {stats.totalMeetings}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
            <p className="text-gray-500">Total Hours</p>
            <p className="text-3xl font-bold">
              {Number(stats.totalHours || 0).toFixed(1)}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border hover:shadow-md transition">
            <p className="text-gray-500">Average Cost</p>
            <p className="text-3xl font-bold">
              ₹{stats.averageCost}
            </p>
          </div>

        </div>

        {/* Live Meeting Meter */}

        <div className="mb-10">
          <LiveMeetingMeter
            attendees={5}
            hourlyRate={hourlyRate}
          />
        </div>

        {/* Chart */}

        <div className="bg-white p-6 rounded-2xl shadow-sm border mb-10">

          <h2 className="text-xl font-bold mb-4">
            Meeting Cost Chart
          </h2>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cost" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>

        </div>

        {/* Meeting Table */}

        <div className="bg-white p-6 rounded-2xl shadow-sm border">

          <h2 className="text-xl font-bold mb-4">
            Meetings This Week
          </h2>

          <table className="w-full">

            <thead>
              <tr className="text-left text-gray-500">
                <th>Meeting</th>
                <th>Duration</th>
                <th>Attendees</th>
                <th>Cost</th>
              </tr>
            </thead>

            <tbody>

              {(stats?.meetings || []).map((m: any) => (
                <tr key={m.id} className="border-t">

                  <td>{m.summary}</td>

                  <td>
                    {Math.round(m.durationMinutes)} min
                  </td>

                  <td>{m.attendeesCount}</td>

                  <td className="font-bold">
                    ₹{Math.round(m.cost)}
                  </td>

                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>
    </div>
  )
}