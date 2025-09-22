// app/api/financial-records/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import {
  getFinancialRecordById,
  updateFinancialRecord,
  deleteFinancialRecord,
} from "@/services/financialRecordService";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { user } = auth;

  try {
    const record = await getFinancialRecordById(Number(params.id), Number(user?.id), user?.role);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: record });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { user } = auth;

  const body = await req.json();
  try {
    const record = await updateFinancialRecord(Number(params.id), body, Number(user?.id), user?.role);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: record });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });
  const { user } = auth;

  try {
    const record = await deleteFinancialRecord(Number(params.id), Number(user?.id), user?.role);
    if (!record) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: record });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 403 });
  }
}
