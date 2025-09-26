// services/customerService.ts
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

export async function getCustomers(user: any, { page, limit, sortBy, order, filters }: any) {
  const where: any = {};

  if (filters.customerName) where.customerName = { contains: filters.customerName, mode: "insensitive" };
  if (filters.customerCode) where.customerCode = { equals: filters.customerCode };
  if (filters.customerType) where.customerType = filters.customerType;
  if (filters.startDate && filters.endDate) {
    where.createdAt = { gte: new Date(filters.startDate), lte: new Date(filters.endDate) };
  }

  // If not ADMIN → only own customers
  if (user.role !== "ADMIN") {
    where.userId = user.id;
  }

  const total = await prisma.customer.count({ where });
  const data = await prisma.customer.findMany({
    where,
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { [sortBy]: order },
    select: {
      id: true,
      customerName: true,
      customerCode: true,
      businessName: true,
      customerType: true,
      creditLimit: true,
      isActive: true,
      createdAt: true,
    },
  });

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
}

export async function getCustomerById(user: any, id: number) {
  return prisma.customer.findUniqueOrThrow({
    where: { id, ...(user.role !== "ADMIN" ? { userId: user.id } : {}) },
  });
}

export async function createCustomer(user: any, data: any) {
  return prisma.customer.create({
    data: {
      userId: user.id,
      customerName: data.customerName,
      customerCode: data.customerCode,
      businessName: data.businessName,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone,
      address: data.address,
      customerType: data.customerType,
      creditLimit: data.creditLimit ? new Decimal(data.creditLimit) : undefined,
      paymentTermsDays: data.paymentTermsDays,
      paymentMethodPreference: data.paymentMethodPreference,
      notes: data.notes,
    },
    select: {
      id: true,
      customerName: true,
      customerCode: true,
      businessName: true,
      customerType: true,
      creditLimit: true,
      isActive: true,
      createdAt: true,
    },
  });
}

export async function updateCustomer(user: any, id: number, data: any) {
  return prisma.customer.update({
    where: { id, ...(user.role !== "ADMIN" ? { userId: user.id } : {}) },
    data,
  });
}

export async function deleteCustomer(id: number) {
  return prisma.customer.delete({ where: { id } });
}

export async function getCustomerInvoices(customerId: number, { page, limit }: any) {
  const total = await prisma.invoice.count({ where: { customerId } });
  const data = await prisma.invoice.findMany({
    where: { customerId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

export async function getCustomerPayments(customerId: number, { page, limit }: any) {
  const total = await prisma.financialRecord.count({ where: { customerId } });
  const data = await prisma.financialRecord.findMany({
    where: { customerId },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}
