import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { Successes, Errors } from "@/lib/responses"
import { purchaseOrderService } from "@/services/purchaseOrderService"

export async function GET(req: Request) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return Errors.Unauthorized();

    const url = new URL(req.url)
    const filters = {
      page: Number(url.searchParams.get("page")) || 1,
      limit: Number(url.searchParams.get("limit")) || 20,
      poNumber: url.searchParams.get("poNumber") || undefined,
      status: url.searchParams.get("status") || undefined,
      startDate: url.searchParams.get("startDate") || undefined,
      endDate: url.searchParams.get("endDate") || undefined,
      sortBy: url.searchParams.get("sortBy") || "createdAt",
      sortOrder: (url.searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    }

    const data = await purchaseOrderService.getPurchaseOrders(
      Number(auth.user?.id),
      (auth.user as any)?.role,
      filters
    )

    return Successes.Ok(data)
  } catch (error) {
    console.error("Error fetching purchase orders:", error)
    return Errors.Internal()
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return Errors.Unauthorized()

    const body = await req.json()
    const po = await purchaseOrderService.createPurchaseOrder(Number(auth.user?.id), body)

    return Successes.Created(po)
  } catch (error: any) {
    console.error("Error creating purchase order:", error)
    if (error.message.includes('validation') || error.message.includes('required') || error.message.includes('invalid')) {
      return Errors.Validation([{ message: error.message }])
    }
    return Errors.Internal()
  }
}
