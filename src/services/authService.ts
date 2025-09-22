// services/authService.ts
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authService = {
  /**
   * Validate user credentials for login
   */
  async validateUser(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return null

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) return null

    // Return safe user (without passwordHash)
    return {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    }
  },

  async updateLastLogin(userId: number) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    })
  },

  /**
   * Register a new user
   */
  async registerUser({
    username,
    email,
    password,
    firstName,
    lastName,
    role = "OWNER",
  }: {
    username: string
    email: string
    password: string
    firstName?: string
    lastName?: string
    role?: string
  }) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await prisma.user.create({
        data: {
          username,
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          role,
        },
      })

      return user
    } catch (error: any) {
      console.error("Error creating user:", error)

      // Handle known Prisma errors
      if (error.code === "P2002") {
        // Unique constraint failed
        throw new Error(
          `A user with this ${error.meta?.target?.join(", ") || "field"} already exists`
        )
      }

      // Unknown error
      throw new Error("Failed to create user. Please try again later.")
    }
  },
}