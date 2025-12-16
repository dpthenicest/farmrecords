// app/api/inventory-movements/by-inventory/[inventoryId]/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { inventoryService } from "@/services/inventoryService";

export async function GET(req: Request, { params }: { params: { inventoryId: string } }) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: auth.error } },
        { status: 401 }
      );
    }

    const inventoryId = Number(params.inventoryId);
    if (isNaN(inventoryId)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_INPUT", message: "Invalid inventory ID" } },
        { status: 400 }
      );
    }

    const movements = await inventoryService.getMovementHistory(
      inventoryId,
      Number(auth.user?.id),
      auth.user?.role === "ADMIN"
    );

    return NextResponse.json({ success: true, data: movements });
  } catch (error) {
    console.error("Error fetching inventory movements:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch inventory movements" } },
      { status: 500 }
    );
  }
}