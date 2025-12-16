import { prisma } from "@/lib/prisma"

interface Pagination {
  page?: number
  limit?: number
}

interface FilterOptions {
  priority?: string
  status?: string
  assignedTo?: number
  animalBatchId?: number
  assetId?: number
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

interface TaskData {
  taskTitle: string
  description?: string
  priority: string
  status: string
  dueDate?: Date
  assignedTo?: number
  animalBatchId?: number
  assetId?: number
  notes?: string
}

interface SystemEventData {
  eventType: string
  entityType: string
  entityId: number
  eventData?: any
}

export async function getTasks(userId: number | null, role: string, filters: FilterOptions, pagination: Pagination) {
  const { page = 1, limit = 20 } = pagination
  const skip = (page - 1) * limit

  const where: any = {}

  if (role !== "ADMIN") {
    where.OR = [
      { userId: userId }, // Tasks created by user
      { assignedTo: userId } // Tasks assigned to user
    ]
  }

  if (filters.priority) where.priority = filters.priority
  if (filters.status) where.status = filters.status
  if (filters.assignedTo) where.assignedTo = filters.assignedTo
  if (filters.animalBatchId) where.animalBatchId = filters.animalBatchId
  if (filters.assetId) where.assetId = filters.assetId
  
  if (filters.startDate && filters.endDate) {
    where.dueDate = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    }
  }

  const total = await prisma.task.count({ where })

  const tasks = await prisma.task.findMany({
    where,
    skip,
    take: limit,
    orderBy: filters.sortBy ? { [filters.sortBy]: filters.sortOrder || "asc" } : { createdAt: "desc" },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      assignee: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      animalBatch: {
        select: {
          id: true,
          batchCode: true,
          species: true,
          breed: true
        }
      },
      asset: {
        select: {
          id: true,
          assetName: true,
          assetCode: true,
          assetType: true
        }
      }
    }
  })

  return {
    data: tasks,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export async function getTaskById(id: number, userId: number, role: string) {
  const where: any = { id }
  
  if (role !== "ADMIN") {
    where.OR = [
      { userId: userId },
      { assignedTo: userId }
    ]
  }

  return prisma.task.findFirst({ 
    where,
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      assignee: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      animalBatch: {
        select: {
          id: true,
          batchCode: true,
          species: true,
          breed: true
        }
      },
      asset: {
        select: {
          id: true,
          assetName: true,
          assetCode: true,
          assetType: true
        }
      }
    }
  })
}

export async function createTask(userId: number, data: TaskData) {
  return prisma.task.create({
    data: {
      ...data,
      userId,
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      assignee: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      animalBatch: {
        select: {
          id: true,
          batchCode: true,
          species: true,
          breed: true
        }
      },
      asset: {
        select: {
          id: true,
          assetName: true,
          assetCode: true,
          assetType: true
        }
      }
    }
  })
}

export async function updateTask(id: number, userId: number, role: string, data: Partial<TaskData>) {
  const where: any = { id }
  
  if (role !== "ADMIN") {
    where.OR = [
      { userId: userId },
      { assignedTo: userId }
    ]
  }

  // Check if task exists and user has access
  const existingTask = await prisma.task.findFirst({ where })
  if (!existingTask) {
    throw new Error("Task not found or access denied")
  }

  return prisma.task.update({
    where: { id },
    data,
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      assignee: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      animalBatch: {
        select: {
          id: true,
          batchCode: true,
          species: true,
          breed: true
        }
      },
      asset: {
        select: {
          id: true,
          assetName: true,
          assetCode: true,
          assetType: true
        }
      }
    }
  })
}

export async function deleteTask(id: number, userId: number, role: string) {
  const where: any = { id }
  
  if (role !== "ADMIN") {
    where.OR = [
      { userId: userId },
      { assignedTo: userId }
    ]
  }

  // Check if task exists and user has access
  const existingTask = await prisma.task.findFirst({ where })
  if (!existingTask) {
    throw new Error("Task not found or access denied")
  }

  return prisma.task.delete({ where: { id } })
}

