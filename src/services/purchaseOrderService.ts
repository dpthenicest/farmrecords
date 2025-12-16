import {prisma} from "@/lib/prisma"
import { generatePONumber } from "@/lib/utils" // similar to generateInvoiceNumber
import { createFromPurchaseOrder } from "./financialRecordService"
import { inventoryService } from "./inventoryService"

interface PurchaseOrderFilters {
  page?: number
  limit?: number
  poNumber?: string
  status?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export const purchaseOrderService = {
  async getPurchaseOrders(userId: number, role: string, filters: PurchaseOrderFilters = {}) {
    const {
      page = 1,
      limit = 20,
      poNumber,
      status,
      startDate,
      endDate,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters

    const where: any = {}
    if (role !== "ADMIN") where.userId = userId
    if (poNumber) where.poNumber = { contains: poNumber }
    if (status) where.status = status
    if (startDate && endDate) {
      where.orderDate = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const [total, purchaseOrders] = await Promise.all([
      prisma.purchaseOrder.count({ where }),
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: { select: { id: true, supplierName: true } },
          items: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
    ])

    return {
      data: purchaseOrders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    }
  },

  async getPurchaseOrderById(id: number, userId: number, role: string) {
    const po = await prisma.purchaseOrder.findUnique({
      where: { id },
      include: {
        supplier: { select: { id: true, supplierName: true } },
        items: true,
      },
    })

    if (!po) return null
    if (role !== "ADMIN" && po.userId !== userId) return null

    return po
  },

  async createPurchaseOrder(userId: number, data: any) {
    const { supplierId, orderDate, expectedDeliveryDate, notes, items, categoryId } = data

    // Calculate amounts
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.quantity) * Number(item.unitPrice),
      0
    )
    const taxAmount = subtotal * (Number(process.env.VAT) || 0.0)
    const totalAmount = subtotal + taxAmount

    // Get last PO for sequential numbering
    const lastPO = await prisma.purchaseOrder.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    const poNumber = generatePONumber(lastPO?.poNumber)

    const purchaseOrder = await prisma.purchaseOrder.create({
      data: {
        userId,
        supplierId,
        poNumber,
        orderDate: new Date(orderDate),
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : null,
        subtotal,
        taxAmount,
        totalAmount,
        status: "DRAFT",
        notes,
        items: {
          create: items.map((item: any) => ({
            inventoryId: item.inventoryId || null,
            itemDescription: item.itemDescription,
            quantity: Number(item.quantity),
            unitPrice: Number(item.unitPrice),
            totalPrice: Number(item.quantity) * Number(item.unitPrice),
          })),
        },
      },
      include: {
        supplier: { select: { id: true, supplierName: true } },
        items: true,
      },
    })

    return purchaseOrder
  },

  async updatePurchaseOrder(id: number, userId: number, role: string, data: any) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id } })
    if (!po) return null
    if (role !== "ADMIN" && po.userId !== userId) return null

    return prisma.purchaseOrder.update({
      where: { id },
      data,
      include: {
        supplier: { select: { id: true, supplierName: true } },
        items: true,
      },
    })
  },

  async deletePurchaseOrder(id: number, userId: number, role: string) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id } })
    if (!po) return null
    if (role !== "ADMIN" && po.userId !== userId) return null

    return prisma.purchaseOrder.delete({ where: { id } })
  },

  async sendPurchaseOrder(id: number, userId: number, role: string) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id } })
    if (!po) return null
    if (role !== "ADMIN" && po.userId !== userId) return null

    return prisma.purchaseOrder.update({
      where: { id },
      data: { status: "SENT" },
    })
  },

  async receivePurchaseOrder(id: number, userId: number, role: string, categoryId?: number) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id } })
    if (!po) return null
    if (role !== "ADMIN" && po.userId !== userId) return null

    const updatedPO = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: "RECEIVED", actualDeliveryDate: new Date() },
    })

    // Automatically create financial record when PO is received
    if (categoryId) {
      try {
        await createFromPurchaseOrder(id, userId, categoryId)
      } catch (error) {
        console.error("Failed to create financial record for purchase order:", error)
        // Don't fail the PO receipt if financial record creation fails
      }
    }

    // Automatically create inventory movements when PO is received
    try {
      const poWithItems = await prisma.purchaseOrder.findUnique({
        where: { id },
        include: { items: true }
      })
      
      if (poWithItems?.items) {
        await inventoryService.adjustFromPurchaseOrder(poWithItems.items, id, userId)
      }
    } catch (error) {
      console.error("Failed to create inventory movements for purchase order:", error)
      // Don't fail the PO receipt if inventory movements fail
    }

    return updatedPO
  },
}
