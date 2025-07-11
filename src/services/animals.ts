import { prisma } from '../lib/prisma';

export async function createAnimal(data) {
  return prisma.animal.create({ data });
}

export async function getAnimals(where = {}) {
  return prisma.animal.findMany({ where });
}

export async function getAnimalById(id) {
  return prisma.animal.findUnique({ where: { id } });
}

export async function updateAnimal(id, data) {
  return prisma.animal.update({ where: { id }, data });
}

export async function deleteAnimal(id) {
  return prisma.animal.delete({ where: { id } });
} 