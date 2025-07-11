import { prisma } from '../lib/prisma';

export async function createRecord(data) {
  return prisma.record.create({ data });
}

export async function getRecords({ where = {}, page = 1, pageSize = 10, orderBy = { date: 'desc' } } = {}) {
  const [records, total] = await Promise.all([
    prisma.record.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
    }),
    prisma.record.count({ where }),
  ]);
  return { records, total, page, pageSize };
}

export async function getRecordById(id) {
  return prisma.record.findUnique({ where: { id } });
}

export async function updateRecord(id, data) {
  return prisma.record.update({ where: { id }, data });
}

export async function deleteRecord(id) {
  return prisma.record.delete({ where: { id } });
} 