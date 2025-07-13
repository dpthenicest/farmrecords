import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  try {
    // Get total animals
    const totalAnimals = await prisma.animal.count()

    // Get all records with category type
    const records = await prisma.record.findMany({
      include: {
        category: { include: { categoryType: true } },
        animal: true,
      },
    })

    // Calculate total income and expenses
    let totalIncome = 0
    let totalExpenses = 0
    for (const record of records) {
      const amount = Number(record.unitPrice) * Number(record.quantity)
      if (record.category?.categoryType?.name === 'INCOME') {
        totalIncome += amount
      } else if (record.category?.categoryType?.name === 'EXPENSE') {
        totalExpenses += amount
      }
    }
    const netProfit = totalIncome - totalExpenses

    // Get the 3 most recent records
    const recentRecords = await prisma.record.findMany({
      orderBy: { date: 'desc' },
      take: 3,
      include: {
        category: { include: { categoryType: true } },
        animal: { include: { animalType: true } },
      },
    })

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netProfit,
      totalAnimals,
      recentRecords,
    })
  } catch (e) {
    return NextResponse.json({ error: 'Server error', details: String(e) }, { status: 500 })
  }
}
