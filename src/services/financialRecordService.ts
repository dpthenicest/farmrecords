// services/financialRecordService.ts
import { prisma } from "@/lib/prisma";

interface FetchRecordsParams {
  userId: number;
  role: string;
  page?: number;
  limit?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: number;
}

export async function getFinancialRecords(params: FetchRecordsParams) {
  const {
    userId,
    role,
    page = 1,
    limit = 20,
    type,
    startDate,
    endDate,
    categoryId,
  } = params;

  const where: any = {};

  // If not ADMIN, restrict to their own records
  if (role !== "ADMIN") {
    where.userId = userId;
  }

  if (type) where.transactionType = type;
  if (categoryId) where.categoryId = categoryId;
  if (startDate || endDate) {
    where.transactionDate = {};
    if (startDate) where.transactionDate.gte = new Date(startDate);
    if (endDate) where.transactionDate.lte = new Date(endDate);
  }

  const skip = (page - 1) * limit;

  const [records, total] = await Promise.all([
    prisma.financialRecord.findMany({
      where,
      skip,
      take: limit,
      orderBy: { transactionDate: "desc" },
      include: {
        category: true,
        customer: true,
        supplier: true,
        invoice: true,
        purchaseOrder: true,
      },
    }),
    prisma.financialRecord.count({ where }),
  ]);

  return {
    records,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getFinancialRecordById(id: number, userId: number, role: string) {
  const record = await prisma.financialRecord.findUnique({
    where: { id },
    include: { category: true, customer: true, supplier: true, invoice: true, purchaseOrder: true },
  });

  if (!record) return null;

  if (role !== "ADMIN" && record.userId !== userId) {
    throw new Error("Forbidden");
  }

  return record;
}

export async function createFinancialRecord(data: any, userId: number) {
  return prisma.financialRecord.create({
    data: {
      ...data,
      userId,
    },
  });
}

export async function updateFinancialRecord(id: number, data: any, userId: number, role: string) {
  const existing = await prisma.financialRecord.findUnique({ where: { id } });
  if (!existing) return null;

  if (role !== "ADMIN" && existing.userId !== userId) {
    throw new Error("Forbidden");
  }

  return prisma.financialRecord.update({
    where: { id },
    data,
  });
}

export async function deleteFinancialRecord(id: number, userId: number, role: string) {
  const existing = await prisma.financialRecord.findUnique({ where: { id } });
  if (!existing) return null;

  if (role !== "ADMIN" && existing.userId !== userId) {
    throw new Error("Forbidden");
  }

  return prisma.financialRecord.delete({ where: { id } });
}
