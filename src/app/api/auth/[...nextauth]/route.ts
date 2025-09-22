// NextAuth.js API route configuration for authentication

// POST /api/auth/signin → login
// POST /api/auth/signout → logout
// POST /api/auth/callback/:provider → OAuth/JWT callback
// GET /api/auth/session → session info (me)
// GET /api/auth/csrf → CSRF token
// GET /api/auth/providers → available providers

// app/api/auth/[...nextauth]/route.ts

import NextAuth, { type NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { authService } from "@/services/authService"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Use authService to validate user
          const user = await authService.validateUser(
            credentials.email,
            credentials.password
          )

          await authService.updateLastLogin(Number(user?.id));

          if (!user) {
            return null
          }

          const {passwordHash, ...safeUser} = user // Exclude passwordHash

          return safeUser;
        } catch (error) {
          console.error("Authorize error:", error)
          return null
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.username = user.username
        token.firstName = user.firstName
        token.lastName = user.lastName
        token.role = user.role // 👈 persist role
        token.isActive = user.isActive
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.username = token.username as string
        session.user.firstName = token.firstName as string
        session.user.lastName = token.lastName as string
        session.user.role = token.role as string
        session.user.isActive = token.isActive as boolean
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
