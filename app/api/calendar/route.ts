import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { calculateMeetingCost } from "@/utils/calculateCost"
import { supabase } from "@/lib/supabase"

export async function GET(req: Request) {
  try {

    // =============================
    // Get authenticated user session
    // =============================

    const session: any = await getServerSession(authOptions)

    console.log("SESSION OBJECT:", JSON.stringify(session, null, 2))

    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const accessToken = session.accessToken

    // =============================
    // Get hourly rate from request
    // =============================

    const { searchParams } = new URL(req.url)
    const hourlyRateParam = searchParams.get("hourlyRate")

    const HOURLY_RATE = hourlyRateParam
      ? Number(hourlyRateParam)
      : 500

    // =============================
    // Calculate start of week (Monday)
    // =============================

    const now = new Date()
    const currentDay = now.getUTCDay()

    const distanceToMonday =
      currentDay === 0 ? -6 : 1 - currentDay

    const weekStartDate = new Date(now)

    weekStartDate.setUTCDate(
      now.getUTCDate() + distanceToMonday
    )

    weekStartDate.setUTCHours(0, 0, 0, 0)

    const timeMin = weekStartDate.toISOString()
    const timeMax = new Date().toISOString()

    console.log("Fetching events:", timeMin, "->", timeMax)

    // =============================
    // Fetch Google Calendar Events
    // =============================

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime&maxResults=250`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    )

    if (!res.ok) {

      const errorText = await res.text()

      console.error("Google API Error:", errorText)

      return NextResponse.json(
        {
          error: "Google Calendar API failed",
          details: errorText,
        },
        { status: res.status }
      )
    }

    const data = await res.json()

    const events = data.items || []

    console.log("Total events fetched:", events.length)

    // =============================
    // Clean & process events
    // =============================

    const cleanedEvents = events
      .map((event: any) => {

        if (!event.start?.dateTime || !event.end?.dateTime) {
          return null
        }

        const start = new Date(event.start.dateTime)
        const end = new Date(event.end.dateTime)

        const durationMinutes =
          (end.getTime() - start.getTime()) / (1000 * 60)

        // Skip invalid meetings
        if (durationMinutes <= 0 || durationMinutes > 480) {
          return null
        }

        const attendeesCount = event.attendees
          ? event.attendees.length
          : 1

        const cost = calculateMeetingCost(
          attendeesCount,
          durationMinutes,
          HOURLY_RATE
        )

        return {
          id: event.id,
          summary: event.summary || "Untitled Meeting",
          start: event.start.dateTime,
          durationMinutes,
          attendeesCount,
          cost,
        }

      })
      .filter(Boolean)

    // =============================
    // Aggregate statistics
    // =============================

    const totalMeetings = cleanedEvents.length

    const totalMinutes = cleanedEvents.reduce(
      (sum: number, meeting: any) =>
        sum + meeting.durationMinutes,
      0
    )

    const totalHours = totalMinutes / 60

    const totalWeeklyCost = cleanedEvents.reduce(
      (sum: number, meeting: any) =>
        sum + meeting.cost,
      0
    )

    const averageCost =
      totalMeetings > 0
        ? Math.round(totalWeeklyCost / totalMeetings)
        : 0

    const mostExpensiveMeeting =
      cleanedEvents.length > 0
        ? cleanedEvents.reduce((max: any, meeting: any) =>
            meeting.cost > max.cost ? meeting : max
          )
        : null

    // =============================
    // Save weekly stats to Supabase
    // =============================

    if (session?.user?.email) {

      const { error: upsertError } =
        await supabase
          .from("weekly_stats")
          .upsert(
            {
              user_email: session.user.email,
              week_start:
                weekStartDate
                  .toISOString()
                  .split("T")[0],
              total_cost: totalWeeklyCost,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_email,week_start" }
          )

      if (upsertError) {
        console.error(
          "Supabase Upsert Error:",
          upsertError
        )
      }
    }

    // =============================
    // Return API response
    // =============================

    return NextResponse.json({
      meetings: cleanedEvents,
      totalWeeklyCost,
      totalMeetings,
      totalHours,
      averageCost,
      mostExpensiveMeeting,
    })

  } catch (error) {

    console.error("CALENDAR API ERROR:", error)

    if (error instanceof Error) {
      console.error("MESSAGE:", error.message)
      console.error("STACK:", error.stack)
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: String(error),
      },
      { status: 500 }
    )
  }
}