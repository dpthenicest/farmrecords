import { prisma } from "@/lib/prisma"
import {generateInvoiceNumber} from "@/lib/utils"

interface InvoiceFilters {
  page?: number
  limit?: number
  invoiceNumber?: string
  status?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export const invoiceService = {
  async getInvoices(userId: number, role: string, filters: InvoiceFilters = {}) {
    const {
      page = 1,
      limit = 20,
      invoiceNumber,
      status,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters

    const where: any = {}
    if (role !== "ADMIN") where.userId = userId
    if (invoiceNumber) where.invoiceNumber = { contains: invoiceNumber }
    if (status) where.status = status
    if (startDate && endDate) {
      where.invoiceDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const [total, invoices] = await Promise.all([
      prisma.invoice.count({ where }),
      prisma.invoice.findMany({
        where,
        include: {
          customer: { select: { id: true, customerName: true } },
          items: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ])

    return {
      data: invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  },

  async getInvoiceById(id: number, userId: number, role: string) {
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, customerName: true } },
        items: true,
      },
    })

    if (!invoice) return null
    if (role !== "ADMIN" && invoice.userId !== userId) return null

    return invoice
  },

  async createInvoice(userId: number, data: any) {
    const { customerId, invoiceDate, dueDate, notes, items } = data

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + item.quantity * item.unitPrice,
      0
    )
    const taxAmount = subtotal *(Number(process.env.VAT) || 0.8); // 8% VAT example
    const totalAmount = subtotal + taxAmount

    const lastInvoice = await prisma.invoice.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    const invoiceNumber = generateInvoiceNumber(lastInvoice?.invoiceNumber)

    return prisma.invoice.create({
      data: {
        userId,
        customerId,
        invoiceNumber,
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        subtotal,
        taxAmount,
        totalAmount,
        status: "DRAFT",
        notes,
        items: {
          create: items.map((item: any) => ({
            animalBatchId: item.animalBatchId,
            itemDescription: item.itemDescription,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
          })),
        },
      },
      include: {
        customer: { select: { id: true, customerName: true } },
        items: true,
      },
    })
  },

  async updateInvoice(id: number, userId: number, role: string, data: any) {
    const invoice = await prisma.invoice.findUnique({ where: { id } })
    if (!invoice) return null
    if (role !== "ADMIN" && invoice.userId !== userId) return null

    return prisma.invoice.update({
      where: { id },
      data,
      include: {
        customer: { select: { id: true, customerName: true } },
        items: true,
      },
    })
  },

  async deleteInvoice(id: number, userId: number, role: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id } })
    if (!invoice) return null
    if (role !== "ADMIN" && invoice.userId !== userId) return null

    return prisma.invoice.delete({ where: { id } })
  },

  async sendInvoice(id: number, userId: number, role: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id } })
    if (!invoice) return null
    if (role !== "ADMIN" && invoice.userId !== userId) return null

    return prisma.invoice.update({
      where: { id },
      data: { status: "SENT" },
    })
  },

  async markPaid(id: number, userId: number, role: string) {
    const invoice = await prisma.invoice.findUnique({ where: { id } })
    if (!invoice) return null
    if (role !== "ADMIN" && invoice.userId !== userId) return null

    return prisma.invoice.update({
      where: { id },
      data: { status: "PAID", paymentDate: new Date() },
    })
  },
}
