// app/api/inventory/service.ts
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

interface PaginationOptions {
  page?: number;
  limit?: number;
  category?: string;
  lowStock?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  userId?: number;
  isAdmin?: boolean;
}

interface InventoryMovementData {
  inventoryId: number;
  movementType: string;
  quantity: number;
  unitCost?: number;
  referenceId?: number;
  referenceType?: string;
  notes?: string;
}

interface InvoiceItem {
  inventoryId?: number;
  quantity: number;
  unitPrice: number;
}

interface PurchaseOrderItem {
  inventoryId?: number;
  quantity: number;
  unitPrice: number;
}

export const inventoryService = {
  async getAll({
    page = 1,
    limit = 20,
    category,
    lowStock,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
    userId,
    isAdmin,
  }: PaginationOptions) {
    const where: any = {};

    // User filtering
    if (!isAdmin && userId) {
      where.userId = userId;
    }

    // Category filtering
    if (category) {
      where.category = {
        categoryName: { contains: category, mode: "insensitive" }
      };
    }

    // Search filtering
    if (search) {
      where.OR = [
        { itemName: { contains: search, mode: "insensitive" } },
        { itemCode: { contains: search, mode: "insensitive" } },
      ];
    }

    // For low stock, we need to use raw SQL or fetch and filter
    let items;
    let total;

    if (lowStock) {
      // Use raw SQL for low stock comparison
      items = await prisma.$queryRaw`
        SELECT i.*, c.category_name, c.category_type
        FROM inventory i
        LEFT JOIN sales_expense_categories c ON i.category_id = c.category_id
        WHERE i.current_quantity < i.reorder_level
        ${userId && !isAdmin ? prisma.$queryRaw`AND i.user_id = ${userId}` : prisma.$queryRaw``}
        ${category ? prisma.$queryRaw`AND c.category_name ILIKE ${'%' + category + '%'}` : prisma.$queryRaw``}
        ${search ? prisma.$queryRaw`AND (i.item_name ILIKE ${'%' + search + '%'} OR i.item_code ILIKE ${'%' + search + '%'})` : prisma.$queryRaw``}
        ORDER BY i.${sortBy} ${sortOrder.toUpperCase()}
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
      `;

      // Count total for pagination
      const countResult: any[] = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM inventory i
        LEFT JOIN sales_expense_categories c ON i.category_id = c.category_id
        WHERE i.current_quantity < i.reorder_level
        ${userId && !isAdmin ? prisma.$queryRaw`AND i.user_id = ${userId}` : prisma.$queryRaw``}
        ${category ? prisma.$queryRaw`AND c.category_name ILIKE ${'%' + category + '%'}` : prisma.$queryRaw``}
        ${search ? prisma.$queryRaw`AND (i.item_name ILIKE ${'%' + search + '%'} OR i.item_code ILIKE ${'%' + search + '%'})` : prisma.$queryRaw``}
      `;

      total = Number(countResult[0]?.count || 0);
    } else {
      // Normal Prisma query for non-low-stock requests
      total = await prisma.inventory.count({ where });

      items = await prisma.inventory.findMany({
        where,
        include: { category: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      });
    }

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  },

  // Alternative approach using a separate method for low stock
  async getLowStock({
    userId,
    isAdmin,
    page = 1,
    limit = 20,
  }: Pick<PaginationOptions, 'userId' | 'isAdmin' | 'page' | 'limit'>) {
    const items = await prisma.inventory.findMany({
      where: {
        ...(userId && !isAdmin ? { userId } : {}),
        currentQuantity: {
          // This won't work - need different approach
        }
      },
      include: { category: true },
    });

    // Filter in memory for low stock
    const lowStockItems = items.filter(item =>
      parseFloat(item.currentQuantity.toString()) < parseFloat(item.reorderLevel.toString())
    );

    // Apply pagination to filtered results
    const paginatedItems = lowStockItems.slice(
      (page - 1) * limit,
      page * limit
    );

    return {
      items: paginatedItems,
      pagination: {
        page,
        limit,
        total: lowStockItems.length,
        pages: Math.ceil(lowStockItems.length / limit),
      },
    };
  },
  async getById(id: number, userId: number, isAdmin: boolean) {
    const where: any = { id };
    
    if (!isAdmin) {
      where.userId = userId;
    }

    return prisma.inventory.findFirst({
      where,
      include: {
        category: true,
        user: true,
      },
    });
  },

  async create(data: any, userId: number) {
    return prisma.inventory.create({
      data: {
        userId,
        categoryId: data.categoryId ?? null,
        itemName: data.itemName,
        itemCode: data.itemCode,
        description: data.description ?? null,
        unitOfMeasure: data.unitOfMeasure,
        currentQuantity: data.currentQuantity,
        reorderLevel: data.reorderLevel,
        unitCost: data.unitCost,
        sellingPrice: data.sellingPrice,
        location: data.location ?? null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    })
  },

  async update(id: number, data: any, userId: number, isAdmin: boolean) {
    return prisma.inventory.updateMany({
      where: { id, ...(isAdmin ? {} : { userId }) },
      data,
    });
  },

  async remove(id: number, userId: number, isAdmin: boolean) {
    return prisma.inventory.deleteMany({
      where: { id, ...(isAdmin ? {} : { userId }) },
    });
  },



  async adjustQuantity(
    id: number,
    quantity: number,
    movementType: string,
    notes: string,
    userId: number,
    isAdmin: boolean
  ) {
    const inventory = await prisma.inventory.findFirst({
      where: { id, ...(isAdmin ? {} : { userId }) },
    });
    if (!inventory) throw new Error("Not found");

    // Validate that the adjustment won't result in negative stock
    const newQuantity = inventory.currentQuantity.plus(quantity);
    if (newQuantity.lt(0)) {
      throw new Error("Insufficient inventory. Cannot reduce quantity below zero.");
    }

    const updated = await prisma.inventory.update({
      where: { id },
      data: {
        currentQuantity: newQuantity,
      },
    });

    const movement = await prisma.inventoryMovement.create({
      data: {
        inventoryId: id,
        userId,
        movementType,
        quantity,
        unitCost: inventory.unitCost,
        movementDate: new Date(),
        notes,
      },
    });

    return { inventory: updated, movement };
  },

  // Enhanced methods for automatic inventory movement creation

  async processMovement(movementData: InventoryMovementData, userId: number): Promise<any> {
    const { inventoryId, movementType, quantity, unitCost, referenceId, referenceType, notes } = movementData;

    // Get current inventory
    const inventory = await prisma.inventory.findUnique({
      where: { id: inventoryId }
    });

    if (!inventory) {
      throw new Error("Inventory item not found");
    }

    // Validate quantity for outgoing movements
    if (["SALE", "CONSUMPTION", "LOSS"].includes(movementType)) {
      const newQuantity = inventory.currentQuantity.minus(Math.abs(quantity));
      if (newQuantity.lt(0)) {
        throw new Error(`Insufficient inventory. Available: ${inventory.currentQuantity}, Requested: ${Math.abs(quantity)}`);
      }
    }

    // Calculate new quantity based on movement type
    let quantityChange = new Decimal(quantity);
    if (["SALE", "CONSUMPTION", "LOSS"].includes(movementType)) {
      quantityChange = quantityChange.negated();
    }

    // Update inventory quantity
    const updatedInventory = await prisma.inventory.update({
      where: { id: inventoryId },
      data: {
        currentQuantity: inventory.currentQuantity.plus(quantityChange)
      }
    });

    // Create movement record
    const movement = await prisma.inventoryMovement.create({
      data: {
        inventoryId,
        userId,
        movementType,
        quantity: Math.abs(quantity),
        unitCost: unitCost || inventory.unitCost,
        movementDate: new Date(),
        referenceId,
        referenceType,
        notes
      }
    });

    return { inventory: updatedInventory, movement };
  },

  async adjustFromPurchaseOrder(poItems: PurchaseOrderItem[], poId: number, userId: number): Promise<any[]> {
    const movements = [];

    for (const item of poItems) {
      if (item.inventoryId) {
        try {
          const movement = await this.processMovement({
            inventoryId: item.inventoryId,
            movementType: "PURCHASE",
            quantity: item.quantity,
            unitCost: item.unitPrice,
            referenceId: poId,
            referenceType: "PURCHASE_ORDER",
            notes: `Purchase order receipt - PO #${poId}`
          }, userId);
          movements.push(movement);
        } catch (error) {
          console.error(`Failed to process inventory movement for item ${item.inventoryId}:`, error);
          // Continue processing other items
        }
      }
    }

    return movements;
  },

  async adjustFromInvoice(invoiceItems: InvoiceItem[], invoiceId: number, userId: number): Promise<any[]> {
    const movements = [];

    for (const item of invoiceItems) {
      if (item.inventoryId) {
        try {
          const movement = await this.processMovement({
            inventoryId: item.inventoryId,
            movementType: "SALE",
            quantity: item.quantity,
            unitCost: item.unitPrice,
            referenceId: invoiceId,
            referenceType: "INVOICE",
            notes: `Invoice sale - Invoice #${invoiceId}`
          }, userId);
          movements.push(movement);
        } catch (error) {
          console.error(`Failed to process inventory movement for item ${item.inventoryId}:`, error);
          // Continue processing other items
        }
      }
    }

    return movements;
  },

  async getLowStockItems(userId: number, isAdmin: boolean): Promise<any[]> {
    const where: any = {};
    
    if (!isAdmin) {
      where.userId = userId;
    }

    // Use raw query to compare decimal fields
    let lowStockItems;
    if (!isAdmin) {
      lowStockItems = await prisma.$queryRaw`
        SELECT i.*, c.category_name, c.category_type
        FROM inventory i
        LEFT JOIN sales_expense_categories c ON i.category_id = c.category_id
        WHERE i.current_quantity <= i.reorder_level AND i.user_id = ${userId}
        ORDER BY (i.current_quantity / i.reorder_level) ASC
      `;
    } else {
      lowStockItems = await prisma.$queryRaw`
        SELECT i.*, c.category_name, c.category_type
        FROM inventory i
        LEFT JOIN sales_expense_categories c ON i.category_id = c.category_id
        WHERE i.current_quantity <= i.reorder_level
        ORDER BY (i.current_quantity / i.reorder_level) ASC
      `;
    }

    return lowStockItems as any[];
  },

  async getMovementHistory(inventoryId: number, userId: number, isAdmin: boolean): Promise<any[]> {
    const where: any = { inventoryId };
    
    if (!isAdmin) {
      where.userId = userId;
    }

    return prisma.inventoryMovement.findMany({
      where,
      orderBy: { movementDate: "desc" },
      include: {
        inventory: {
          select: {
            itemName: true,
            itemCode: true
          }
        }
      }
    });
  },

  // Validation functions
  validateQuantity(quantity: number): string[] {
    const errors: string[] = [];

    if (typeof quantity !== 'number' || isNaN(quantity)) {
      errors.push("Quantity must be a valid number");
    }

    if (quantity < 0) {
      errors.push("Quantity cannot be negative");
    }

    return errors;
  },

  validateInventoryData(data: any): string[] {
    const errors: string[] = [];

    if (!data.itemName || data.itemName.trim().length === 0) {
      errors.push("Item name is required");
    }

    if (!data.itemCode || data.itemCode.trim().length === 0) {
      errors.push("Item code is required");
    }

    if (!data.unitOfMeasure || data.unitOfMeasure.trim().length === 0) {
      errors.push("Unit of measure is required");
    }

    if (typeof data.currentQuantity !== 'number' || data.currentQuantity < 0) {
      errors.push("Current quantity must be a non-negative number");
    }

    if (typeof data.reorderLevel !== 'number' || data.reorderLevel < 0) {
      errors.push("Reorder level must be a non-negative number");
    }

    if (typeof data.unitCost !== 'number' || data.unitCost < 0) {
      errors.push("Unit cost must be a non-negative number");
    }

    if (typeof data.sellingPrice !== 'number' || data.sellingPrice < 0) {
      errors.push("Selling price must be a non-negative number");
    }

    if (data.expiryDate && isNaN(new Date(data.expiryDate).getTime())) {
      errors.push("Expiry date must be a valid date");
    }

    return errors;
  },

  // Alert generation for low stock
  async generateLowStockAlerts(userId: number, isAdmin: boolean): Promise<any[]> {
    const lowStockItems = await this.getLowStockItems(userId, isAdmin);
    
    const alerts = lowStockItems.map((item: any) => ({
      type: "LOW_STOCK",
      severity: item.current_quantity === 0 ? "CRITICAL" : "WARNING",
      title: `Low Stock Alert: ${item.item_name}`,
      message: `${item.item_name} (${item.item_code}) is ${item.current_quantity === 0 ? 'out of stock' : 'below reorder level'}. Current: ${item.current_quantity}, Reorder Level: ${item.reorder_level}`,
      itemId: item.inventory_id,
      itemName: item.item_name,
      itemCode: item.item_code,
      currentQuantity: item.current_quantity,
      reorderLevel: item.reorder_level,
      createdAt: new Date()
    }));

    return alerts;
  },
};
