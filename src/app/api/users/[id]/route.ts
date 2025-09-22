// app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from "next/server"
import { userService } from "@/services/userService"
import { requireSelfOrRole } from "@/lib/auth"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSelfOrRole(params.id, ["ADMIN"])
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
    }

    const user = await userService.getUserById(Number(params.id))
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSelfOrRole(params.id, ["ADMIN"])
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
    }

    const body = await req.json()
    const user = await userService.updateUser(Number(params.id), body)
    return NextResponse.json({ success: true, data: user })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSelfOrRole(params.id, ["ADMIN"])
    if (!auth.authorized) {
      return NextResponse.json({ success: false, error: auth.error }, { status: 401 })
    }

    await userService.deleteUser(Number(params.id))
    return NextResponse.json({ success: true, message: "User deleted" })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 })
  }
}
