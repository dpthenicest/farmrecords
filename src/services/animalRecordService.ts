// services/animalRecordService.ts
import { prisma } from "@/lib/prisma";

interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  startDate?: string;
  endDate?: string;
  recordType?: string;
  batchId?: number;
  animalId?: number;
}

export async function getAnimalRecords(user: any, options: QueryOptions) {
  const {
    page = 1,
    limit = 20,
    sortBy = "recordDate",
    sortOrder = "desc",
    startDate,
    endDate,
    recordType,
    batchId,
    animalId,
  } = options;

  const where: any = {};
  if (user.role !== "ADMIN") {
    where.userId = Number(user.id);
  }
  if (recordType) where.recordType = recordType;
  if (batchId) where.batchId = batchId;
  if (animalId) where.animalId = animalId;
  if (startDate || endDate) {
    where.recordDate = {};
    if (startDate) where.recordDate.gte = new Date(startDate);
    if (endDate) where.recordDate.lte = new Date(endDate);
  }

  const [total, records] = await Promise.all([
    prisma.animalRecord.count({ where }),
    prisma.animalRecord.findMany({
      where,
      include: {
        batch: { select: { id: true, batchCode: true, species: true } },
        animal: { select: { id: true, animalTag: true, species: true } },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return {
    data: records,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getAnimalRecordById(user: any, id: number) {
  return prisma.animalRecord.findFirst({
    where: {
      id,
      ...(user.role !== "ADMIN" ? { userId: Number(user.id) } : {}),
    },
    include: {
      batch: { select: { id: true, batchCode: true, species: true } },
      animal: { select: { id: true, animalTag: true, species: true } },
    },
  });
}

export async function createAnimalRecord(user: any, data: any) {
  return prisma.animalRecord.create({
    data: {
      ...data,
      userId: Number(user.id),
    },
  });
}

export async function updateAnimalRecord(user: any, id: number, data: any) {
  return prisma.animalRecord.updateMany({
    where: {
      id,
      ...(user.role !== "ADMIN" ? { userId: Number(user.id) } : {}),
    },
    data,
  });
}

export async function deleteAnimalRecord(user: any, id: number) {
  return prisma.animalRecord.deleteMany({
    where: {
      id,
      ...(user.role !== "ADMIN" ? { userId: Number(user.id) } : {}),
    },
  });
}
