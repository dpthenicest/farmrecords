import { prisma } from "@/lib/prisma"

interface Pagination {
  page?: number
  limit?: number
}

interface FilterOptions {
  species?: string
  breed?: string
  gender?: string
  healthStatus?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export async function getAnimals(userId: number | null, role: string, filters: FilterOptions, pagination: Pagination) {
  const { page = 1, limit = 20 } = pagination
  const skip = (page - 1) * limit

  const where: any = {}

  if (role !== "ADMIN") {
    where.userId = userId
  }

  if (filters.species) where.species = { contains: filters.species, mode: "insensitive" }
  if (filters.breed) where.breed = { contains: filters.breed, mode: "insensitive" }
  if (filters.gender) where.gender = filters.gender
  if (filters.healthStatus) where.healthStatus = filters.healthStatus
  if (filters.startDate && filters.endDate) {
    where.createdAt = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    }
  }

  const total = await prisma.animal.count({ where })

  const animals = await prisma.animal.findMany({
    where,
    skip,
    take: limit,
    orderBy: filters.sortBy ? { [filters.sortBy]: filters.sortOrder || "asc" } : { createdAt: "desc" },
  })

  return {
    data: animals,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export async function getAnimalById(id: number, userId: number, role: string) {
  const where: any = { id }
  if (role !== "ADMIN") where.userId = userId

  return prisma.animal.findFirst({ where })
}

export async function createAnimal(userId: number, data: any) {
  return prisma.animal.create({
    data: {
      ...data,
      userId,
    },
  })
}

export async function updateAnimal(id: number, userId: number, role: string, data: any) {
  const where: any = { id }
  if (role !== "ADMIN") where.userId = userId

  return prisma.animal.updateMany({
    where,
    data,
  })
}

export async function deleteAnimal(id: number, userId: number, role: string) {
  const where: any = { id }
  if (role !== "ADMIN") where.userId = userId

  return prisma.animal.deleteMany({ where })
}

export async function getAnimalsByBatch(batchId: number, userId: number, role: string) {
  const where: any = { batchId }
  if (role !== "ADMIN") where.userId = userId

  return prisma.animal.findMany({ where })
}
