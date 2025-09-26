// app/api/suppliers/[id]/route.ts
import { NextResponse } from "next/server";
import { requireSelfOrRole } from "@/lib/auth";
import * as supplierService from "@/services/supplierService";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSelfOrRole(params.id, ["ADMIN"]);
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 403 });

    const supplier = await supplierService.getSupplierById(auth.user, parseInt(params.id));
    return NextResponse.json(supplier, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSelfOrRole(params.id, ["ADMIN"]);
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 403 });

    const body = await req.json();
    const updated = await supplierService.updateSupplier(auth.user, parseInt(params.id), body);

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSelfOrRole(params.id, ["ADMIN"]);
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 403 });

    await supplierService.deleteSupplier(parseInt(params.id));
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
