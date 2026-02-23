import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { Successes, Errors } from "@/lib/responses"
import { purchaseOrderService } from "@/services/purchaseOrderService"

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return Errors.Unauthorized()

    const sent = await purchaseOrderService.sendPurchaseOrder(
      Number(params.id),
      Number(auth.user?.id),
      auth.user?.role
    )

    if (!sent) return Errors.NotFound()
    return Successes.Ok(sent)
  } catch (error) {
    console.error("Error sending purchase order:", error)
    return Errors.Internal()
  }
}
