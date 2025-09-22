import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { invoiceService } from "@/services/invoiceService"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const invoice = await invoiceService.getInvoiceById(Number(params.id), Number(auth.user?.id), auth.user?.role)
    if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json({ success: true, data: invoice })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const body = await req.json()
    const invoice = await invoiceService.updateInvoice(Number(params.id), Number(auth.user?.id), auth.user?.role, body)
    if (!invoice) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 })

    return NextResponse.json({ success: true, data: invoice })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const invoice = await invoiceService.deleteInvoice(Number(params.id), Number(auth.user?.id), auth.user?.role)
    if (!invoice) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
