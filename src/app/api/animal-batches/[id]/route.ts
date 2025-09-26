import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getAnimalBatchById, updateAnimalBatch, deleteAnimalBatch } from "@/services/animalBatchService"

// GET /api/animal-batches/:id
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const batch = await getAnimalBatchById(Number(params.id), Number(auth.user?.id), auth.user?.role)
    if (!batch) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(batch)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/animal-batches/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const body = await req.json()
    const updated = await updateAnimalBatch(Number(params.id), Number(auth.user?.id), auth.user?.role, body)

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/animal-batches/:id
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const deleted = await deleteAnimalBatch(Number(params.id), Number(auth.user?.id), auth.user?.role)

    return NextResponse.json(deleted)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
