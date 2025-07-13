import { prisma } from '../lib/prisma';

interface CreateAnimalData {
  name: string;
  animalTypeId: string;
  description?: string;
  userId: string;
}

export async function createAnimal(data: CreateAnimalData) {
  // For now, just create the animal without automatic record creation
  // TODO: Add record creation once Prisma client is properly regenerated
  return prisma.animal.create({ 
    data,
    include: {
      animalType: true
    }
  });
}

export async function getAnimals(where = {}) {
  return prisma.animal.findMany({ 
    where,
    include: {
      animalType: true
    }
  });
}

export async function getAnimalById(id: string) {
  return prisma.animal.findUnique({ 
    where: { id },
    include: {
      animalType: true
    }
  });
}

export async function updateAnimal(id: string, data: Partial<CreateAnimalData>) {
  return prisma.animal.update({ where: { id }, data });
}

export async function deleteAnimal(id: string) {
  return prisma.$transaction(async (tx) => {
    // First delete all records associated with this animal
    await tx.record.deleteMany({
      where: { animalId: id }
    });
    
    // Then delete the animal
    return tx.animal.delete({ 
      where: { id },
      include: {
        animalType: true
      }
    });
  });
} 