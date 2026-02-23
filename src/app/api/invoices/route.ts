import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { Successes, Errors } from "@/lib/responses"
import { invoiceService } from "@/services/invoiceService"

export async function GET(req: Request) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return Errors.Unauthorized()

    const { searchParams } = new URL(req.url)
    const filters = Object.fromEntries(searchParams.entries())

    const result = await invoiceService.getInvoices(Number(auth.user?.id), (auth.user as any)?.role, filters)
    return Successes.Ok(result)
  } catch (err: any) {
    return Errors.Internal()
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return Errors.Unauthorized()

    const body = await req.json()
    const invoice = await invoiceService.createInvoice(Number(auth.user?.id), body)

    return Successes.Created(invoice)
  } catch (err: any) {
    if (err.message.includes('validation') || err.message.includes('required') || err.message.includes('invalid')) {
      return Errors.Validation([{ message: err.message }])
    }
    return Errors.Internal()
  }
}
