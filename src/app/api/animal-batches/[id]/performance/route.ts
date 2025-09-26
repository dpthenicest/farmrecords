import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getBatchPerformance } from "@/services/animalBatchService"

// GET /api/animal-batches/:id/performance
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const performance = await getBatchPerformance(Number(params.id), Number(auth.user?.id), auth.user?.role)
    if (!performance) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(performance)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
