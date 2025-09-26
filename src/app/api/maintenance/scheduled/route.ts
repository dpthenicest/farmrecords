import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getScheduledMaintenance } from "@/services/maintenanceService";

export async function GET() {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return NextResponse.json({ success: false, error: auth.error }, { status: 401 });

    const data = await getScheduledMaintenance(auth.user);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
