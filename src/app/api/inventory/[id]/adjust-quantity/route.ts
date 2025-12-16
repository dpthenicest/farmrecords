// app/api/inventory/[id]/adjust-quantity/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { inventoryService } from "@/services/inventoryService";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await req.json();
    
    // Convert adjustment type to quantity change
    let quantityChange = Number(body.quantity);
    if (body.adjustmentType === "DECREASE") {
      quantityChange = -quantityChange;
    }
    
    const data = await inventoryService.adjustQuantity(
      Number(params.id),
      quantityChange,
      body.adjustmentType || "ADJUSTMENT",
      body.notes || "",
      Number(auth.user?.id),
      auth.user?.role === "ADMIN"
    );

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
