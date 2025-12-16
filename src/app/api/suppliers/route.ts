// app/api/suppliers/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { Successes, Errors } from "@/lib/responses";
import * as supplierService from "@/services/supplierService";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return Errors.Unauthorized();

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

    return Successes.Ok(result);
  } catch (error: any) {
    return Errors.Internal();
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return Errors.Unauthorized();

    const body = await req.json();
    const newSupplier = await supplierService.createSupplier(auth.user, body);

    return Successes.Created(newSupplier);
  } catch (error: any) {
    if (error.message.includes('validation') || error.message.includes('required') || error.message.includes('invalid')) {
      return Errors.Validation([{ message: error.message }]);
    }
    return Errors.Internal();
  }
}
