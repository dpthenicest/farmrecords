import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { Successes, Errors } from "@/lib/responses"
import {
  getAnimals,
  createAnimal,
} from "@/services/animalService"

// GET /api/animals
export async function GET(req: Request) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return Errors.Unauthorized()

    const { searchParams } = new URL(req.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    const filters = {
      species: searchParams.get("species") || undefined,
      breed: searchParams.get("breed") || undefined,
      gender: searchParams.get("gender") || undefined,
      healthStatus: searchParams.get("healthStatus") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || undefined,
    }

    const animals = await getAnimals(Number(auth.user?.id), auth.user?.role, filters, { page, limit })
    return Successes.Ok(animals)
  } catch (error: any) {
    return Errors.Internal()
  }
}

// POST /api/animals
export async function POST(req: Request) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return Errors.Unauthorized()

    const body = await req.json()
    const animal = await createAnimal(Number(auth.user?.id), body)

    return Successes.Created(animal)
  } catch (error: any) {
    if (error.message.includes('validation') || error.message.includes('required') || error.message.includes('invalid')) {
      return Errors.Validation([{ message: error.message }])
    }
    return Errors.Internal()
  }
}
