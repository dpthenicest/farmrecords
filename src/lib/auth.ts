// lib/auth.ts
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// Require authentication for any logged-in user
export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { authorized: false, error: "Unauthorized" }
  }

  return { authorized: true, user: session.user }
}

// Restrict route to certain roles only
export async function requireRole(roles: string[]) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { authorized: false, error: "Unauthorized" }
  }

  if (!roles.includes(session.user.role)) {
    return { authorized: false, error: "Forbidden: insufficient role" }
  }

  return { authorized: true, user: session.user }
}

// Restrict actions to user themself or allowed roles
export async function requireSelfOrRole(userId: string, roles: string[] = ["ADMIN"]) {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return { authorized: false, error: "Unauthorized" }
  }

  if (session.user.id === userId || roles.includes(session.user.role)) {
    return { authorized: true, user: session.user }
  }

  return { authorized: false, error: "Forbidden" }
}
