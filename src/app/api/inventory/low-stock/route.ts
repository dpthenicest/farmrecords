// app/api/inventory/low-stock/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { inventoryService } from "@/services/inventoryService";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: auth.error } },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const threshold = Number(url.searchParams.get("threshold")) || 5;

    const items = await inventoryService.getLowStock(Number(auth.user?.id), auth.user?.role === "ADMIN");

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    console.error("Error fetching low stock items:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to fetch low stock items" } },
      { status: 500 }
    );
  }
}
