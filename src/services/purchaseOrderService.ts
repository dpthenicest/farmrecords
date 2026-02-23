import {prisma} from "@/lib/prisma"
import { generatePONumber } from "@/lib/utils" // similar to generateInvoiceNumber
import { createFromPurchaseOrder } from "./financialRecordService"
import { inventoryService } from "./inventoryService"
import { createAsset } from "./assetService"
import { createAnimalBatch } from "./animalBatchService"

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
    if (role !== "ADMIN" && role !== "OWNER") where.userId = userId
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
    if (role !== "ADMIN" && role !== "OWNER" && po.userId !== userId) return null

    return po
  },

  async createPurchaseOrder(userId: number, data: any) {
    const { supplierId, orderDate, expectedDeliveryDate, notes, items, categoryId, taxRate } = data

    // Calculate amounts
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.quantity) * Number(item.unitPrice),
      0
    )
    const taxAmount = subtotal * ((taxRate || 0) / 100)
    const totalAmount = subtotal + taxAmount

    // Get last PO for sequential numbering
    const lastPO = await prisma.purchaseOrder.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    })

    const poNumber = generatePONumber(lastPO?.poNumber)

    // Process items and create entities if needed
    const processedItems = []
    
    for (const item of items) {
      let inventoryId = item.inventoryId || null
      let assetId = item.assetId || null
      let animalBatchId = item.animalBatchId || null

      // Create new entity if requested
      if (item.createEntity && item.entityType && item.entityData) {
        try {
          if (item.entityType === 'inventory') {
            const inventory = await inventoryService.create({
              ...item.entityData,
              currentQuantity: Number(item.quantity),
              unitCost: Number(item.unitPrice),
            }, userId)
            inventoryId = inventory.id
          } else if (item.entityType === 'asset') {
            const asset = await createAsset({
              ...item.entityData,
              conditionStatus: item.entityData.conditionStatus || 'GOOD',
              purchaseCost: Number(item.unitPrice),
              purchaseDate: new Date(orderDate),
            }, userId)
            assetId = asset.id
          } else if (item.entityType === 'batch') {
            const batch = await createAnimalBatch(userId, {
              ...item.entityData,
              initialQuantity: Number(item.quantity),
              currentQuantity: Number(item.quantity),
              totalCost: Number(item.quantity) * Number(item.unitPrice),
              batchStartDate: new Date(orderDate),
              batchStatus: "ACTIVE"
            })
            animalBatchId = batch.id
          }
        } catch (error) {
          console.error(`Failed to create ${item.entityType} for PO item:`, error)
          throw new Error(`Failed to create ${item.entityType}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        }
      }

      processedItems.push({
        inventoryId,
        assetId,
        animalBatchId,
        itemDescription: item.itemDescription,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.quantity) * Number(item.unitPrice),
      })
    }

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
          create: processedItems,
        },
      },
      include: {
        supplier: { select: { id: true, supplierName: true } },
        items: true,
      },
    })

    // Create financial records if categoryId provided and entities were created
    if (categoryId) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i]
        const processedItem = processedItems[i]
        
        if (item.createEntity && (processedItem.inventoryId || processedItem.assetId || processedItem.animalBatchId)) {
          try {
            await prisma.financialRecord.create({
              data: {
                userId,
                transactionType: "EXPENSE",
                amount: Number(item.quantity) * Number(item.unitPrice),
                categoryId: Number(categoryId),
                supplierId,
                purchaseOrderId: purchaseOrder.id,
                transactionDate: new Date(orderDate),
                description: `${item.entityType === 'inventory' ? 'Inventory' : item.entityType === 'asset' ? 'Asset' : 'Animal batch'} purchase: ${item.itemDescription}`,
                referenceNumber: poNumber
              }
            })
          } catch (error) {
            console.error("Failed to create financial record:", error)
            // Don't fail the PO creation if financial record fails
          }
        }
      }
    }

    return purchaseOrder
  },

  async updatePurchaseOrder(id: number, userId: number, role: string, data: any) {
    const po = await prisma.purchaseOrder.findUnique({ 
      where: { id },
      include: { items: true }
    })
    if (!po) return null
    if (role !== "ADMIN" && role !== "OWNER" && po.userId !== userId) return null

    const { supplierId, orderDate, expectedDeliveryDate, actualDeliveryDate, status, notes, items, taxRate } = data

    // Calculate amounts from items
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.quantity) * Number(item.unitPrice),
      0
    )
    const taxAmount = subtotal * (Number(taxRate) || 0) / 100
    const totalAmount = subtotal + taxAmount

    // First, delete existing items
    await prisma.purchaseOrderItem.deleteMany({
      where: { poId: id }
    })

    // Then update the purchase order with new data
    return prisma.purchaseOrder.update({
      where: { id },
      data: {
        supplierId: supplierId ? Number(supplierId) : po.supplierId,
        orderDate: orderDate ? new Date(orderDate) : po.orderDate,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate) : po.expectedDeliveryDate,
        actualDeliveryDate: actualDeliveryDate ? new Date(actualDeliveryDate) : po.actualDeliveryDate,
        status: status || po.status,
        notes: notes !== undefined ? notes : po.notes,
        subtotal,
        taxAmount,
        totalAmount,
        items: {
          create: items.map((item: any) => ({
            inventoryId: item.inventoryId || null,
            assetId: item.assetId || null,
            animalBatchId: item.animalBatchId || null,
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
  },

  async deletePurchaseOrder(id: number, userId: number, role: string) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id } })
    if (!po) return null
    if (role !== "ADMIN" && role !== "OWNER" && po.userId !== userId) return null

    return prisma.purchaseOrder.delete({ where: { id } })
  },

  async sendPurchaseOrder(id: number, userId: number, role: string) {
    const po = await prisma.purchaseOrder.findUnique({ where: { id } })
    if (!po) return null
    if (role !== "ADMIN" && role !== "OWNER" && po.userId !== userId) return null

    return prisma.purchaseOrder.update({
      where: { id },
      data: { status: "SENT" },
    })
  },

  async receivePurchaseOrder(id: number, userId: number, role: string, categoryId?: number) {
    const po = await prisma.purchaseOrder.findUnique({ 
      where: { id },
      include: { items: true, supplier: true }
    })
    if (!po) return null
    if (role !== "ADMIN" && role !== "OWNER" && po.userId !== userId) return null

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
        // Convert Prisma types to service types
        const itemsForInventory = poWithItems.items.map(item => ({
          ...item,
          inventoryId: item.inventoryId || undefined,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice)
        }))
        await inventoryService.adjustFromPurchaseOrder(itemsForInventory, id, userId)
      }
    } catch (error) {
      console.error("Failed to create inventory movements for purchase order:", error)
      // Don't fail the PO receipt if inventory movements fail
    }

    return updatedPO
  },

  /**
   * Receive PO with entity creation
   * Creates inventory/assets/batches from PO items that don't have existing entities
   */
  async receivePurchaseOrderWithEntityCreation(
    id: number, 
    userId: number, 
    role: string, 
    data: {
      categoryId?: number
      items?: Array<{
        itemId: number
        createInventory?: boolean
        inventoryData?: any
        createAsset?: boolean
        assetData?: any
        createBatch?: boolean
        batchData?: any
      }>
    }
  ) {
    const po = await prisma.purchaseOrder.findUnique({ 
      where: { id },
      include: { items: true, supplier: true }
    })
    if (!po) throw new Error("Purchase order not found")
    if (role !== "ADMIN" && role !== "OWNER" && po.userId !== userId) {
      throw new Error("Forbidden")
    }

    // Process each item for entity creation
    if (data.items) {
      for (const itemData of data.items) {
        const poItem = po.items.find(i => i.id === itemData.itemId)
        if (!poItem) continue

        try {
          // Create Inventory
          if (itemData.createInventory && itemData.inventoryData) {
            const inventory = await inventoryService.create({
              ...itemData.inventoryData,
              currentQuantity: Number(poItem.quantity),
              unitCost: Number(poItem.unitPrice),
            }, userId)

            // Link inventory to PO item
            await prisma.purchaseOrderItem.update({
              where: { id: poItem.id },
              data: { inventoryId: inventory.id }
            })

            // Create financial record for inventory purchase
            if (data.categoryId) {
              await prisma.financialRecord.create({
                data: {
                  userId,
                  transactionType: "EXPENSE",
                  amount: Number(poItem.totalPrice),
                  categoryId: data.categoryId,
                  supplierId: po.supplierId,
                  purchaseOrderId: po.id,
                  transactionDate: new Date(),
                  description: `Inventory purchase: ${inventory.itemName}`,
                  referenceNumber: po.poNumber
                }
              })
            }
          }

          // Create Asset
          if (itemData.createAsset && itemData.assetData) {
            const asset = await createAsset({
              ...itemData.assetData,
              purchaseCost: Number(poItem.unitPrice),
              purchaseDate: po.orderDate,
            }, userId)

            // Link asset to PO item
            await prisma.purchaseOrderItem.update({
              where: { id: poItem.id },
              data: { assetId: asset.id }
            })

            // Create financial record for asset purchase
            if (data.categoryId) {
              await prisma.financialRecord.create({
                data: {
                  userId,
                  transactionType: "EXPENSE",
                  amount: Number(poItem.totalPrice),
                  categoryId: data.categoryId,
                  supplierId: po.supplierId,
                  purchaseOrderId: po.id,
                  transactionDate: new Date(),
                  description: `Asset purchase: ${asset.assetName}`,
                  referenceNumber: po.poNumber
                }
              })
            }
          }

          // Create Animal Batch
          if (itemData.createBatch && itemData.batchData) {
            const batch = await createAnimalBatch(userId, {
              ...itemData.batchData,
              initialQuantity: Number(poItem.quantity),
              currentQuantity: Number(poItem.quantity),
              totalCost: Number(poItem.totalPrice),
              batchStartDate: po.orderDate,
              batchStatus: "ACTIVE"
            })

            // Link batch to PO item
            await prisma.purchaseOrderItem.update({
              where: { id: poItem.id },
              data: { animalBatchId: batch.id }
            })

            // Create financial record for batch purchase
            if (data.categoryId) {
              await prisma.financialRecord.create({
                data: {
                  userId,
                  transactionType: "EXPENSE",
                  amount: Number(poItem.totalPrice),
                  categoryId: data.categoryId,
                  supplierId: po.supplierId,
                  purchaseOrderId: po.id,
                  transactionDate: new Date(),
                  description: `Animal batch purchase: ${batch.species} - ${batch.breed || 'N/A'} (${batch.batchCode})`,
                  referenceNumber: po.poNumber
                }
              })
            }
          }
        } catch (error) {
          console.error(`Failed to create entity for PO item ${poItem.id}:`, error)
          // Continue processing other items
        }
      }
    }

    // Mark PO as received
    const updatedPO = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: "RECEIVED", actualDeliveryDate: new Date() },
      include: {
        supplier: { select: { id: true, supplierName: true } },
        items: true,
      },
    })

    // Handle existing inventory items (those that were linked, not created)
    try {
      const itemsForInventory = updatedPO.items
        .filter(item => item.inventoryId && !data.items?.find(i => i.itemId === item.id && i.createInventory))
        .map(item => ({
          ...item,
          inventoryId: item.inventoryId || undefined,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice)
        }))
      
      if (itemsForInventory.length > 0) {
        await inventoryService.adjustFromPurchaseOrder(itemsForInventory, id, userId)
      }
    } catch (error) {
      console.error("Failed to create inventory movements:", error)
    }

    return updatedPO
  },
}
