import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { purchaseOrderService } from "@/services/purchaseOrderService"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const order = await purchaseOrderService.getPurchaseOrderById(
      Number(params.id),
      Number(auth.user?.id),
      auth.user?.role
    )
    if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(order)
  } catch (error) {
    console.error("Error fetching purchase order:", error)
    return NextResponse.json({ error: "Failed to fetch purchase order" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
   if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const body = await req.json()
    const updated = await purchaseOrderService.updatePurchaseOrder(
      Number(params.id),
      Number(auth.user?.id),
      auth.user?.role,
      body
    )

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating purchase order:", error)
    return NextResponse.json({ error: "Failed to update purchase order" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const deleted = await purchaseOrderService.deletePurchaseOrder(
      Number(params.id),
      Number(auth.user?.id),
      auth.user?.role
    )

    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting purchase order:", error)
    return NextResponse.json({ error: "Failed to delete purchase order" }, { status: 500 })
  }
}
