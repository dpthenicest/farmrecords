import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { purchaseOrderService } from "@/services/purchaseOrderService"

export async function GET(req: Request) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 });

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
      auth.user?.role,
      filters
    )

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching purchase orders:", error)
    return NextResponse.json({ error: "Failed to fetch purchase orders" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const body = await req.json()
    const po = await purchaseOrderService.createPurchaseOrder(Number(auth.user?.id), body)

    return NextResponse.json(po)
  } catch (error) {
    console.error("Error creating purchase order:", error)
    return NextResponse.json({ error: "Failed to create purchase order" }, { status: 500 })
  }
}
