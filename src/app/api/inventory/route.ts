// app/api/inventory/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { inventoryService } from "@/services/inventoryService";

// app/api/inventory/route.ts
export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error }, { status: 401 });
    }

    console.log('Auth user:', auth.user); // Debug log

    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 20);
    const category = searchParams.get("category") || undefined;
    const lowStock = searchParams.get("lowStock") === "true";
    const search = searchParams.get("search") || undefined;

    console.log('Query params:', { page, limit, category, lowStock, search }); // Debug log

    const data = await inventoryService.getAll({
      page,
      limit,
      category,
      lowStock,
      search,
      userId: Number(auth.user?.id),
      isAdmin: auth.user?.role === "ADMIN",
    });

    console.log('Data result:', { 
      itemCount: data.items.length, 
      total: data.pagination.total 
    }); // Debug log

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Inventory API error:', err); // Debug log
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: auth.error } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const item = await inventoryService.create(body, Number(auth.user?.id));

    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to create inventory item" } },
      { status: 500 }
    );
  }
}