import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { Successes, Errors } from "@/lib/responses"
import { purchaseOrderService } from "@/services/purchaseOrderService"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return Errors.Unauthorized()

    const body = await req.json()
    
    // If body contains entity creation data, use the enhanced method
    if (body.items && body.items.length > 0) {
      const received = await purchaseOrderService.receivePurchaseOrderWithEntityCreation(
        Number(params.id),
        Number(auth.user?.id),
        auth.user?.role,
        {
          categoryId: body.categoryId,
          items: body.items
        }
      )

      if (!received) return Errors.NotFound()
      return Successes.Ok(received)
    }

    // Otherwise use the standard method
    const received = await purchaseOrderService.receivePurchaseOrder(
      Number(params.id),
      Number(auth.user?.id),
      auth.user?.role,
      body.categoryId
    )

    if (!received) return Errors.NotFound()
    return Successes.Ok(received)
  } catch (error: any) {
    console.error("Error receiving purchase order:", error)
    if (error.message === "Forbidden") return Errors.Forbidden()
    if (error.message === "Purchase order not found") return Errors.NotFound()
    return Errors.Internal(error.message)
  }
}
