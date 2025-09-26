import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { getAnimalById, updateAnimal, deleteAnimal } from "@/services/animalService"

// GET /api/animals/:id
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const animal = await getAnimalById(Number(params.id), Number(auth.user?.id), auth.user?.role)
    if (!animal) return NextResponse.json({ error: "Not found" }, { status: 404 })

    return NextResponse.json(animal)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/animals/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const body = await req.json()
    const animal = await updateAnimal(Number(params.id), Number(auth.user?.id), auth.user?.role, body)

    return NextResponse.json(animal)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/animals/:id
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const deleted = await deleteAnimal(Number(params.id), Number(auth.user?.id), auth.user?.role)

    return NextResponse.json(deleted)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
