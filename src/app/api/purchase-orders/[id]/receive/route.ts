import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { purchaseOrderService } from "@/services/purchaseOrderService"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const received = await purchaseOrderService.receivePurchaseOrder(
      Number(params.id),
      Number(auth.user?.id),
      auth.user?.role
    )

    if (!received) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(received)
  } catch (error) {
    console.error("Error receiving purchase order:", error)
    return NextResponse.json({ error: "Failed to receive purchase order" }, { status: 500 })
  }
}
