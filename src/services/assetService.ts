import { prisma } from "@/lib/prisma";

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
