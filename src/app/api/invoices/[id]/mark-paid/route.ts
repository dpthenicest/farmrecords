import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { invoiceService } from "@/services/invoiceService"

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const invoice = await invoiceService.markPaid(Number(params.id), Number(auth.user?.id), auth.user?.role)
    if (!invoice) return NextResponse.json({ error: "Not found or forbidden" }, { status: 404 })

    return NextResponse.json({ success: true, data: invoice })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
