import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { dashboardService } from "@/services/dashboardService";

export async function GET(req: Request) {
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
      // ADMIN gets platform-wide overview
      data = await dashboardService.getOverview(undefined, "ADMIN");
    } else {
      // Normal users only see their own
      data = await dashboardService.getOverview(Number(auth.user.id), "OWNER");
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
