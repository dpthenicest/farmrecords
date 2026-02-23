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

  // Disable manual financial record creation
  // Financial records are now automatically created from invoices and purchase orders
  return NextResponse.json(
    {
      success: false,
      error: {
        code: "MANUAL_CREATION_DISABLED",
        message: "Manual financial record creation is disabled. Financial records are automatically created when invoices are sent/paid or purchase orders are received."
      }
    },
    { status: 403 }
  );
}
