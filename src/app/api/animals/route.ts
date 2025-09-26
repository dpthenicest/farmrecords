import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import {
  getAnimals,
  createAnimal,
} from "@/services/animalService"

// GET /api/animals
export async function GET(req: Request) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

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
    return NextResponse.json(animals)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/animals
export async function POST(req: Request) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return NextResponse.json({ error: auth.error }, { status: 401 })

    const body = await req.json()
    const animal = await createAnimal(Number(auth.user?.id), body)

    return NextResponse.json(animal, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
