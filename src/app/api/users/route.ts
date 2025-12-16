// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server"
import { userService } from "@/services/userService"
import { requireRole } from "@/lib/auth"
import { Successes, Errors } from "@/lib/responses"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["ADMIN"])
    if (!auth.authorized) {
      return Errors.Forbidden()
    }

    const { searchParams } = new URL(req.url)
    const params = {
      page: Number(searchParams.get("page") || 1),
      limit: Number(searchParams.get("limit") || 20),
      sortBy: searchParams.get("sortBy") || undefined,
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || undefined,
      search: searchParams.get("search") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      role: searchParams.get("role") || undefined,
      isActive: searchParams.get("isActive")
        ? searchParams.get("isActive") === "true"
        : undefined,
    }

    const result = await userService.getUsers(params)
    return Successes.Ok(result)
  } catch (err: any) {
    return Errors.Internal()
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["ADMIN"])
    if (!auth.authorized) {
      return Errors.Forbidden()
    }

    const body = await req.json()
    const user = await userService.createUser(body)
    return Successes.Created(user)
  } catch (err: any) {
    // Check if it's a validation error
    if (err.message.includes('validation') || err.message.includes('required') || err.message.includes('invalid')) {
      return Errors.Validation([{ message: err.message }])
    }
    return Errors.Internal()
  }
}
