import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";

interface PaginationParams {
  page?: number;
  limit?: number;
  assetType?: string;
  conditionStatus?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface MaintenanceData {
  maintenanceType: string;
  scheduledDate: Date;
  cost: number;
  supplierId?: number;
  description: string;
  notes?: string;
}

interface DepreciationSchedule {
  year: number;
  depreciationAmount: number;
  accumulatedDepreciation: number;
  bookValue: number;
}

interface MaintenanceAlert {
  type: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  assetId: number;
  dueDate?: Date;
}

/**
 * Get paginated & filtered assets
 */
export async function getAssets(user: any, params: PaginationParams) {
  const {
    page = 1,
    limit = 20,
    assetType,
    conditionStatus,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  const where: any = {};
  if (user.role !== "ADMIN") {
    where.userId = user.id;
  }
  if (assetType) where.assetType = assetType;
  if (conditionStatus) where.conditionStatus = conditionStatus;
  if (startDate && endDate) {
    where.purchaseDate = { gte: new Date(startDate), lte: new Date(endDate) };
  }

  const [data, total] = await Promise.all([
    prisma.asset.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: { category: true, user: true },
    }),
    prisma.asset.count({ where }),
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

/**
 * Get single asset by ID
 */
export async function getAssetById(id: number, user: any) {
  const asset = await prisma.asset.findUnique({ where: { id } });
  if (!asset) return null;

  if (user.role !== "ADMIN" && asset.userId !== user.id) {
    throw new Error("Forbidden");
  }
  return asset;
}

/**
 * Create new asset
 */
export async function createAsset(data: any, userId: number) {
  return prisma.asset.create({
    data: {
      userId,
      categoryId: data.categoryId ?? null,
      assetName: data.assetName,
      assetCode: data.assetCode,
      description: data.description ?? null,
      assetType: data.assetType,
      purchaseCost: data.purchaseCost,
      purchaseDate: new Date(data.purchaseDate),
      salvageValue: data.salvageValue,
      usefulLifeYears: data.usefulLifeYears,
      depreciationRate: data.depreciationRate,
      conditionStatus: data.conditionStatus,
      location: data.location ?? null,
      warrantyInfo: data.warrantyInfo ?? null,
      insuranceInfo: data.insuranceInfo ?? null,
    },
  });
}

/**
 * Update asset
 */
export async function updateAsset(id: number, data: any, user: any) {
  const asset = await getAssetById(id, user);
  if (!asset) throw new Error("NotFound");

  return prisma.asset.update({
    where: { id },
    data: {
      categoryId: data.categoryId ?? asset.categoryId,
      assetName: data.assetName ?? asset.assetName,
      description: data.description ?? asset.description,
      conditionStatus: data.conditionStatus ?? asset.conditionStatus,
      location: data.location ?? asset.location,
      warrantyInfo: data.warrantyInfo ?? asset.warrantyInfo,
      insuranceInfo: data.insuranceInfo ?? asset.insuranceInfo,
      isActive: data.isActive ?? asset.isActive,
    },
  });
}

/**
 * Delete asset (soft delete by default)
 */
export async function deleteAsset(id: number, user: any) {
  const asset = await getAssetById(id, user);
  if (!asset) throw new Error("NotFound");

  return prisma.asset.update({
    where: { id },
    data: { isActive: false },
  });
}

/**
 * Calculate depreciation for an asset
 */
export async function getAssetDepreciation(id: number, user: any) {
  const asset = await getAssetById(id, user);
  if (!asset) throw new Error("NotFound");

  const yearsInUse = Math.floor(
    (new Date().getTime() - asset.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
  );
  const depreciationPerYear =
    (Number(asset.purchaseCost) - Number(asset.salvageValue)) /
    asset.usefulLifeYears;
  const accumulatedDepreciation = Math.min(
    depreciationPerYear * yearsInUse,
    Number(asset.purchaseCost) - Number(asset.salvageValue)
  );
  const bookValue = Number(asset.purchaseCost) - accumulatedDepreciation;

  return {
    assetId: asset.id,
    assetName: asset.assetName,
    purchaseCost: asset.purchaseCost,
    accumulatedDepreciation,
    bookValue,
    yearsInUse,
  };
}

// Enhanced methods for depreciation calculation, maintenance scheduling, and alerts

export function calculateDepreciationSchedule(
  purchaseCost: number,
  salvageValue: number,
  usefulLifeYears: number,
  purchaseDate: Date
): DepreciationSchedule[] {
  const schedule: DepreciationSchedule[] = [];
  const depreciationPerYear = (purchaseCost - salvageValue) / usefulLifeYears;
  
  for (let year = 1; year <= usefulLifeYears; year++) {
    const accumulatedDepreciation = depreciationPerYear * year;
    const bookValue = purchaseCost - accumulatedDepreciation;
    
    schedule.push({
      year,
      depreciationAmount: depreciationPerYear,
      accumulatedDepreciation,
      bookValue: Math.max(bookValue, salvageValue)
    });
  }
  
  return schedule;
}

export async function scheduleMaintenance(assetId: number, maintenanceData: MaintenanceData, userId: number) {
  // Validate asset exists and user has access
  const asset = await prisma.asset.findFirst({
    where: { id: assetId, userId }
  });

  if (!asset) {
    throw new Error("Asset not found or access denied");
  }

  // Create maintenance record
  const maintenance = await prisma.assetMaintenance.create({
    data: {
      assetId,
      userId,
      maintenanceType: maintenanceData.maintenanceType,
      scheduledDate: maintenanceData.scheduledDate,
      cost: maintenanceData.cost,
      supplierId: maintenanceData.supplierId,
      description: maintenanceData.description,
      notes: maintenanceData.notes,
      status: 'SCHEDULED'
    }
  });

  // Create associated task
  await prisma.task.create({
    data: {
      userId,
      taskTitle: `${maintenanceData.maintenanceType} - ${asset.assetName}`,
      description: maintenanceData.description,
      priority: 'MEDIUM',
      status: 'PENDING',
      dueDate: maintenanceData.scheduledDate,
      assetId: assetId,
      notes: `Scheduled maintenance: ${maintenanceData.notes || ''}`
    }
  });

  return maintenance;
}

export async function completeMaintenance(maintenanceId: number, userId: number, completionNotes?: string) {
  // Get maintenance record
  const maintenance = await prisma.assetMaintenance.findFirst({
    where: { id: maintenanceId, userId },
    include: { asset: true }
  });

  if (!maintenance) {
    throw new Error("Maintenance record not found or access denied");
  }

  // Update maintenance record
  const updatedMaintenance = await prisma.assetMaintenance.update({
    where: { id: maintenanceId },
    data: {
      status: 'COMPLETED',
      completedDate: new Date(),
      notes: completionNotes ? `${maintenance.notes || ''}\nCompletion: ${completionNotes}` : maintenance.notes
    }
  });

  // Update asset condition if it's a repair or major maintenance
  if (['REPAIR', 'MAINTENANCE'].includes(maintenance.maintenanceType)) {
    await prisma.asset.update({
      where: { id: maintenance.assetId },
      data: {
        conditionStatus: 'GOOD' // Assume maintenance improves condition
      }
    });
  }

  // Complete associated task
  await prisma.task.updateMany({
    where: {
      assetId: maintenance.assetId,
      status: 'PENDING',
      dueDate: maintenance.scheduledDate
    },
    data: {
      status: 'COMPLETED',
      completedDate: new Date()
    }
  });

  // Create financial record for maintenance cost
  try {
    await prisma.financialRecord.create({
      data: {
        userId,
        transactionType: 'EXPENSE',
        amount: maintenance.cost,
        categoryId: maintenance.asset.categoryId || 1, // Default category if none set
        supplierId: maintenance.supplierId,
        transactionDate: new Date(),
        description: `Maintenance expense: ${maintenance.description}`,
        referenceNumber: `MAINT-${maintenanceId}`
      }
    });
  } catch (error) {
    console.error("Failed to create financial record for maintenance:", error);
    // Don't fail the maintenance completion if financial record creation fails
  }

  return updatedMaintenance;
}

export async function getMaintenanceHistory(assetId: number, userId: number) {
  return prisma.assetMaintenance.findMany({
    where: { assetId, userId },
    orderBy: { scheduledDate: 'desc' },
    include: {
      supplier: {
        select: {
          id: true,
          supplierName: true
        }
      }
    }
  });
}

export async function generateMaintenanceAlerts(userId: number): Promise<MaintenanceAlert[]> {
  const alerts: MaintenanceAlert[] = [];
  
  // Get assets that need maintenance
  const assets = await prisma.asset.findMany({
    where: { userId, isActive: true },
    include: {
      maintenance: {
        where: { status: 'SCHEDULED' },
        orderBy: { scheduledDate: 'asc' }
      }
    }
  });

  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  for (const asset of assets) {
    // Check for overdue maintenance
    const overdueMaintenance = asset.maintenance.filter(m => m.scheduledDate < now);
    if (overdueMaintenance.length > 0) {
      alerts.push({
        type: 'OVERDUE_MAINTENANCE',
        severity: 'CRITICAL',
        title: `Overdue Maintenance: ${asset.assetName}`,
        message: `${overdueMaintenance.length} maintenance task(s) are overdue for ${asset.assetName}`,
        assetId: asset.id,
        dueDate: overdueMaintenance[0].scheduledDate
      });
    }

    // Check for upcoming maintenance
    const upcomingMaintenance = asset.maintenance.filter(m => 
      m.scheduledDate >= now && m.scheduledDate <= thirtyDaysFromNow
    );
    if (upcomingMaintenance.length > 0) {
      alerts.push({
        type: 'UPCOMING_MAINTENANCE',
        severity: 'MEDIUM',
        title: `Upcoming Maintenance: ${asset.assetName}`,
        message: `${upcomingMaintenance.length} maintenance task(s) scheduled within 30 days for ${asset.assetName}`,
        assetId: asset.id,
        dueDate: upcomingMaintenance[0].scheduledDate
      });
    }

    // Check asset condition
    if (asset.conditionStatus === 'POOR') {
      alerts.push({
        type: 'POOR_CONDITION',
        severity: 'HIGH',
        title: `Poor Condition: ${asset.assetName}`,
        message: `${asset.assetName} is in poor condition and may need immediate attention`,
        assetId: asset.id
      });
    }

    // Check for assets nearing end of useful life
    const yearsInUse = Math.floor(
      (now.getTime() - asset.purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
    );
    if (yearsInUse >= asset.usefulLifeYears * 0.9) {
      alerts.push({
        type: 'END_OF_LIFE',
        severity: 'MEDIUM',
        title: `Asset Aging: ${asset.assetName}`,
        message: `${asset.assetName} is nearing the end of its useful life (${yearsInUse}/${asset.usefulLifeYears} years)`,
        assetId: asset.id
      });
    }
  }

  return alerts;
}

// Validation functions
export function validateMaintenanceData(data: MaintenanceData): string[] {
  const errors: string[] = [];

  if (!data.maintenanceType || data.maintenanceType.trim().length === 0) {
    errors.push("Maintenance type is required");
  }

  const validMaintenanceTypes = ['MAINTENANCE', 'REPAIR', 'CLEANING', 'INSPECTION'];
  if (data.maintenanceType && !validMaintenanceTypes.includes(data.maintenanceType)) {
    errors.push("Invalid maintenance type");
  }

  if (!data.scheduledDate || isNaN(data.scheduledDate.getTime())) {
    errors.push("Valid scheduled date is required");
  }

  if (typeof data.cost !== 'number' || data.cost < 0) {
    errors.push("Cost must be a non-negative number");
  }

  if (!data.description || data.description.trim().length === 0) {
    errors.push("Description is required");
  }

  return errors;
}

export function validateAssetData(data: any): string[] {
  const errors: string[] = [];

  if (!data.assetName || data.assetName.trim().length === 0) {
    errors.push("Asset name is required");
  }

  if (!data.assetCode || data.assetCode.trim().length === 0) {
    errors.push("Asset code is required");
  }

  if (!data.assetType || data.assetType.trim().length === 0) {
    errors.push("Asset type is required");
  }

  const validAssetTypes = ['INFRASTRUCTURE', 'EQUIPMENT', 'VEHICLES'];
  if (data.assetType && !validAssetTypes.includes(data.assetType)) {
    errors.push("Invalid asset type");
  }

  if (typeof data.purchaseCost !== 'number' || data.purchaseCost <= 0) {
    errors.push("Purchase cost must be a positive number");
  }

  if (typeof data.salvageValue !== 'number' || data.salvageValue < 0) {
    errors.push("Salvage value must be a non-negative number");
  }

  if (data.salvageValue >= data.purchaseCost) {
    errors.push("Salvage value must be less than purchase cost");
  }

  if (typeof data.usefulLifeYears !== 'number' || data.usefulLifeYears <= 0) {
    errors.push("Useful life years must be a positive number");
  }

  if (!data.purchaseDate || isNaN(new Date(data.purchaseDate).getTime())) {
    errors.push("Valid purchase date is required");
  }

  return errors;
}
