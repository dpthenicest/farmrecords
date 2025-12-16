import { prisma } from "@/lib/prisma"
import { generateInvoiceNumber } from "@/lib/utils"
import { createFromInvoice, createPaymentRecord } from "./financialRecordService"
import { inventoryService } from "./inventoryService"

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
        take: Number(limit),
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
    const { customerId, invoiceDate, dueDate, notes, items, categoryId, taxRate } = data

    // Work with Prisma.Decimal instead of raw JS floats
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.quantity) * Number(item.unitPrice),
      0
    )
    const taxAmount = subtotal * ((taxRate || 8) / 100); // Use provided tax rate or default to 8%
    const totalAmount = subtotal + taxAmount

    // Get last invoice for sequential numbering
    const lastInvoice = await prisma.invoice.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    const invoiceNumber = generateInvoiceNumber(lastInvoice?.invoiceNumber)

    const invoice = await prisma.invoice.create({
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
            inventoryId: item.inventoryId || null,
            animalBatchId: item.animalBatchId || null,
            itemDescription: item.itemDescription,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.quantity) * Number(item.unitPrice),
          })),
        },
      },
      include: {
        customer: { select: { id: true, customerName: true } },
        items: true,
      },
    })

    // Automatically create financial record if categoryId is provided
    if (categoryId) {
      try {
        await createFromInvoice(invoice.id, userId, categoryId)
      } catch (error) {
        console.error("Failed to create financial record for invoice:", error)
        // Don't fail the invoice creation if financial record creation fails
      }
    }

    // Automatically create inventory movements for items with inventory
    try {
      await inventoryService.adjustFromInvoice(items, invoice.id, userId)
    } catch (error) {
      console.error("Failed to create inventory movements for invoice:", error)
      // Don't fail the invoice creation if inventory movements fail
    }

    return invoice
  },

  async updateInvoice(id: number, userId: number, role: string, data: any) {
    const invoice = await prisma.invoice.findUnique({ where: { id } })
    if (!invoice) return null
    if (role !== "ADMIN" && invoice.userId !== userId) return null

    const { customerId, invoiceDate, dueDate, notes, items, categoryId, taxRate } = data

    // Calculate totals if items are provided
    let updateData: any = {
      customerId,
      invoiceDate: invoiceDate ? new Date(invoiceDate) : undefined,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes,
    }

    if (items && items.length > 0) {
      const subtotal = items.reduce(
        (sum: number, item: any) => sum + Number(item.quantity) * Number(item.unitPrice),
        0
      )
      const taxAmount = subtotal * ((taxRate || 8) / 100) // Use provided tax rate or default to 8%
      const totalAmount = subtotal + taxAmount

      updateData = {
        ...updateData,
        subtotal,
        taxAmount,
        totalAmount,
      }
    }

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, customerName: true } },
        items: true,
      },
    })

    // Update items if provided
    if (items && items.length > 0) {
      // Delete existing items
      await prisma.invoiceItem.deleteMany({
        where: { invoiceId: id }
      })

      // Create new items
      await prisma.invoiceItem.createMany({
        data: items.map((item: any) => ({
          invoiceId: id,
          inventoryId: item.inventoryId || null,
          animalBatchId: item.animalBatchId || null,
          itemDescription: item.itemDescription,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.quantity) * Number(item.unitPrice),
        }))
      })

      // Fetch updated invoice with new items
      const finalInvoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          customer: { select: { id: true, customerName: true } },
          items: true,
        },
      })

      return finalInvoice
    }

    return updatedInvoice
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

  async markPaid(id: number, userId: number, role: string, paymentData?: any) {
    const invoice = await prisma.invoice.findUnique({ where: { id } })
    if (!invoice) return null
    if (role !== "ADMIN" && invoice.userId !== userId) return null

    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { 
        status: "PAID", 
        paymentDate: new Date(),
        paymentMethod: paymentData?.paymentMethod || "CASH"
      },
    })

    // Automatically create payment record if categoryId is provided
    if (paymentData?.categoryId) {
      try {
        await createPaymentRecord(
          id,
          {
            amount: invoice.totalAmount,
            paymentMethod: paymentData.paymentMethod || "CASH",
            paymentDate: new Date(),
            description: paymentData.description,
            referenceNumber: paymentData.referenceNumber,
          },
          userId,
          paymentData.categoryId
        )
      } catch (error) {
        console.error("Failed to create payment record:", error)
        // Don't fail the payment marking if financial record creation fails
      }
    }

    return updatedInvoice
  },
}
