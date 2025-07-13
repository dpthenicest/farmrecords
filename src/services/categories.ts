import { prisma } from '../lib/prisma';

export async function createCategory(data: any) {
  return prisma.category.create({ 
    data,
    include: {
      categoryType: true
    }
  });
}

export async function getCategories(where: any = {}) {
  return prisma.category.findMany({ 
    where,
    include: {
      categoryType: true
    }
  });
}

export async function getCategoryById(id: string) {
  return prisma.category.findUnique({ 
    where: { id },
    include: {
      categoryType: true
    }
  });
}

export async function updateCategory(id: string, data: any) {
  return prisma.category.update({ 
    where: { id }, 
    data,
    include: {
      categoryType: true
    }
  });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } });
} 