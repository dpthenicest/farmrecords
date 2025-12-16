import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { Successes, Errors } from "@/lib/responses"
import { getAnimalById, updateAnimal, deleteAnimal } from "@/services/animalService"

// GET /api/animals/:id
export async function GET(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return Errors.Unauthorized()

    const animal = await getAnimalById(Number(params.id), Number(auth.user?.id), auth.user?.role)
    if (!animal) return Errors.NotFound()

    return Successes.Ok(animal)
  } catch (error: any) {
    return Errors.Internal()
  }
}

// PUT /api/animals/:id
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return Errors.Unauthorized()

    const body = await req.json()
    const animal = await updateAnimal(Number(params.id), Number(auth.user?.id), auth.user?.role, body)

    return Successes.Ok(animal)
  } catch (error: any) {
    if (error.message.includes('validation') || error.message.includes('required') || error.message.includes('invalid')) {
      return Errors.Validation([{ message: error.message }])
    }
    return Errors.Internal()
  }
}

// DELETE /api/animals/:id
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return Errors.Unauthorized()

    await deleteAnimal(Number(params.id), Number(auth.user?.id), auth.user?.role)

    return Successes.NoContent()
  } catch (error: any) {
    return Errors.Internal()
  }
}
