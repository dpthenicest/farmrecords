import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { Successes, Errors } from "@/lib/responses"
import { purchaseOrderService } from "@/services/purchaseOrderService"

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return Errors.Unauthorized()

    const order = await purchaseOrderService.getPurchaseOrderById(
      Number(params.id),
      Number(auth.user?.id),
      auth.user?.role
    )
    if (!order) return Errors.NotFound()

    return Successes.Ok(order)
  } catch (error) {
    console.error("Error fetching purchase order:", error)
    return Errors.Internal()
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return Errors.Unauthorized()

    const body = await req.json()
    const updated = await purchaseOrderService.updatePurchaseOrder(
      Number(params.id),
      Number(auth.user?.id),
      auth.user?.role,
      body
    )

    if (!updated) return Errors.NotFound()
    return Successes.Ok(updated)
  } catch (error: any) {
    console.error("Error updating purchase order:", error)
    if (error.message.includes('validation') || error.message.includes('required') || error.message.includes('invalid')) {
      return Errors.Validation([{ message: error.message }])
    }
    return Errors.Internal()
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return Errors.Unauthorized()

    const deleted = await purchaseOrderService.deletePurchaseOrder(
      Number(params.id),
      Number(auth.user?.id),
      auth.user?.role
    )

    if (!deleted) return Errors.NotFound()
    return Successes.Ok({ success: true })
  } catch (error) {
    console.error("Error deleting purchase order:", error)
    return Errors.Internal()
  }
}
