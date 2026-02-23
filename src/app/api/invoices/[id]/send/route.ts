import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { Successes, Errors } from "@/lib/responses"
import { invoiceService } from "@/services/invoiceService"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return Errors.Unauthorized()

    const invoiceId = parseInt(params.id)
    if (isNaN(invoiceId)) {
      return Errors.Validation([{ message: "Invalid invoice ID" }])
    }

    const updatedInvoice = await invoiceService.sendInvoice(invoiceId, Number(auth.user?.id), auth.user?.role)

    return Successes.Ok(updatedInvoice)
  } catch (error: any) {
    if (error.message.includes('not found') || error.message.includes('access denied')) {
      return Errors.NotFound()
    }
    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return Errors.Validation([{ message: error.message }])
    }
    return Errors.Internal()
  }
}