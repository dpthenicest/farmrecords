// services/financialRecordService.ts
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

interface FetchRecordsParams {
  userId: number;
  role: string;
  page?: number;
  limit?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: number;
  transactionType?: string;
}

interface CreateFinancialRecordData {
  transactionType: string;
  amount: number | Decimal;
  categoryId: number;
  customerId?: number;
  supplierId?: number;
  invoiceId?: number;
  purchaseOrderId?: number;
  transactionDate: Date;
  description: string;
  referenceNumber?: string;
}

interface PaymentRecordData {
  amount: number | Decimal;
  paymentMethod: string;
  paymentDate: Date;
  description?: string;
  referenceNumber?: string;
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
    transactionType
  } = params;

  const where: any = {};

  // If not ADMIN, restrict to their own records
  if (role !== "ADMIN") {
    where.userId = userId;
  }

  if (type) where.transactionType = type;
  if (categoryId) where.categoryId = categoryId;
  if (transactionType) where.transactionType = transactionType;
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

export async function createFinancialRecord(data: CreateFinancialRecordData, userId: number) {
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

// Enhanced methods for automatic financial record creation

export async function createFromInvoice(invoiceId: number, userId: number, categoryId: number) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { customer: true },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.userId !== userId) {
    throw new Error("Forbidden");
  }

  // Create income record for the invoice
  return prisma.financialRecord.create({
    data: {
      userId,
      transactionType: "INCOME",
      amount: invoice.totalAmount,
      categoryId,
      customerId: invoice.customerId,
      invoiceId: invoice.id,
      transactionDate: invoice.invoiceDate,
      description: `Income from Invoice ${invoice.invoiceNumber}`,
      referenceNumber: invoice.invoiceNumber,
    },
  });
}

export async function createFromPurchaseOrder(poId: number, userId: number, categoryId: number) {
  const purchaseOrder = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: { supplier: true },
  });

  if (!purchaseOrder) {
    throw new Error("Purchase order not found");
  }

  if (purchaseOrder.userId !== userId) {
    throw new Error("Forbidden");
  }

  // Create expense record for the purchase order
  return prisma.financialRecord.create({
    data: {
      userId,
      transactionType: "EXPENSE",
      amount: purchaseOrder.totalAmount,
      categoryId,
      supplierId: purchaseOrder.supplierId,
      purchaseOrderId: purchaseOrder.id,
      transactionDate: purchaseOrder.actualDeliveryDate || purchaseOrder.orderDate,
      description: `Expense from Purchase Order ${purchaseOrder.poNumber}`,
      referenceNumber: purchaseOrder.poNumber,
    },
  });
}

export async function createPaymentRecord(
  invoiceId: number, 
  paymentData: PaymentRecordData, 
  userId: number, 
  categoryId: number
) {
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { customer: true },
  });

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  if (invoice.userId !== userId) {
    throw new Error("Forbidden");
  }

  // Update invoice status to PAID
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { 
      status: "PAID", 
      paymentDate: paymentData.paymentDate,
      paymentMethod: paymentData.paymentMethod,
    },
  });

  // Create payment record
  return prisma.financialRecord.create({
    data: {
      userId,
      transactionType: "INCOME",
      amount: paymentData.amount,
      categoryId,
      customerId: invoice.customerId,
      invoiceId: invoice.id,
      transactionDate: paymentData.paymentDate,
      description: paymentData.description || `Payment for Invoice ${invoice.invoiceNumber}`,
      referenceNumber: paymentData.referenceNumber || `PAY-${invoice.invoiceNumber}`,
    },
  });
}

export async function getRecordsBySource(sourceType: string, sourceId: number, userId: number, role: string) {
  const where: any = {};

  // If not ADMIN, restrict to their own records
  if (role !== "ADMIN") {
    where.userId = userId;
  }

  // Add source-specific filters
  switch (sourceType.toLowerCase()) {
    case "invoice":
      where.invoiceId = sourceId;
      break;
    case "purchaseorder":
      where.purchaseOrderId = sourceId;
      break;
    case "customer":
      where.customerId = sourceId;
      break;
    case "supplier":
      where.supplierId = sourceId;
      break;
    default:
      throw new Error("Invalid source type");
  }

  return prisma.financialRecord.findMany({
    where,
    orderBy: { transactionDate: "desc" },
    include: {
      category: true,
      customer: true,
      supplier: true,
      invoice: true,
      purchaseOrder: true,
    },
  });
}

// Utility function for financial calculations with proper decimal handling
export function calculateFinancialAmount(baseAmount: number | Decimal, taxRate: number = 0): Decimal {
  const base = new Decimal(baseAmount.toString());
  const tax = base.mul(new Decimal(taxRate.toString()));
  return base.add(tax);
}

// Validation function for financial data integrity
export function validateFinancialRecord(data: CreateFinancialRecordData): string[] {
  const errors: string[] = [];

  if (!data.transactionType || !["INCOME", "EXPENSE", "TRANSFER"].includes(data.transactionType)) {
    errors.push("Invalid transaction type");
  }

  if (!data.amount || Number(data.amount) <= 0) {
    errors.push("Amount must be greater than zero");
  }

  if (!data.categoryId || data.categoryId <= 0) {
    errors.push("Valid category ID is required");
  }

  if (!data.transactionDate || isNaN(data.transactionDate.getTime())) {
    errors.push("Valid transaction date is required");
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push("Description is required");
  }

  // Validate that income records have customer or invoice
  if (data.transactionType === "INCOME" && !data.customerId && !data.invoiceId) {
    errors.push("Income records must have either a customer or invoice reference");
  }

  // Validate that expense records have supplier or purchase order
  if (data.transactionType === "EXPENSE" && !data.supplierId && !data.purchaseOrderId) {
    errors.push("Expense records must have either a supplier or purchase order reference");
  }

  return errors;
}
