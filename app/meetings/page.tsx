"use client"

import { useEffect, useState } from "react"

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [hourlyRate, setHourlyRate] = useState<number>(500)

  useEffect(() => {
    const stored = localStorage.getItem("hourlyRate")
    if (stored) setHourlyRate(Number(stored))
    loadMeetings(Number(stored) || hourlyRate)
  }, [])

  async function loadMeetings(rate: number) {
    try {
      setLoading(true)
      const res = await fetch(`/api/calendar?hourlyRate=${rate}`)
      const data = await res.json()
      setMeetings(data.meetings || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function exportCsv() {
    const rows = [
      ["id","title","durationMinutes","attendeesCount","cost"],
      ...meetings.map(m => [m.id, m.title || "", m.durationMinutes, m.attendeesCount, m.cost])
    ]
    const csv = rows.map(r => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'meetings.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Meetings</h1>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            className="border rounded px-3 py-2"
          />
          <button onClick={() => loadMeetings(hourlyRate)} className="px-3 py-2 bg-indigo-600 text-white rounded">Refresh</button>
          <button onClick={exportCsv} className="px-3 py-2 bg-slate-700 text-white rounded">Export CSV</button>
        </div>
      </div>

      <div className="app-card p-6">
        {loading ? (
          <div>Loading meetings...</div>
        ) : meetings.length === 0 ? (
          <div className="text-muted">No meetings found</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-slate-500 border-b">
                <th className="py-2">Title</th>
                <th className="py-2">Duration (min)</th>
                <th className="py-2">Attendees</th>
                <th className="py-2">Cost (₹)</th>
              </tr>
            </thead>
            <tbody>
              {meetings.map(m => (
                <tr key={m.id} className="border-b hover:bg-slate-50">
                  <td className="py-2">{m.title || '—'}</td>
                  <td className="py-2">{m.durationMinutes}</td>
                  <td className="py-2">{m.attendeesCount}</td>
                  <td className="py-2 font-semibold">₹{m.cost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
