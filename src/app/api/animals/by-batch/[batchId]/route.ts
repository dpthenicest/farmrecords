import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getAnimalsByBatch } from "@/services/animalService"

// GET /api/animals/by-batch/:batchId
export async function GET(_: Request, { params }: { params: { batchId: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const animals = await getAnimalsByBatch(Number(params.batchId), Number(auth.user?.id), auth.user?.role)

    return NextResponse.json(animals)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
