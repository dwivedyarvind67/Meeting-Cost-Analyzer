import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {

    // =============================
    // Get authenticated session
    // =============================

    const session: any = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      )
    }

    const userEmail = session.user.email

    console.log("Fetching hourly rate for:", userEmail)

    // =============================
    // Fetch user settings
    // =============================

    const { data, error } = await supabase
      .from("user_settings")
      .select("hourly_rate")
      .eq("user_email", userEmail)
      .maybeSingle()

    if (error) {
      console.error("Supabase fetch error:", error)

      // return safe fallback
      return NextResponse.json({
        hourlyRate: 500
      })
    }

    // =============================
    // If user settings do not exist
    // create default settings
    // =============================

    if (!data) {

      console.log("Creating default settings")

      const { error: insertError } = await supabase
        .from("user_settings")
        .insert({
          user_email: userEmail,
          hourly_rate: 500,
          created_at: new Date().toISOString(),
        })

      if (insertError) {
        console.error(
          "Error creating default settings:",
          insertError
        )
      }

      return NextResponse.json({
        hourlyRate: 500
      })
    }

    // =============================
    // Return existing hourly rate
    // =============================

    return NextResponse.json({
      hourlyRate: data.hourly_rate ?? 500
    })

  } catch (error) {

    console.error(
      "Error in get-hourly-rate API:",
      error
    )

    // Always return fallback value
    return NextResponse.json({
      hourlyRate: 500
    })
  }
}