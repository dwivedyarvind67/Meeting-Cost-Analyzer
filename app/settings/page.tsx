"use client"

import { useEffect, useState } from "react"

export default function SettingsPage() {
  const [hourlyRate, setHourlyRate] = useState<number>(500)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('hourlyRate')
    if (stored) setHourlyRate(Number(stored))
    // also try fetching server value
    fetch('/api/get-hourly-rate').then(r => r.json()).then(d => {
      if (d?.hourly_rate) {
        setHourlyRate(Number(d.hourly_rate))
        localStorage.setItem('hourlyRate', String(d.hourly_rate))
      }
    }).catch(()=>{})
  }, [])

  async function save() {
    setSaving(true)
    try {
      await fetch('/api/save-hourly-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hourlyRate })
      })
      localStorage.setItem('hourlyRate', String(hourlyRate))
    } catch (err) { console.error(err) }
    setSaving(false)
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="app-card p-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Hourly Rate (₹)</label>
        <div className="flex gap-3 items-center">
          <input type="number" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} className="border px-3 py-2 rounded" />
          <button onClick={save} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded">{saving ? 'Saving...' : 'Save'}</button>
        </div>
        <p className="mt-3 text-sm muted">This value is used to calculate meeting cost across the app.</p>
      </div>
    </div>
  )
}
