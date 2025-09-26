import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { completeMaintenance } from "@/services/maintenanceService";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return NextResponse.json({ success: false, error: auth.error }, { status: 401 });

    const updated = await completeMaintenance(Number(params.id), auth.user);
    return NextResponse.json({ success: true, data: updated }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
