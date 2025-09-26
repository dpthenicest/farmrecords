// app/api/suppliers/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import * as supplierService from "@/services/supplierService";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = (searchParams.get("order") || "desc") as "asc" | "desc";

    const filters = {
      supplierName: searchParams.get("supplierName") || undefined,
      supplierCode: searchParams.get("supplierCode") || undefined,
      supplierType: searchParams.get("supplierType") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    const result = await supplierService.getSuppliers(auth.user, { page, limit, sortBy, order, filters });

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

    const body = await req.json();
    const newSupplier = await supplierService.createSupplier(auth.user, body);

    return NextResponse.json({ success: true, data: newSupplier }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
