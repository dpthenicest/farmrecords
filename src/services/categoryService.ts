import { prisma } from "@/lib/prisma";

interface Pagination {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export async function getCategoriesService(userId: number, role: string, filters: any, pagination: Pagination) {
  const { type, isActive, startDate, endDate } = filters;
  const { page = 1, limit = 20, sortBy = "createdAt", sortOrder = "desc" } = pagination;

  const where: any = {};

  // Admin sees all, normal users only their own
  if (role !== "ADMIN") {
    where.userId = userId;
  }

  if (type) where.categoryType = type;
  if (isActive !== undefined) where.isActive = isActive === "true";

  if (startDate && endDate) {
    where.createdAt = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const total = await prisma.salesExpenseCategory.count({ where });
  const categories = await prisma.salesExpenseCategory.findMany({
    where,
    orderBy: { [sortBy]: sortOrder },
    skip: (page - 1) * limit,
    take: limit,
  });

  return {
    data: categories,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getCategoryByIdService(userId: number, role: string, id: number) {
  const where: any = { id };
  if (role !== "ADMIN") where.userId = userId;

  return prisma.salesExpenseCategory.findFirst({ where });
}

export async function createCategoryService(userId: number, data: any) {
  return prisma.salesExpenseCategory.create({
    data: {
      ...data,
      userId,
    },
  });
}

export async function updateCategoryService(userId: number, role: string, id: number, data: any) {
  const where: any = { id };
  if (role !== "ADMIN") where.userId = userId;

  return prisma.salesExpenseCategory.updateMany({
    where,
    data,
  });
}

export async function deleteCategoryService(userId: number, role: string, id: number) {
  const where: any = { id };
  if (role !== "ADMIN") where.userId = userId;

  return prisma.salesExpenseCategory.deleteMany({ where });
}
