// app/api/inventory/service.ts
import { prisma } from "@/lib/prisma";

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
    if (isAdmin) {
      return prisma.inventory.findMany({
        include: {
          category: true,
          user: true,
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return prisma.inventory.findMany({
      where: { userId },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
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

    const updated = await prisma.inventory.update({
      where: { id },
      data: {
        currentQuantity: inventory.currentQuantity.plus(quantity),
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
};
