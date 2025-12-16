import { prisma } from "@/lib/prisma"
import { Decimal } from "@prisma/client/runtime/library"

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

interface AnimalRecordData {
  recordType: string
  recordDate: Date
  weight?: number
  feedConsumption?: number
  medicationCost?: number
  healthStatus?: string
  observations?: string
  temperature?: number
  mortalityCount?: number
  productionOutput?: number
  notes?: string
}

interface PerformanceMetrics {
  averageWeight?: number
  totalFeedConsumption?: number
  totalMedicationCost?: number
  totalProductionOutput?: number
  mortalityRate?: number
  averageTemperature?: number
  healthStatusDistribution?: Record<string, number>
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

// Enhanced methods for batch record propagation and performance metrics

export async function createBatchRecord(batchId: number, recordData: AnimalRecordData, userId: number) {
  // Validate batch exists and user has access
  const batch = await prisma.animalBatch.findFirst({
    where: { 
      id: batchId,
      userId: userId
    },
    include: { animals: true }
  })

  if (!batch) {
    throw new Error("Batch not found or access denied")
  }

  // Create batch-level record
  const batchRecord = await prisma.animalRecord.create({
    data: {
      userId,
      batchId,
      recordType: recordData.recordType,
      recordDate: recordData.recordDate,
      weight: recordData.weight,
      feedConsumption: recordData.feedConsumption,
      medicationCost: recordData.medicationCost,
      healthStatus: recordData.healthStatus,
      observations: recordData.observations,
      temperature: recordData.temperature,
      mortalityCount: recordData.mortalityCount || 0,
      productionOutput: recordData.productionOutput,
      notes: recordData.notes
    }
  })

  // For certain record types, propagate to individual animals
  if (['HEALTH_CHECK', 'VACCINATION', 'FEEDING'].includes(recordData.recordType)) {
    const individualRecords = await Promise.all(
      batch.animals.map(animal => 
        prisma.animalRecord.create({
          data: {
            userId,
            animalId: animal.id,
            recordType: recordData.recordType,
            recordDate: recordData.recordDate,
            weight: recordData.weight,
            feedConsumption: recordData.feedConsumption ? 
              new Decimal(recordData.feedConsumption).div(batch.currentQuantity).toNumber() : undefined,
            medicationCost: recordData.medicationCost ?
              new Decimal(recordData.medicationCost).div(batch.currentQuantity).toNumber() : undefined,
            healthStatus: recordData.healthStatus,
            observations: recordData.observations,
            temperature: recordData.temperature,
            productionOutput: recordData.productionOutput ?
              new Decimal(recordData.productionOutput).div(batch.currentQuantity).toNumber() : undefined,
            notes: `Propagated from batch record: ${recordData.notes || ''}`
          }
        })
      )
    )

    // Update individual animal health status if provided
    if (recordData.healthStatus) {
      await prisma.animal.updateMany({
        where: { batchId },
        data: { 
          healthStatus: recordData.healthStatus,
          lastHealthCheck: recordData.recordDate
        }
      })
    }

    return { batchRecord, individualRecords }
  }

  return { batchRecord, individualRecords: [] }
}

export async function getPerformanceMetrics(animalId?: number, batchId?: number, userId?: number): Promise<PerformanceMetrics> {
  if (!animalId && !batchId) {
    throw new Error("Either animalId or batchId must be provided")
  }

  const where: any = {}
  if (userId) where.userId = userId
  
  if (animalId) {
    where.animalId = animalId
  } else if (batchId) {
    where.batchId = batchId
  }

  const records = await prisma.animalRecord.findMany({
    where,
    orderBy: { recordDate: 'desc' }
  })

  if (records.length === 0) {
    return {}
  }

  // Calculate metrics
  const weights = records.filter(r => r.weight).map(r => Number(r.weight!.toString()))
  const feedConsumptions = records.filter(r => r.feedConsumption).map(r => Number(r.feedConsumption!.toString()))
  const medicationCosts = records.filter(r => r.medicationCost).map(r => Number(r.medicationCost!.toString()))
  const productionOutputs = records.filter(r => r.productionOutput).map(r => Number(r.productionOutput!.toString()))
  const temperatures = records.filter(r => r.temperature).map(r => Number(r.temperature!.toString()))
  const mortalityCounts = records.filter(r => r.mortalityCount).map(r => r.mortalityCount!)

  // Health status distribution
  const healthStatusDistribution: Record<string, number> = {}
  records.forEach(record => {
    if (record.healthStatus) {
      healthStatusDistribution[record.healthStatus] = (healthStatusDistribution[record.healthStatus] || 0) + 1
    }
  })

  return {
    averageWeight: weights.length > 0 ? weights.reduce((a, b) => a + b, 0) / weights.length : undefined,
    totalFeedConsumption: feedConsumptions.length > 0 ? feedConsumptions.reduce((a, b) => a + b, 0) : undefined,
    totalMedicationCost: medicationCosts.length > 0 ? medicationCosts.reduce((a, b) => a + b, 0) : undefined,
    totalProductionOutput: productionOutputs.length > 0 ? productionOutputs.reduce((a, b) => a + b, 0) : undefined,
    mortalityRate: mortalityCounts.length > 0 ? mortalityCounts.reduce((a, b) => a + b, 0) : undefined,
    averageTemperature: temperatures.length > 0 ? temperatures.reduce((a, b) => a + b, 0) / temperatures.length : undefined,
    healthStatusDistribution
  }
}

export async function getHealthHistory(animalId?: number, batchId?: number, userId?: number) {
  if (!animalId && !batchId) {
    throw new Error("Either animalId or batchId must be provided")
  }

  const where: any = {
    recordType: {
      in: ['HEALTH_CHECK', 'VACCINATION', 'BREEDING', 'MORTALITY']
    }
  }
  
  if (userId) where.userId = userId
  
  if (animalId) {
    where.animalId = animalId
  } else if (batchId) {
    where.batchId = batchId
  }

  return prisma.animalRecord.findMany({
    where,
    orderBy: { recordDate: 'desc' },
    include: {
      animal: animalId ? undefined : {
        select: {
          id: true,
          animalTag: true,
          species: true,
          breed: true
        }
      },
      batch: batchId ? undefined : {
        select: {
          id: true,
          batchCode: true,
          species: true,
          breed: true
        }
      }
    }
  })
}

export async function updateBatchFromIndividuals(batchId: number, userId: number) {
  // Get batch and its animals
  const batch = await prisma.animalBatch.findFirst({
    where: { id: batchId, userId },
    include: { animals: true }
  })

  if (!batch) {
    throw new Error("Batch not found or access denied")
  }

  // Calculate aggregated metrics from individual animals
  const animals = batch.animals
  const totalWeight = animals.reduce((sum, animal) => {
    return sum + (animal.currentWeight ? Number(animal.currentWeight.toString()) : 0)
  }, 0)

  const averageWeight = animals.length > 0 ? totalWeight / animals.length : 0

  // Update batch with aggregated data
  return prisma.animalBatch.update({
    where: { id: batchId },
    data: {
      currentQuantity: animals.length,
      averageWeight: averageWeight
    }
  })
}

// Validation functions
export function validateAnimalRecord(data: AnimalRecordData): string[] {
  const errors: string[] = []

  if (!data.recordType || data.recordType.trim().length === 0) {
    errors.push("Record type is required")
  }

  const validRecordTypes = ['FEEDING', 'WEIGHING', 'HEALTH_CHECK', 'VACCINATION', 'PRODUCTION', 'MORTALITY', 'BREEDING', 'GENERAL']
  if (data.recordType && !validRecordTypes.includes(data.recordType)) {
    errors.push("Invalid record type")
  }

  if (!data.recordDate || isNaN(data.recordDate.getTime())) {
    errors.push("Valid record date is required")
  }

  if (data.weight !== undefined && (typeof data.weight !== 'number' || data.weight < 0)) {
    errors.push("Weight must be a non-negative number")
  }

  if (data.feedConsumption !== undefined && (typeof data.feedConsumption !== 'number' || data.feedConsumption < 0)) {
    errors.push("Feed consumption must be a non-negative number")
  }

  if (data.medicationCost !== undefined && (typeof data.medicationCost !== 'number' || data.medicationCost < 0)) {
    errors.push("Medication cost must be a non-negative number")
  }

  if (data.temperature !== undefined && (typeof data.temperature !== 'number' || data.temperature < 0 || data.temperature > 50)) {
    errors.push("Temperature must be a valid number between 0 and 50 degrees")
  }

  if (data.mortalityCount !== undefined && (typeof data.mortalityCount !== 'number' || data.mortalityCount < 0)) {
    errors.push("Mortality count must be a non-negative number")
  }

  if (data.productionOutput !== undefined && (typeof data.productionOutput !== 'number' || data.productionOutput < 0)) {
    errors.push("Production output must be a non-negative number")
  }

  return errors
}

export function validateAnimalAssociation(animalId?: number, batchId?: number): string[] {
  const errors: string[] = []

  if (!animalId && !batchId) {
    errors.push("Either animal ID or batch ID must be provided")
  }

  if (animalId && batchId) {
    errors.push("Cannot specify both animal ID and batch ID for the same record")
  }

  return errors
}
