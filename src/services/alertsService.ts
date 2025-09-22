import { prisma } from "@/lib/prisma"

export async function getAlertsForUser(userId: number) {
  // Low stock items (user's inventory)
  const lowStockItems = await prisma.inventory.findMany({
    where: {
      userId,
      currentQuantity: { lte: prisma.inventory.fields.reorderLevel },
      isActive: true,
    },
    select: {
      itemName: true,
      currentQuantity: true,
      reorderLevel: true,
    },
  })

  // Upcoming expenses (financial records of type EXPENSE with due dates)
  const upcomingExpenses = await prisma.financialRecord.findMany({
    where: {
      userId,
      transactionType: "EXPENSE",
      transactionDate: { gte: new Date() },
    },
    select: {
      id: true,
      description: true,
      amount: true,
      transactionDate: true,
    },
    orderBy: { transactionDate: "asc" },
    take: 5,
  })

  // Pending tasks
  const pendingTasks = await prisma.task.findMany({
    where: {
      OR: [{ userId }, { assignedTo: userId }],
      status: "PENDING",
    },
    select: {
      id: true,
      taskTitle: true,
      dueDate: true,
    },
    orderBy: { dueDate: "asc" },
    take: 5,
  })

  return {
    lowStockItems: lowStockItems.map(i => ({
      product: i.itemName,
      quantity: Number(i.currentQuantity),
      threshold: Number(i.reorderLevel),
    })),
    upcomingExpenses: upcomingExpenses.map(e => ({
      id: e.id,
      description: e.description,
      amount: e.amount.toString(),
      dueDate: e.transactionDate.toISOString().split("T")[0],
    })),
    pendingTasks: pendingTasks.map(t => ({
      id: t.id,
      task: t.taskTitle,
      dueDate: t.dueDate?.toISOString().split("T")[0],
    })),
  }
}

export async function getAggregatedAlerts() {
  // Low stock items (all users)
  const lowStockItems = await prisma.inventory.findMany({
    where: {
      currentQuantity: { lte: prisma.inventory.fields.reorderLevel },
      isActive: true,
    },
    select: {
      itemName: true,
      currentQuantity: true,
      reorderLevel: true,
    },
  })

  const upcomingExpenses = await prisma.financialRecord.findMany({
    where: {
      transactionType: "EXPENSE",
      transactionDate: { gte: new Date() },
    },
    select: {
      id: true,
      description: true,
      amount: true,
      transactionDate: true,
    },
    orderBy: { transactionDate: "asc" },
    take: 10,
  })

  const pendingTasks = await prisma.task.findMany({
    where: { status: "PENDING" },
    select: {
      id: true,
      taskTitle: true,
      dueDate: true,
    },
    orderBy: { dueDate: "asc" },
    take: 10,
  })

  return {
    lowStockItems: lowStockItems.map(i => ({
      product: i.itemName,
      quantity: Number(i.currentQuantity),
      threshold: Number(i.reorderLevel),
    })),
    upcomingExpenses: upcomingExpenses.map(e => ({
      id: e.id,
      description: e.description,
      amount: e.amount.toString(),
      dueDate: e.transactionDate.toISOString().split("T")[0],
    })),
    pendingTasks: pendingTasks.map(t => ({
      id: t.id,
      task: t.taskTitle,
      dueDate: t.dueDate?.toISOString().split("T")[0],
    })),
  }
}
