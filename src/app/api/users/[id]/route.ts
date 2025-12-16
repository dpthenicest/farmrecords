// app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import { userService } from "@/services/userService"
import { requireSelfOrRole } from "@/lib/auth"
import { Successes, Errors } from "@/lib/responses"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSelfOrRole(params.id, ["ADMIN"])
    if (!auth.authorized) {
      return auth.error === "Unauthorized" ? Errors.Unauthorized() : Errors.Forbidden()
    }

    const user = await userService.getUserById(Number(params.id))
    if (!user) {
      return Errors.NotFound()
    }

    return Successes.Ok(user)
  } catch (err: any) {
    return Errors.Internal()
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSelfOrRole(params.id, ["ADMIN"])
    if (!auth.authorized) {
      return auth.error === "Unauthorized" ? Errors.Unauthorized() : Errors.Forbidden()
    }

    const body = await req.json()
    const user = await userService.updateUser(Number(params.id), body)
    return Successes.Ok(user)
  } catch (err: any) {
    // Check if it's a validation error
    if (err.message.includes('validation') || err.message.includes('required') || err.message.includes('invalid')) {
      return Errors.Validation([{ message: err.message }])
    }
    return Errors.Internal()
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSelfOrRole(params.id, ["ADMIN"])
    if (!auth.authorized) {
      return auth.error === "Unauthorized" ? Errors.Unauthorized() : Errors.Forbidden()
    }

    await userService.deleteUser(Number(params.id))
    return Successes.NoContent()
  } catch (err: any) {
    return Errors.Internal()
  }
}
