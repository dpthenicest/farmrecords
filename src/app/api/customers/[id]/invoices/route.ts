// app/api/customers/[id]/invoices/route.ts
import { NextResponse } from "next/server";
import { requireSelfOrRole } from "@/lib/auth";
import * as customerService from "@/services/customerService";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSelfOrRole(params.id, ["ADMIN"]);
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const invoices = await customerService.getCustomerInvoices(parseInt(params.id), { page, limit });
    return NextResponse.json(invoices, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
