// src/app/api/users/route.ts
import { NextRequest, NextResponse } from "next/server"
import { userService } from "@/services/userService"
import { requireRole } from "@/lib/auth"

export async function GET(req: NextRequest) {
  try {
    const auth = await requireRole(["ADMIN"])
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 403 }
      )
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
    return NextResponse.json({ success: true, data: result })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await requireRole(["ADMIN"])
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error },
        { status: 403 }
      )
    }

    const body = await req.json()
    const user = await userService.createUser(body)
    return NextResponse.json({ success: true, data: user }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 400 }
    )
  }
}
