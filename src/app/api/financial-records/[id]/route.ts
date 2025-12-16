// app/api/financial-records/[id]/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { Successes, Errors } from "@/lib/responses";
import {
  getFinancialRecordById,
  updateFinancialRecord,
  deleteFinancialRecord,
} from "@/services/financialRecordService";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.authorized) return Errors.Unauthorized();
  const { user } = auth;

  try {
    const record = await getFinancialRecordById(Number(params.id), Number(user?.id), (user as any)?.role);
    if (!record) return Errors.NotFound();
    return Successes.Ok(record);
  } catch (err: any) {
    return Errors.Forbidden();
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.authorized) return Errors.Unauthorized();
  const { user } = auth;

  const body = await req.json();
  try {
    const record = await updateFinancialRecord(Number(params.id), body, Number(user?.id), (user as any)?.role);
    if (!record) return Errors.NotFound();
    return Successes.Ok(record);
  } catch (err: any) {
    return Errors.Forbidden();
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.authorized) return Errors.Unauthorized();
  const { user } = auth;

  try {
    const record = await deleteFinancialRecord(Number(params.id), Number(user?.id), (user as any)?.role);
    if (!record) return Errors.NotFound();
    return Successes.NoContent();
  } catch (err: any) {
    return Errors.Forbidden();
  }
}
