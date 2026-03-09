export function calculateMeetingCost(
  attendees: number,
  durationMinutes: number,
  hourlyRate: number
) {
  const baseCost = attendees * hourlyRate * (durationMinutes / 60)
  const fullyLoadedCost = baseCost * 1.3
  return Math.round(fullyLoadedCost)
}