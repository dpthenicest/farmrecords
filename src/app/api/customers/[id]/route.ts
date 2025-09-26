// app/api/customers/[id]/route.ts
import { NextResponse } from "next/server";
import { requireSelfOrRole } from "@/lib/auth";
import * as customerService from "@/services/customerService";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSelfOrRole(params.id, ["ADMIN"]);
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 403 });

    const customer = await customerService.getCustomerById(auth.user, parseInt(params.id));
    return NextResponse.json(customer, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSelfOrRole(params.id, ["ADMIN"]);
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 403 });

    const body = await req.json();
    const updated = await customerService.updateCustomer(auth.user, parseInt(params.id), body);

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSelfOrRole(params.id, ["ADMIN"]);
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 403 });

    await customerService.deleteCustomer(parseInt(params.id));
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
