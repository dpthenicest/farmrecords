import { prisma } from '../lib/prisma';

export async function createAnimalType(data) {
  return prisma.animalType.create({ data });
}

export async function getAnimalTypes(where = {}) {
  return prisma.animalType.findMany({ where });
}

export async function getAnimalTypeById(id) {
  return prisma.animalType.findUnique({ where: { id } });
}

export async function updateAnimalType(id, data) {
  return prisma.animalType.update({ where: { id }, data });
}

export async function deleteAnimalType(id) {
  return prisma.animalType.delete({ where: { id } });
} 