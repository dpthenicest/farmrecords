// lib/auth.ts
import { getServerSession } from "next-auth"
import { type NextAuthOptions } from "next-auth"
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

          return user;
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
