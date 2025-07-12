import { prisma } from '../lib/prisma';

interface CreateRecordData {
  categoryId: string;
  unitPrice: number;
  quantity: number;
  note?: string;
  date?: Date;
  animalId?: string;
  userId: string;
}

interface AnimalPurchaseData {
  id: string;
  name: string;
  animalTypeId: string;
  purchasePrice?: number;
  quantity?: number;
  note?: string;
  purchaseDate?: Date;
}

export async function createRecord(data: CreateRecordData) {
  return prisma.record.create({ data });
}

export async function createAnimalPurchaseRecord(animalData: AnimalPurchaseData, userId: string) {
  return prisma.$transaction(async (tx) => {
    // Get the animal type
    const animalType = await tx.animalType.findUnique({
      where: { id: animalData.animalTypeId }
    });
    
    if (!animalType) {
      throw new Error('Animal type not found');
    }
    
    // Find or create the "Animal Purchase" category
    let animalPurchaseCategory = await tx.category.findFirst({
      where: {
        name: 'Animal Purchase',
        userId: userId
      }
    });
    
    if (!animalPurchaseCategory) {
      // Get the expense category type
      const expenseCategoryType = await tx.categoryType.findUnique({
        where: { name: 'EXPENSE' }
      });
      
      if (!expenseCategoryType) {
        throw new Error('Expense category type not found');
      }
      
      // Create the Animal Purchase category
      animalPurchaseCategory = await tx.category.create({
        data: {
          name: 'Animal Purchase',
          categoryTypeId: expenseCategoryType.id,
          description: 'Buying new animals',
          userId: userId
        }
      });
    }
    
    // Create the record
    const record = await tx.record.create({
      data: {
        categoryId: animalPurchaseCategory.id,
        unitPrice: animalData.purchasePrice || 0,
        quantity: animalData.quantity || 1,
        note: animalData.note || `Purchase of ${animalData.name} (${animalType.type.toLowerCase()})`,
        date: animalData.purchaseDate || new Date(),
        animalId: animalData.id,
        userId: userId
      }
    });
    
    if (!record) {
      throw new Error('Failed to create animal purchase record');
    }
    
    return record;
  });
}

export async function getRecords({ where = {}, page = 1, pageSize = 10, orderBy = { date: 'desc' as const } } = {}) {
  const [records, total] = await Promise.all([
    prisma.record.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
      include: {
        category: true,
        animal: {
          include: {
            animalType: true
          }
        }
      }
    }),
    prisma.record.count({ where }),
  ]);
  return { records, total, page, pageSize };
}

export async function getRecordById(id: string) {
  return prisma.record.findUnique({ 
    where: { id },
    include: {
      category: true,
      animal: {
        include: {
          animalType: true
        }
      }
    }
  });
}

export async function updateRecord(id: string, data: Partial<CreateRecordData>) {
  return prisma.record.update({ where: { id }, data });
}

export async function deleteRecord(id: string) {
  return prisma.record.delete({ where: { id } });
} 