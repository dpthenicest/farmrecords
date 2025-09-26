import { prisma } from "@/lib/prisma";

interface PaginationParams {
  page?: number;
  limit?: number;
  status?: string;
  maintenanceType?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Fetch paginated maintenance records
export async function getMaintenance(user: any, params: PaginationParams) {
  const {
    page = 1,
    limit = 20,
    status,
    maintenanceType,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const where: any = {};
  if (user.role !== "ADMIN") {
    where.userId = user.id;
  }
  if (status) where.status = status;
  if (maintenanceType) where.maintenanceType = maintenanceType;
  if (startDate && endDate) {
    where.scheduledDate = {
      gte: new Date(startDate),
      lte: new Date(endDate),
    };
  }

  const [data, total] = await Promise.all([
    prisma.assetMaintenance.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { asset: true, supplier: true, user: true },
    }),
    prisma.assetMaintenance.count({ where }),
  ]);

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

// Fetch one maintenance record
export async function getMaintenanceById(id: number, user: any) {
  const record = await prisma.assetMaintenance.findUnique({
    where: { id },
    include: { asset: true, supplier: true },
  });

  if (!record) return null;
  if (user.role !== "ADMIN" && record.userId !== user.id) {
    throw new Error("Forbidden");
  }
  return record;
}

// Create maintenance record
export async function createMaintenance(data: any, userId: number) {
  return prisma.assetMaintenance.create({
    data: {
      assetId: data.assetId,
      userId,
      maintenanceType: data.maintenanceType,
      scheduledDate: new Date(data.scheduledDate),
      completedDate: data.completedDate ? new Date(data.completedDate) : null,
      cost: data.cost,
      supplierId: data.supplierId ?? null,
      description: data.description,
      notes: data.notes ?? null,
      status: data.status,
    },
  });
}

// Update maintenance record
export async function updateMaintenance(id: number, data: any, user: any) {
  const record = await getMaintenanceById(id, user);
  if (!record) throw new Error("NotFound");

  return prisma.assetMaintenance.update({
    where: { id },
    data: {
      maintenanceType: data.maintenanceType ?? record.maintenanceType,
      scheduledDate: data.scheduledDate
        ? new Date(data.scheduledDate)
        : record.scheduledDate,
      completedDate: data.completedDate
        ? new Date(data.completedDate)
        : record.completedDate,
      cost: data.cost ?? record.cost,
      supplierId: data.supplierId ?? record.supplierId,
      description: data.description ?? record.description,
      notes: data.notes ?? record.notes,
      status: data.status ?? record.status,
    },
  });
}

// Delete maintenance (soft delete = mark status CANCELLED)
export async function deleteMaintenance(id: number, user: any) {
  const record = await getMaintenanceById(id, user);
  if (!record) throw new Error("NotFound");

  return prisma.assetMaintenance.update({
    where: { id },
    data: { status: "CANCELLED" },
  });
}

// Scheduled maintenance
export async function getScheduledMaintenance(user: any) {
  const where: any = { status: "SCHEDULED" };
  if (user.role !== "ADMIN") {
    where.userId = user.id;
  }
  return prisma.assetMaintenance.findMany({
    where,
    include: { asset: true },
  });
}

// Mark as completed
export async function completeMaintenance(id: number, user: any) {
  const record = await getMaintenanceById(id, user);
  if (!record) throw new Error("NotFound");

  return prisma.assetMaintenance.update({
    where: { id },
    data: {
      status: "COMPLETED",
      completedDate: new Date(),
    },
  });
}
