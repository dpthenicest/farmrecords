import { prisma } from '../lib/prisma';

interface AnimalPurchaseRecordData {
  animalId: string;
  animalName: string;
  animalTypeId: string;
  userId: string;
  purchasePrice?: number;
  quantity?: number;
  note?: string;
  purchaseDate?: Date;
}

export async function createAnimalPurchaseRecord(data: AnimalPurchaseRecordData) {
  try {
    // Get the animal type
    const animalType = await prisma.animalType.findUnique({
      where: { id: data.animalTypeId }
    });
    
    if (!animalType) {
      throw new Error('Animal type not found');
    }
    
    // Find or create the "Animal Purchase" category for this user
    let animalPurchaseCategory = await prisma.category.findFirst({
      where: {
        name: 'Animal Purchase',
        // userId: data.userId
      }
    });
    
    if (!animalPurchaseCategory) {
      // Get the expense category type
      const expenseCategoryType = await prisma.categoryType.findFirst({
        where: { name: 'EXPENSE' }
      });
      
      if (!expenseCategoryType) {
        throw new Error('Expense category type not found');
      }
      
      // Create the Animal Purchase category
      animalPurchaseCategory = await prisma.category.create({
        data: {
          name: 'Animal Purchase',
          categoryTypeId: expenseCategoryType.id,
          description: 'Buying new animals',
          userId: data.userId
        }
      });
    }
    
    // Create the record
    const record = await prisma.record.create({
      data: {
        categoryId: animalPurchaseCategory.id,
        unitPrice: data.purchasePrice || 0,
        quantity: data.quantity || 1,
        note: data.note || `Purchase of ${data.animalName} (${animalType.type.toLowerCase()})`,
        date: data.purchaseDate || new Date(),
        animalId: data.animalId,
        userId: data.userId
      }
    });
    
    if (!record) {
      throw new Error('Failed to create animal purchase record');
    }
    
    return record;
  } catch (error) {
    console.error('Error creating animal purchase record:', error);
    throw error;
  }
}

export async function getAnimalRecords(animalId: string) {
  return prisma.record.findMany({
    where: { animalId },
    include: {
      category: true,
      animal: {
        include: {
          animalType: true
        }
      }
    },
    orderBy: { date: 'desc' }
  });
} 