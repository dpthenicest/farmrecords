import { prisma } from "@/lib/prisma";

export const dashboardService = {
  async getOverview(userId?: number, scope: "OWNER" | "ADMIN" = "OWNER") {
    const whereUser = scope === "OWNER" ? { userId } : {};

    // Total Revenue (INCOME)
    const totalRevenue = await prisma.financialRecord.aggregate({
      _sum: { amount: true },
      where: { ...whereUser, transactionType: "INCOME" },
    });

    // Total Expenses
    const totalExpenses = await prisma.financialRecord.aggregate({
      _sum: { amount: true },
      where: { ...whereUser, transactionType: "EXPENSE" },
    });

    // Outstanding Invoices
    const outstandingInvoices = await prisma.invoice.count({
      where: { ...whereUser, status: { in: ["SENT", "OVERDUE"] } },
    });

    // Low Stock Items
    const lowStockItems = await prisma.inventory.count({
      where: {
        ...whereUser,
        currentQuantity: { lte: prisma.inventory.fields.reorderLevel },
      },
    });

    // Active Batches
    const activeBatches = await prisma.animalBatch.count({
      where: { ...whereUser, batchStatus: { in: ["ACTIVE", "GROWING", "PRODUCING"] } },
    });

    // Pending Tasks
    const pendingTasks = await prisma.task.count({
      where: { ...whereUser, status: "PENDING" },
    });

    // Recent Transactions (last 7 days)
    const recentTransactions = await prisma.financialRecord.findMany({
      where: { ...whereUser },
      orderBy: { transactionDate: "desc" },
      take: 5,
      select: {
        id: true,
        transactionType: true,
        amount: true,
        description: true,
        transactionDate: true,
      },
    });

    return {
      totalRevenue: totalRevenue._sum.amount?.toFixed(2) || "0.00",
      totalExpenses: totalExpenses._sum.amount?.toFixed(2) || "0.00",
      netProfit: (
        (Number(totalRevenue._sum.amount) || 0) - (Number(totalExpenses._sum.amount) || 0)
      ).toFixed(2),
      outstandingInvoices,
      lowStockItems,
      activeBatches,
      pendingTasks,
      recentTransactions: recentTransactions.map((t) => ({
        id: t.id,
        type: t.transactionType,
        amount: t.amount.toFixed(2),
        description: t.description,
        date: t.transactionDate.toISOString().split("T")[0],
      })),
    };
  },

  async getFinancialSummary(userId?: number, scope: "OWNER" | "ADMIN" = "OWNER") {
    const whereUser = scope === "OWNER" ? { userId } : {}

    // Revenue
    const totalRevenue = await prisma.financialRecord.aggregate({
      _sum: { amount: true },
      where: { ...whereUser, transactionType: "INCOME" }
    })

    // Expenses
    const totalExpenses = await prisma.financialRecord.aggregate({
      _sum: { amount: true },
      where: { ...whereUser, transactionType: "EXPENSE" }
    })

    // Outstanding Debts
    const outstandingDebts = await prisma.invoice.aggregate({
      _sum: { totalAmount: true },
      where: { ...whereUser, status: { in: ["SENT", "OVERDUE"] } }
    })

    // Assets
    const totalAssets = await prisma.asset.aggregate({
      _sum: { purchaseCost: true },
      where: { ...whereUser }
    })

    // Liabilities
    const totalLiabilities = await prisma.purchaseOrder.aggregate({
      _sum: { totalAmount: true },
      where: { ...whereUser, status: { in: ["SENT", "PARTIAL"] } }
    })

    const revenue = Number(totalRevenue._sum.amount) || 0
    const expenses = Number(totalExpenses._sum.amount) || 0
    const debts = Number(outstandingDebts._sum.totalAmount) || 0
    const assets = totalAssets._sum.purchaseCost || 0
    const liabilities = totalLiabilities._sum.totalAmount || 0

    return {
      totalRevenue: revenue.toFixed(2),
      totalExpenses: expenses.toFixed(2),
      netProfit: ((revenue) - expenses).toFixed(2),
      cashFlow: (revenue - expenses - debts).toFixed(2), // simple cash flow
      outstandingDebts: debts.toFixed(2),
      totalAssets: assets.toFixed(2),
      totalLiabilities: liabilities.toFixed(2),
    }
  },

  async getProductionMetrics(userId?: number, isAdmin: boolean = false) {
  const whereClause = isAdmin ? {} : { userId };

  // Batch stats
  const [activeBatches, completedBatches, pendingBatches] = await Promise.all([
    prisma.animalBatch.count({ where: { ...whereClause, batchStatus: "ACTIVE" } }),
    prisma.animalBatch.count({ where: { ...whereClause, batchStatus: "COMPLETED" } }),
    prisma.animalBatch.count({ where: { ...whereClause, batchStatus: "PENDING" } }),
  ]);

  // Production output
  const productionRecords = await prisma.animalRecord.aggregate({
    where: { ...whereClause, recordType: "PRODUCTION" },
    _sum: { productionOutput: true },
  });

  const defectiveRecords = await prisma.animalRecord.aggregate({
    where: { ...whereClause, recordType: "DEFECTIVE" },
    _sum: { productionOutput: true },
  });

  const totalUnitsProduced = Number(productionRecords._sum.productionOutput) || 0;
  const defectiveUnits = Number(defectiveRecords._sum.productionOutput) || 0;

  const productionEfficiency =
    totalUnitsProduced > 0
      ? `${(((totalUnitsProduced - defectiveUnits) / totalUnitsProduced) * 100).toFixed(1)}%`
      : "0%";

  // Top products (group by species/breed from batches)
  const topProductsRaw = await prisma.animalBatch.groupBy({
    by: ["species"],
    where: { ...whereClause },
    _sum: { currentQuantity: true },
    orderBy: { _sum: { currentQuantity: "desc" } },
    take: 3,
  });

  const topProducts = topProductsRaw.map(p => ({
    name: p.species,
    unitsProduced: Number(p._sum.currentQuantity || 0),
  }));

  return {
    activeBatches,
    completedBatches,
    pendingBatches,
    totalUnitsProduced: Number(totalUnitsProduced),
    defectiveUnits: Number(defectiveUnits),
    productionEfficiency,
    topProducts,
  };
}
};
