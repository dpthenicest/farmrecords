import { prisma } from '../lib/prisma';

export async function createCategory(data) {
  return prisma.category.create({ data });
}

export async function getCategories(where = {}) {
  return prisma.category.findMany({ where });
}

export async function getCategoryById(id) {
  return prisma.category.findUnique({ where: { id } });
}

export async function updateCategory(id, data) {
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id) {
  return prisma.category.delete({ where: { id } });
} 