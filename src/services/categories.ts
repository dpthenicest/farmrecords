import { prisma } from '../lib/prisma';

export async function createCategory(data) {
  return prisma.category.create({ 
    data,
    include: {
      categoryType: true
    }
  });
}

export async function getCategories(where = {}) {
  return prisma.category.findMany({ 
    where,
    include: {
      categoryType: true
    }
  });
}

export async function getCategoryById(id) {
  return prisma.category.findUnique({ 
    where: { id },
    include: {
      categoryType: true
    }
  });
}

export async function updateCategory(id, data) {
  return prisma.category.update({ 
    where: { id }, 
    data,
    include: {
      categoryType: true
    }
  });
}

export async function deleteCategory(id) {
  return prisma.category.delete({ where: { id } });
} 