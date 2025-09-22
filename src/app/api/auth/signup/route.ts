// app/api/auth/signup/route.ts
import { NextResponse } from "next/server"
import { authService } from "@/services/authService"
import { Errors, Successes } from "@/lib/responses"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { username, email, password, firstName, lastName } = body

    if (!username || !email || !password) {
      return Errors.Validation([
        { field: "username", message: "Username is required" },
        { field: "email", message: "Email is required" },
        { field: "password", message: "Password is required" },
      ])
    }

    const user = await authService.registerUser({
      username,
      email,
      password,
      firstName,
      lastName,
    })

    return Successes.Created({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
      })
  } catch (error: any) {
    console.error("Signup error:", error)
    return Errors.Internal()
  }
}
