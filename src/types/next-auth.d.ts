import NextAuth from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    email: string
    username: string
    firstName?: string | null
    lastName?: string | null
    role: string
    isActive: boolean
    passwordHash?: string
  }

  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
      role: string
      username?: string
      firstName?: string | null
      lastName?: string | null
      isActive?: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub: string
  }
} 