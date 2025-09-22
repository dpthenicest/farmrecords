import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { dashboardService } from "@/services/dashboardService";

export async function GET() {
  const auth = await requireAuth();

  if (!auth.authorized) {
    return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
  }

  const { id, role } = auth.user;

  try {
    const isAdmin = role === "ADMIN";
    const metrics = await dashboardService.getProductionMetrics(isAdmin ? undefined : Number(id), isAdmin);

    return NextResponse.json({ success: true, data: metrics });
  } catch (error) {
    console.error("Error fetching production metrics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch production metrics" },
      { status: 500 }
    );
  }
}