export async function getTasksAssignedToMe(userId: number) {
  return prisma.task.findMany({
    where: {
      assignedTo: userId,
      status: {
        not: "COMPLETED"
      }
    },
    orderBy: [
      { priority: "desc" },
      { dueDate: "asc" }
    ],
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      animalBatch: {
        select: {
          id: true,
          batchCode: true,
          species: true,
          breed: true
        }
      },
      asset: {
        select: {
          id: true,
          assetName: true,
          assetCode: true,
          assetType: true
        }
      }
    }
  })
}

export async function getOverdueTasks(userId: number | null, role: string) {
  const where: any = {
    dueDate: {
      lt: new Date()
    },
    status: {
      not: "COMPLETED"
    }
  }

  if (role !== "ADMIN") {
    where.OR = [
      { userId: userId },
      { assignedTo: userId }
    ]
  }

  return prisma.task.findMany({
    where,
    orderBy: { dueDate: "asc" },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      assignee: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      animalBatch: {
        select: {
          id: true,
          batchCode: true,
          species: true,
          breed: true
        }
      },
      asset: {
        select: {
          id: true,
          assetName: true,
          assetCode: true,
          assetType: true
        }
      }
    }
  })
}

export async function completeTask(id: number, userId: number, role: string, notes?: string) {
  const where: any = { id }
  
  if (role !== "ADMIN") {
    where.OR = [
      { userId: userId },
      { assignedTo: userId }
    ]
  }

  // Check if task exists and user has access
  const existingTask = await prisma.task.findFirst({ where })
  if (!existingTask) {
    throw new Error("Task not found or access denied")
  }

  return prisma.task.update({
    where: { id },
    data: {
      status: "COMPLETED",
      completedDate: new Date(),
      notes: notes || existingTask.notes
    },
    include: {
      creator: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      assignee: {
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true
        }
      },
      animalBatch: {
        select: {
          id: true,
          batchCode: true,
          species: true,
          breed: true
        }
      },
      asset: {
        select: {
          id: true,
          assetName: true,
          assetCode: true,
          assetType: true
        }
      }
    }
  })
}

// Automatic task creation from system events
export async function createTaskFromSystemEvent(userId: number, eventData: SystemEventData) {
  const { eventType, entityType, entityId } = eventData

  let taskData: TaskData | null = null

  switch (eventType) {
    case "MAINTENANCE_DUE":
      if (entityType === "ASSET") {
        const asset = await prisma.asset.findUnique({ where: { id: entityId } })
        if (asset) {
          taskData = {
            taskTitle: `Maintenance Due: ${asset.assetName}`,
            description: `Scheduled maintenance is due for asset ${asset.assetCode}`,
            priority: "HIGH",
            status: "PENDING",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            assetId: entityId,
            notes: "Auto-generated from maintenance schedule"
          }
        }
      }
      break

    case "LOW_STOCK_ALERT":
      if (entityType === "INVENTORY") {
        const inventory = await prisma.inventory.findUnique({ where: { id: entityId } })
        if (inventory) {
          taskData = {
            taskTitle: `Low Stock Alert: ${inventory.itemName}`,
            description: `Inventory item ${inventory.itemCode} is below reorder level`,
            priority: "MEDIUM",
            status: "PENDING",
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
            notes: "Auto-generated from inventory monitoring"
          }
        }
      }
      break

    case "ANIMAL_HEALTH_CHECK":
      if (entityType === "ANIMAL_BATCH") {
        const batch = await prisma.animalBatch.findUnique({ where: { id: entityId } })
        if (batch) {
          taskData = {
            taskTitle: `Health Check Required: ${batch.batchCode}`,
            description: `Regular health check is due for batch ${batch.batchCode}`,
            priority: "HIGH",
            status: "PENDING",
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
            animalBatchId: entityId,
            notes: "Auto-generated from health monitoring schedule"
          }
        }
      }
      break

    case "INVOICE_OVERDUE":
      if (entityType === "INVOICE") {
        const invoice = await prisma.invoice.findUnique({ 
          where: { id: entityId },
          include: { customer: true }
        })
        if (invoice) {
          taskData = {
            taskTitle: `Follow up Overdue Invoice: ${invoice.invoiceNumber}`,
            description: `Invoice ${invoice.invoiceNumber} for ${invoice.customer.customerName} is overdue`,
            priority: "HIGH",
            status: "PENDING",
            dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
            notes: "Auto-generated from invoice monitoring"
          }
        }
      }
      break

    case "PURCHASE_ORDER_RECEIVED":
      if (entityType === "PURCHASE_ORDER") {
        const po = await prisma.purchaseOrder.findUnique({ 
          where: { id: entityId },
          include: { supplier: true }
        })
        if (po) {
          taskData = {
            taskTitle: `Process Received Purchase Order: ${po.poNumber}`,
            description: `Purchase order ${po.poNumber} from ${po.supplier.supplierName} has been received and needs processing`,
            priority: "MEDIUM",
            status: "PENDING",
            dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            notes: "Auto-generated from purchase order processing"
          }
        }
      }
      break

    default:
      // Generic task creation for unknown event types
      taskData = {
        taskTitle: `System Event: ${eventType}`,
        description: `A system event of type ${eventType} occurred for ${entityType} ${entityId}`,
        priority: "MEDIUM",
        status: "PENDING",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        notes: "Auto-generated from system event"
      }
  }

  if (taskData) {
    return createTask(userId, taskData)
  }

  return null
}

