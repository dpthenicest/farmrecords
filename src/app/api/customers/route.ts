// app/api/customers/route.ts
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { Successes, Errors } from "@/lib/responses";
import * as customerService from "@/services/customerService";

export async function GET(req: Request) {
  try {
    const auth = await requireAuth();
    if (!auth.authorized) return Errors.Unauthorized();

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const order = (searchParams.get("order") || "desc") as "asc" | "desc";

    // Filtering
    const filters = {
      customerName: searchParams.get("customerName") || undefined,
      customerCode: searchParams.get("customerCode") || undefined,
      customerType: searchParams.get("customerType") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    };

    const result = await customerService.getCustomers(auth.user, { page, limit, sortBy, order, filters });

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
    const newCustomer = await customerService.createCustomer(auth.user, body);

    return Successes.Created(newCustomer);
  } catch (error: any) {
    if (error.message.includes('required') || error.message.includes('must be') || error.message.includes('Invalid user')) {
      return Errors.Validation([{ message: error.message }]);
    }
    return Errors.Internal();
  }
}
