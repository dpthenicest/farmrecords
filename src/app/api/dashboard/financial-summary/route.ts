import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { dashboardService } from "@/services/dashboardService"

export async function GET() {
  const auth = await requireAuth()
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  try {
    let summary

    if (auth.user?.role === "ADMIN") {
      // ADMIN gets platform-wide summary
      summary = await dashboardService.getFinancialSummary(undefined, "ADMIN")
    } else {
      // Normal users only see their own
      summary = await dashboardService.getFinancialSummary(Number(auth.user?.id), "OWNER")
    }

    return NextResponse.json({ success: true, data: summary })
  } catch (error: any) {
    console.error("Error fetching financial summary:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch financial summary" },
      { status: 500 }
    )
  }
}
