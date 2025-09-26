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
    if (!isAdmin && userId) {
      where.userId = userId;
    }
    if (category) {
      where.category = { categoryName: { contains: category, mode: "insensitive" } };
    }
    if (lowStock) {
      where.currentQuantity = { lt: prisma.inventory.fields.reorderLevel };
    }
    if (search) {
      where.OR = [
        { itemName: { contains: search, mode: "insensitive" } },
        { itemCode: { contains: search, mode: "insensitive" } },
      ];
    }

    const total = await prisma.inventory.count({ where });
    const items = await prisma.inventory.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
    });

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

  async getLowStock(userId: number, isAdmin: boolean) {
    return prisma.inventory.findMany({
      where: {
        ...(isAdmin ? {} : { userId }),
        currentQuantity: { lt: prisma.inventory.fields.reorderLevel },
      },
      include: { category: true },
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
