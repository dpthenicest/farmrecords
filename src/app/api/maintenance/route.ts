import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getMaintenance, createMaintenance } from "@/services/maintenanceService";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const url = new URL(req.url);
    const params = Object.fromEntries(url.searchParams.entries());

    const result = await getMaintenance(auth.user, {
      page: Number(params.page) || 1,
      limit: Number(params.limit) || 20,
      status: params.status,
      maintenanceType: params.maintenanceType,
      startDate: params.startDate,
      endDate: params.endDate,
      sortBy: params.sortBy,
      sortOrder: params.sortOrder as "asc" | "desc",
    });

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching maintenance:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 });
    }

    const body = await req.json();
    const record = await createMaintenance(body, Number(auth.user?.id));

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating maintenance:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
