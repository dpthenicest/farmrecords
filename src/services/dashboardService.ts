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

    // Overdue Tasks
    const overdueTasks = await prisma.task.count({
      where: { 
        ...whereUser, 
        status: "PENDING",
        dueDate: { lt: new Date() }
      },
    });

    // Upcoming Maintenance (next 30 days)
    const upcomingMaintenance = await prisma.assetMaintenance.count({
      where: {
        ...whereUser,
        status: "SCHEDULED",
        scheduledDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      },
    });

    // Overdue Maintenance
    const overdueMaintenance = await prisma.assetMaintenance.count({
      where: {
        ...whereUser,
        status: "SCHEDULED",
        scheduledDate: { lt: new Date() }
      },
    });

    // Total Assets Value
    const totalAssetsValue = await prisma.asset.aggregate({
      _sum: { currentValue: true },
      where: { ...whereUser, status: "ACTIVE" },
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
      overdueTasks,
      upcomingMaintenance,
      overdueMaintenance,
      totalAssetsValue: totalAssetsValue._sum.currentValue?.toFixed(2) || "0.00",
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
},

  async getComprehensiveAlerts(userId?: number, scope: "OWNER" | "ADMIN" = "OWNER") {
    const whereUser = scope === "OWNER" ? { userId } : {};

    // Low Stock Items
    const lowStockItems = await prisma.inventory.findMany({
      where: {
        ...whereUser,
        currentQuantity: { lte: prisma.inventory.fields.reorderLevel },
        isActive: true,
      },
      select: {
        id: true,
        itemName: true,
        currentQuantity: true,
        reorderLevel: true,
        unitOfMeasure: true,
      },
      take: 10,
    });

    // Overdue Maintenance
    const overdueMaintenance = await prisma.assetMaintenance.findMany({
      where: {
        ...whereUser,
        status: "SCHEDULED",
        scheduledDate: { lt: new Date() }
      },
      include: {
        asset: {
          select: {
            assetName: true,
            assetTag: true,
          }
        }
      },
      take: 10,
    });

    // Upcoming Maintenance (next 7 days)
    const upcomingMaintenance = await prisma.assetMaintenance.findMany({
      where: {
        ...whereUser,
        status: "SCHEDULED",
        scheduledDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: {
        asset: {
          select: {
            assetName: true,
            assetTag: true,
          }
        }
      },
      take: 10,
    });

    // Overdue Tasks
    const overdueTasks = await prisma.task.findMany({
      where: {
        ...whereUser,
        status: "PENDING",
        dueDate: { lt: new Date() }
      },
      select: {
        id: true,
        taskTitle: true,
        dueDate: true,
        priority: true,
      },
      take: 10,
    });

    // High Priority Pending Tasks
    const highPriorityTasks = await prisma.task.findMany({
      where: {
        ...whereUser,
        status: "PENDING",
        priority: { in: ["HIGH", "URGENT"] }
      },
      select: {
        id: true,
        taskTitle: true,
        dueDate: true,
        priority: true,
      },
      take: 10,
    });

    // Outstanding Invoices (overdue)
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        ...whereUser,
        status: "OVERDUE"
      },
      include: {
        customer: {
          select: {
            customerName: true,
          }
        }
      },
      take: 10,
    });

    return {
      lowStockItems: lowStockItems.map(item => ({
        id: item.id,
        itemName: item.itemName,
        currentQuantity: Number(item.currentQuantity),
        reorderLevel: Number(item.reorderLevel),
        unitOfMeasure: item.unitOfMeasure,
        severity: Number(item.currentQuantity) === 0 ? 'critical' : 'warning'
      })),
      overdueMaintenance: overdueMaintenance.map(maintenance => ({
        id: maintenance.id,
        assetName: maintenance.asset.assetName,
        assetTag: maintenance.asset.assetTag,
        maintenanceType: maintenance.maintenanceType,
        scheduledDate: maintenance.scheduledDate.toISOString().split('T')[0],
        daysOverdue: Math.floor((Date.now() - maintenance.scheduledDate.getTime()) / (1000 * 60 * 60 * 24))
      })),
      upcomingMaintenance: upcomingMaintenance.map(maintenance => ({
        id: maintenance.id,
        assetName: maintenance.asset.assetName,
        assetTag: maintenance.asset.assetTag,
        maintenanceType: maintenance.maintenanceType,
        scheduledDate: maintenance.scheduledDate.toISOString().split('T')[0],
        daysUntilDue: Math.floor((maintenance.scheduledDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      })),
      overdueTasks: overdueTasks.map(task => ({
        id: task.id,
        taskTitle: task.taskTitle,
        dueDate: task.dueDate?.toISOString().split('T')[0],
        priority: task.priority,
        daysOverdue: task.dueDate ? Math.floor((Date.now() - task.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
      })),
      highPriorityTasks: highPriorityTasks.map(task => ({
        id: task.id,
        taskTitle: task.taskTitle,
        dueDate: task.dueDate?.toISOString().split('T')[0],
        priority: task.priority
      })),
      overdueInvoices: overdueInvoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customer?.customerName,
        totalAmount: invoice.totalAmount.toFixed(2),
        dueDate: invoice.dueDate?.toISOString().split('T')[0],
        daysOverdue: invoice.dueDate ? Math.floor((Date.now() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
      }))
    };
  },

  async getPerformanceReports(userId?: number, scope: "OWNER" | "ADMIN" = "OWNER") {
    const whereUser = scope === "OWNER" ? { userId } : {};

    // Financial Performance (last 12 months)
    const monthlyFinancials = await prisma.financialRecord.groupBy({
      by: ['transactionType'],
      where: {
        ...whereUser,
        transactionDate: {
          gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        }
      },
      _sum: {
        amount: true
      }
    });

    // Animal Performance Metrics
    const animalPerformance = await prisma.animalRecord.groupBy({
      by: ['recordType'],
      where: {
        ...whereUser,
        recordDate: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        }
      },
      _sum: {
        productionOutput: true
      },
      _avg: {
        productionOutput: true
      }
    });

    // Asset Utilization
    const assetUtilization = await prisma.asset.findMany({
      where: {
        ...whereUser,
        status: "ACTIVE"
      },
      include: {
        _count: {
          select: {
            maintenance: {
              where: {
                status: "COMPLETED",
                completedDate: {
                  gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
                }
              }
            }
          }
        }
      },
      take: 10
    });

    // Inventory Turnover (top moving items)
    const inventoryMovements = await prisma.inventoryMovement.groupBy({
      by: ['inventoryId'],
      where: {
        ...whereUser,
        movementDate: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        }
      },
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    });

    // Get inventory details for top moving items
    const topMovingInventory = await prisma.inventory.findMany({
      where: {
        id: {
          in: inventoryMovements.map(m => m.inventoryId)
        }
      },
      select: {
        id: true,
        itemName: true,
        currentQuantity: true,
        unitOfMeasure: true
      }
    });

    const revenue = monthlyFinancials.find(f => f.transactionType === 'INCOME')?._sum.amount || 0;
    const expenses = monthlyFinancials.find(f => f.transactionType === 'EXPENSE')?._sum.amount || 0;

    return {
      financialSummary: {
        totalRevenue: Number(revenue).toFixed(2),
        totalExpenses: Number(expenses).toFixed(2),
        netProfit: (Number(revenue) - Number(expenses)).toFixed(2),
        profitMargin: revenue > 0 ? (((Number(revenue) - Number(expenses)) / Number(revenue)) * 100).toFixed(1) : '0.0'
      },
      animalPerformance: animalPerformance.map(perf => ({
        recordType: perf.recordType,
        totalOutput: Number(perf._sum.productionOutput || 0),
        averageOutput: Number(perf._avg.productionOutput || 0).toFixed(2)
      })),
      assetUtilization: assetUtilization.map(asset => ({
        id: asset.id,
        assetName: asset.assetName,
        assetTag: asset.assetTag,
        currentValue: asset.currentValue.toFixed(2),
        maintenanceCount: asset._count.maintenance,
        utilizationScore: asset._count.maintenance > 0 ? 'High' : 'Low'
      })),
      topMovingInventory: topMovingInventory.map(item => {
        const movement = inventoryMovements.find(m => m.inventoryId === item.id);
        return {
          id: item.id,
          itemName: item.itemName,
          currentQuantity: Number(item.currentQuantity),
          unitOfMeasure: item.unitOfMeasure,
          totalMovement: Number(movement?._sum.quantity || 0)
        };
      })
    };
  }
};
