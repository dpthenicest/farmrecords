import { prisma } from '../lib/prisma';

export async function createAnimalType(data: any) {
  return prisma.animalType.create({ data });
}

export async function getAnimalTypes(where: any = {}) {
  return prisma.animalType.findMany({ where });
}

export async function getAnimalTypeById(id: string) {
  return prisma.animalType.findUnique({ where: { id } });
}

export async function updateAnimalType(id: string, data: any) {
  return prisma.animalType.update({ where: { id }, data });
}

export async function deleteAnimalType(id: string) {
  return prisma.animalType.delete({ where: { id } });
} 