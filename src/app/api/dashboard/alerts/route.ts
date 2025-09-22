import { NextResponse } from "next/server"
import { requireAuth, requireRole } from "@/lib/auth"
import { getAlertsForUser, getAggregatedAlerts } from "@/services/alertsService"

export async function GET() {
  // First check if user is authenticated
  const auth = await requireAuth()
  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
  }

  const {id, role} = auth?.user

  // If ADMIN → return aggregated alerts
  if (role === "ADMIN") {
    const data = await getAggregatedAlerts()
    return NextResponse.json({ success: true, data })
  }

  // Else → return alerts for logged-in user
  const data = await getAlertsForUser(Number(id))
  return NextResponse.json({ success: true, data })
}
