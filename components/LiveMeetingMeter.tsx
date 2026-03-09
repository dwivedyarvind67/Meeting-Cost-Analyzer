"use client"

import { useEffect, useState } from "react"

export default function LiveMeetingMeter({
  attendees,
  hourlyRate
}: {
  attendees: number
  hourlyRate: number
}) {

  const [seconds, setSeconds] = useState(0)

  useEffect(() => {

    const timer = setInterval(() => {
      setSeconds(prev => prev + 1)
    }, 1000)

    return () => clearInterval(timer)

  }, [])

  const costPerSecond =
    (attendees * hourlyRate) / 3600

  const totalCost =
    seconds * costPerSecond

  return (

    <div className="bg-red-100 p-6 rounded shadow text-center">

      <h2 className="text-xl font-bold mb-3">
        Live Meeting Cost
      </h2>

      <p className="text-3xl font-bold text-red-600">
        ₹{totalCost.toFixed(2)}
      </p>

      <p className="text-sm text-gray-500 mt-2">
        {attendees} people in meeting
      </p>

    </div>
  )
}