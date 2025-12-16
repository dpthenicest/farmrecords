// NextAuth.js API route configuration for authentication

// POST /api/auth/signin → login
// POST /api/auth/signout → logout
// POST /api/auth/callback/:provider → OAuth/JWT callback
// GET /api/auth/session → session info (me)
// GET /api/auth/csrf → CSRF token
// GET /api/auth/providers → available providers

// app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
