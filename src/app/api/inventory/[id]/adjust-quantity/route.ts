// app/api/inventory/[id]/adjust-quantity/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { inventoryService } from "@/services/inventoryService";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await req.json();
    const data = await inventoryService.adjustQuantity(
      Number(params.id),
      Number(body.quantity),
      body.movementType,
      body.notes,
      Number(auth.user?.id),
      auth.user?.role === "ADMIN"
    );

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
