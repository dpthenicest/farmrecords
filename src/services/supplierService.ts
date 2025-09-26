// services/supplierService.ts
import { prisma } from "@/lib/prisma";

export async function getSuppliers(user: any, { page, limit, sortBy, order, filters }: any) {
  const where: any = {};

  if (filters.supplierName) where.supplierName = { contains: filters.supplierName, mode: "insensitive" };
  if (filters.supplierCode) where.supplierCode = { equals: filters.supplierCode };
  if (filters.supplierType) where.supplierType = filters.supplierType;
  if (filters.startDate && filters.endDate) {
    where.createdAt = { gte: new Date(filters.startDate), lte: new Date(filters.endDate) };
  }

  if (user.role !== "ADMIN") {
    where.userId = user.id;
  }

  const total = await prisma.supplier.count({ where });
  const data = await prisma.supplier.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: order },
    select: {
      id: true,
      supplierName: true,
      supplierCode: true,
      businessName: true,
      supplierType: true,
      rating: true,
      isActive: true,
      createdAt: true,
    },
  });

  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getSupplierById(user: any, id: number) {
  return prisma.supplier.findUniqueOrThrow({
    where: { id, ...(user.role !== "ADMIN" ? { userId: user.id } : {}) },
  });
}

export async function createSupplier(user: any, data: any) {
  return prisma.supplier.create({
    data: {
      userId: user.id,
      supplierName: data.supplierName,
      supplierCode: data.supplierCode,
      businessName: data.businessName,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      address: data.address,
      supplierType: data.supplierType,
      paymentTermsDays: data.paymentTermsDays,
      taxId: data.taxId,
      rating: data.rating,
      notes: data.notes,
    },
    select: {
      id: true,
      supplierName: true,
      supplierCode: true,
      businessName: true,
      supplierType: true,
      rating: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function updateSupplier(user: any, id: number, data: any) {
  return prisma.supplier.update({
    where: { id, ...(user.role !== "ADMIN" ? { userId: user.id } : {}) },
    data,
  });
}

export async function deleteSupplier(id: number) {
  return prisma.supplier.delete({ where: { id } });
}

export async function getSupplierPurchaseOrders(supplierId: number, { page, limit }: any) {
  const total = await prisma.purchaseOrder.count({ where: { supplierId } });
  const data = await prisma.purchaseOrder.findMany({
    where: { supplierId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}

export async function getSupplierPayments(supplierId: number, { page, limit }: any) {
  const total = await prisma.financialRecord.count({ where: { supplierId } });
  const data = await prisma.financialRecord.findMany({
    where: { supplierId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } };
}
