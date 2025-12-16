// app/api/financial-records/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { Successes, Errors } from "@/lib/responses";
import { getFinancialRecords, createFinancialRecord } from "@/services/financialRecordService";

export async function GET(req: Request) {
  const auth = await requireAuth();
  if (!auth.authorized) return Errors.Unauthorized();

  const { user } = auth;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const type = searchParams.get("type")?.toUpperCase() as "INCOME" | "EXPENSE" || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const transactionType = searchParams.get("transactionType") || undefined;
  const categoryId = searchParams.get("categoryId")
    ? parseInt(searchParams.get("categoryId")!)
    : undefined;

  const data = await getFinancialRecords({
    userId: Number(user?.id),
    role: user?.role,
    page,
    limit,
    type,
    startDate,
    endDate,
    categoryId,
    transactionType
  });

  return Successes.Ok(data);
}

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (!auth.authorized) return Errors.Unauthorized();

  const { user } = auth;

  try {
    const body = await req.json();
    const record = await createFinancialRecord(body, Number(user?.id));
    return Successes.Created(record);
  } catch (err: any) {
    if (err.message.includes('validation') || err.message.includes('required') || err.message.includes('invalid')) {
      return Errors.Validation([{ message: err.message }]);
    }
    return Errors.Internal();
  }
}
