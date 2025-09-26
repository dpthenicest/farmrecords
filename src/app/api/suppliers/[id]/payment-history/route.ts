// app/api/suppliers/[id]/payment-history/route.ts
import { NextResponse } from "next/server";
import { requireSelfOrRole } from "@/lib/auth";
import * as supplierService from "@/services/supplierService";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSelfOrRole(params.id, ["ADMIN"]);
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const history = await supplierService.getSupplierPayments(parseInt(params.id), { page, limit });
    return NextResponse.json(history, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