// Generate alerts for overdue tasks
export async function generateOverdueTaskAlerts(userId: number | null, role: string) {
  const overdueTasks = await getOverdueTasks(userId, role)
  
  const alerts = overdueTasks.map(task => ({
    id: task.id,
    type: "OVERDUE_TASK",
    title: `Overdue Task: ${task.taskTitle}`,
    message: `Task "${task.taskTitle}" was due on ${task.dueDate?.toLocaleDateString()}`,
    priority: task.priority,
    entityType: "TASK",
    entityId: task.id,
    createdAt: new Date()
  }))

  return alerts
}

// Validation functions
export function validateTaskData(data: TaskData): string[] {
  const errors: string[] = []

  if (!data.taskTitle || data.taskTitle.trim().length === 0) {
    errors.push("Task title is required")
  }

  if (data.taskTitle && data.taskTitle.length > 255) {
    errors.push("Task title must be 255 characters or less")
  }

  const validPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"]
  if (!data.priority || !validPriorities.includes(data.priority)) {
    errors.push("Valid priority is required (LOW, MEDIUM, HIGH, URGENT)")
  }

  const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]
  if (!data.status || !validStatuses.includes(data.status)) {
    errors.push("Valid status is required (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)")
  }

  if (data.dueDate && isNaN(data.dueDate.getTime())) {
    errors.push("Due date must be a valid date")
  }

  if (data.dueDate && data.dueDate < new Date()) {
    errors.push("Due date cannot be in the past")
  }

  if (data.assignedTo !== undefined && (typeof data.assignedTo !== 'number' || data.assignedTo <= 0)) {
    errors.push("Assigned user ID must be a positive number")
  }

  if (data.animalBatchId !== undefined && (typeof data.animalBatchId !== 'number' || data.animalBatchId <= 0)) {
    errors.push("Animal batch ID must be a positive number")
  }

  if (data.assetId !== undefined && (typeof data.assetId !== 'number' || data.assetId <= 0)) {
    errors.push("Asset ID must be a positive number")
  }

  return errors
}

export function validateTaskAssignment(assignedTo?: number): string[] {
  const errors: string[] = []

  if (assignedTo !== undefined && (typeof assignedTo !== 'number' || assignedTo <= 0)) {
    errors.push("Assigned user ID must be a positive number")
  }

  return errors
}

export function validateTaskEntityLinking(animalBatchId?: number | null, assetId?: number | null): string[] {
  const errors: string[] = []

  if (animalBatchId !== undefined && animalBatchId !== null && (typeof animalBatchId !== 'number' || animalBatchId <= 0)) {
    errors.push("Animal batch ID must be a positive number")
  }

  if (assetId !== undefined && assetId !== null && (typeof assetId !== 'number' || assetId <= 0)) {
    errors.push("Asset ID must be a positive number")
  }

  return errors
}