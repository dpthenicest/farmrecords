import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { dashboardService } from "@/services/dashboardService";

export async function GET() {
  try {
    const auth = await requireAuth();

    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { success: false, message: auth.error || "Unauthorized" },
        { status: 401 }
      );
    }

    let data;
    if (auth.user.role === "ADMIN") {
      // ADMIN gets platform-wide performance reports
      data = await dashboardService.getPerformanceReports(undefined, "ADMIN");
    } else {
      // Normal users only see their own
      data = await dashboardService.getPerformanceReports(Number(auth.user.id), "OWNER");
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Dashboard performance reports error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}