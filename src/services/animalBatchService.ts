import { prisma } from "@/lib/prisma"

interface Pagination {
  page?: number
  limit?: number
}

interface FilterOptions {
  species?: string
  breed?: string
  batchStatus?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export async function getAnimalBatches(userId: number | null, role: string, filters: FilterOptions, pagination: Pagination) {
  const { page = 1, limit = 20 } = pagination
  const skip = (page - 1) * limit

  const where: any = {}
  if (role !== "ADMIN") {
    where.userId = userId
  }

  if (filters.species) where.species = { contains: filters.species, mode: "insensitive" }
  if (filters.breed) where.breed = { contains: filters.breed, mode: "insensitive" }
  if (filters.batchStatus) where.batchStatus = filters.batchStatus
  if (filters.startDate && filters.endDate) {
    where.batchStartDate = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    }
  }

  const total = await prisma.animalBatch.count({ where })

  const batches = await prisma.animalBatch.findMany({
    where,
    skip,
    take: limit,
    orderBy: filters.sortBy ? { [filters.sortBy]: filters.sortOrder || "asc" } : { createdAt: "desc" },
  })

  return {
    data: batches,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export async function getAnimalBatchById(id: number, userId: number, role: string) {
  const where: any = { id }
  if (role !== "ADMIN") where.userId = userId
  return prisma.animalBatch.findFirst({ where })
}

export async function createAnimalBatch(userId: number, data: any) {
  return prisma.animalBatch.create({
    data: {
      ...data,
      userId,
      currentQuantity: data.initialQuantity,
      batchStatus: "ACTIVE",
    },
  })
}

export async function updateAnimalBatch(id: number, userId: number, role: string, data: any) {
  const where: any = { id }
  if (role !== "ADMIN") where.userId = userId

  return prisma.animalBatch.updateMany({
    where,
    data,
  })
}

export async function deleteAnimalBatch(id: number, userId: number, role: string) {
  const where: any = { id }
  if (role !== "ADMIN") where.userId = userId
  return prisma.animalBatch.deleteMany({ where })
}

export async function getBatchPerformance(id: number, userId: number, role: string) {
  const where: any = { id }
  if (role !== "ADMIN") where.userId = userId

  const batch = await prisma.animalBatch.findFirst({
    where,
    include: {
      animals: true,
      animalRecords: true,
    },
  })

  if (!batch) return null

  const animalCount = batch.animals.length
  const avgWeight =
    animalCount > 0
      ? batch.animals.reduce((sum, a) => sum + Number(a.currentWeight || 0), 0) / animalCount
      : 0

  return {
    id: batch.id,
    batchCode: batch.batchCode,
    species: batch.species,
    breed: batch.breed,
    currentQuantity: batch.currentQuantity,
    averageWeight: batch.averageWeight,
    status: batch.batchStatus,
    totalAnimals: batch.animals.length,
    records: batch.animalRecords.length,
  }
}


/**
 * Performance summary of a batch
 * - animal count
 * - average weight
 * - total cost
 */

