import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { invoiceService } from "@/services/invoiceService"

export async function GET(req: Request) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const filters = Object.fromEntries(searchParams.entries())

    const result = await invoiceService.getInvoices(Number(auth.user?.id), auth.user?.role, filters)
    return NextResponse.json({ success: true, ...result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const body = await req.json()
    const invoice = await invoiceService.createInvoice(Number(auth.user?.id), body)

    return NextResponse.json({ success: true, data: invoice }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
