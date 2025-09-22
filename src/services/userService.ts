// services/userService.ts
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"

interface QueryParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  search?: string
  startDate?: string
  endDate?: string
  role?: string
  isActive?: boolean
}

export const userService = {
  async getUsers(params: QueryParams) {
    const {
      page = 1,
      limit = 20,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
      startDate,
      endDate,
      role,
      isActive,
    } = params

    const where: Prisma.UserWhereInput = {}

    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ]
    }

    if (role) where.role = role
    if (typeof isActive === "boolean") where.isActive = isActive
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    const total = await prisma.user.count({ where })

    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: Math.min(limit, 100),
      orderBy: { [sortBy]: sortOrder },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
    })

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  },

  async getUserById(id: number) {
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) return null

    const { passwordHash, ...safeUser } = user
    return safeUser
  },

  async createUser(data: {
    username: string
    email: string
    password: string
    firstName?: string
    lastName?: string
    role: string
  }) {
    const { password, ...rest } = data
    const passwordHash = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        ...rest,
        passwordHash,
      },
    })

    const { passwordHash: _, ...safeUser } = user
    return safeUser
  },

  async updateUser(id: number, data: Partial<Omit<any, "id">>) {
    const updateData: any = { ...data }

    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10)
      delete updateData.password // remove plain password
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    const { passwordHash, ...safeUser } = user
    return safeUser
  },

  async deleteUser(id: number) {
    return prisma.user.delete({ where: { id } })
  },
}