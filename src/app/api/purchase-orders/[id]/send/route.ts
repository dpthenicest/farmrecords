import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { purchaseOrderService } from "@/services/purchaseOrderService"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const sent = await purchaseOrderService.sendPurchaseOrder(
      Number(params.id),
      Number(auth.user?.id),
      auth.user?.role
    )

    if (!sent) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(sent)
  } catch (error) {
    console.error("Error sending purchase order:", error)
    return NextResponse.json({ error: "Failed to send purchase order" }, { status: 500 })
  }
}
