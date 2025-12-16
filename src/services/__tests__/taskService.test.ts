import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { prisma } from '@/lib/prisma'
import { 
  createTaskFromSystemEvent,
  generateOverdueTaskAlerts,
  validateTaskData,
  validateTaskAssignment,
  validateTaskEntityLinking,
  getTasks,
  createTask,
  updateTask,
  getOverdueTasks
} from '../taskService'

// Helper to generate unique identifiers
let testCounter = 0
const getUniqueId = () => {
  testCounter++
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${testCounter}`
}

describe('Task Service Property Tests', () => {
  beforeEach(async () => {
    // Clean up test data in correct order to handle foreign key constraints
    await prisma.task.deleteMany()
    await prisma.animalRecord.deleteMany()
    await prisma.animal.deleteMany()
    await prisma.animalBatch.deleteMany()
    await prisma.asset.deleteMany()
    await prisma.inventoryMovement.deleteMany()
    await prisma.inventory.deleteMany()
    await prisma.invoiceItem.deleteMany()
    await prisma.invoice.deleteMany()
    await prisma.purchaseOrderItem.deleteMany()
    await prisma.purchaseOrder.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.salesExpenseCategory.deleteMany()
    await prisma.user.deleteMany()
  })

  afterEach(async () => {
    // Clean up test data in correct order to handle foreign key constraints
    await prisma.task.deleteMany()
    await prisma.animalRecord.deleteMany()
    await prisma.animal.deleteMany()
    await prisma.animalBatch.deleteMany()
    await prisma.asset.deleteMany()
    await prisma.inventoryMovement.deleteMany()
    await prisma.inventory.deleteMany()
    await prisma.invoiceItem.deleteMany()
    await prisma.invoice.deleteMany()
    await prisma.purchaseOrderItem.deleteMany()
    await prisma.purchaseOrder.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.salesExpenseCategory.deleteMany()
    await prisma.user.deleteMany()
  })

  // **Feature: farm-management-completion, Property 18: System Event Task Creation**
  // **Validates: Requirements 7.1**
  it('should automatically create relevant tasks for all system events', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          eventType: fc.constantFrom(
            'MAINTENANCE_DUE',
            'LOW_STOCK_ALERT', 
            'ANIMAL_HEALTH_CHECK',
            'INVOICE_OVERDUE',
            'PURCHASE_ORDER_RECEIVED',
            'UNKNOWN_EVENT'
          ),
          entityType: fc.constantFrom('ASSET', 'INVENTORY', 'ANIMAL_BATCH', 'INVOICE', 'PURCHASE_ORDER'),
          eventData: fc.record({
            priority: fc.constantFrom('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
            notes: fc.option(fc.string({ minLength: 1, maxLength: 200 }))
          })
        }),
        async (testData) => {
          const uniqueId = getUniqueId()
          
          // Create test user
          const user = await prisma.user.create({
            data: {
              username: `user_${uniqueId}`,
              email: `test${uniqueId}@example.com`,
              passwordHash: 'hashedpassword123',
              firstName: 'Test',
              lastName: 'User',
              role: 'ADMIN'
            }
          })

          let entityId: number
          let expectedTaskTitle: string
          let expectedEntityLink: { animalBatchId?: number; assetId?: number } = {}

          // Create appropriate entity based on event type and entity type
          switch (testData.eventType) {
            case 'MAINTENANCE_DUE':
              if (testData.entityType === 'ASSET') {
                const asset = await prisma.asset.create({
                  data: {
                    assetName: `Asset ${uniqueId}`,
                    assetCode: `AST_${uniqueId}`,
                    assetType: 'EQUIPMENT',
                    purchaseCost: 10000,
                    purchaseDate: new Date(),
                    salvageValue: 1000,
                    usefulLifeYears: 10,
                    depreciationRate: 10,
                    conditionStatus: 'GOOD',
                    userId: user.id
                  }
                })
                entityId = asset.id
                expectedTaskTitle = `Maintenance Due: ${asset.assetName}`
                expectedEntityLink.assetId = asset.id
              } else {
                // Skip if entity type doesn't match event type
                return
              }
              break

            case 'LOW_STOCK_ALERT':
              if (testData.entityType === 'INVENTORY') {
                const inventory = await prisma.inventory.create({
                  data: {
                    itemName: `Item ${uniqueId}`,
                    itemCode: `ITM_${uniqueId}`,
                    unitOfMeasure: 'kg',
                    currentQuantity: 5,
                    reorderLevel: 10,
                    unitCost: 100,
                    sellingPrice: 150,
                    userId: user.id
                  }
                })
                entityId = inventory.id
                expectedTaskTitle = `Low Stock Alert: ${inventory.itemName}`
              } else {
                return
              }
              break

            case 'ANIMAL_HEALTH_CHECK':
              if (testData.entityType === 'ANIMAL_BATCH') {
                const batch = await prisma.animalBatch.create({
                  data: {
                    batchCode: `batch_${uniqueId}`,
                    species: 'CATTLE',
                    breed: 'Holstein',
                    initialQuantity: 10,
                    currentQuantity: 10,
                    batchStartDate: new Date(),
                    batchStatus: 'ACTIVE',
                    totalCost: 5000,
                    userId: user.id
                  }
                })
                entityId = batch.id
                expectedTaskTitle = `Health Check Required: ${batch.batchCode}`
                expectedEntityLink.animalBatchId = batch.id
              } else {
                return
              }
              break

            case 'INVOICE_OVERDUE':
              if (testData.entityType === 'INVOICE') {
                const customer = await prisma.customer.create({
                  data: {
                    customerName: `Customer ${uniqueId}`,
                    customerCode: `CUST_${uniqueId}`,
                    customerType: 'INDIVIDUAL',
                    userId: user.id
                  }
                })
                const invoice = await prisma.invoice.create({
                  data: {
                    invoiceNumber: `INV_${uniqueId}`,
                    invoiceDate: new Date(),
                    dueDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                    subtotal: 1000,
                    taxAmount: 100,
                    totalAmount: 1100,
                    status: 'OVERDUE',
                    userId: user.id,
                    customerId: customer.id
                  }
                })
                entityId = invoice.id
                expectedTaskTitle = `Follow up Overdue Invoice: ${invoice.invoiceNumber}`
              } else {
                return
              }
              break

            case 'PURCHASE_ORDER_RECEIVED':
              if (testData.entityType === 'PURCHASE_ORDER') {
                const supplier = await prisma.supplier.create({
                  data: {
                    supplierName: `Supplier ${uniqueId}`,
                    supplierCode: `SUPP_${uniqueId}`,
                    supplierType: 'GENERAL',
                    userId: user.id
                  }
                })
                const po = await prisma.purchaseOrder.create({
                  data: {
                    poNumber: `PO_${uniqueId}`,
                    orderDate: new Date(),
                    subtotal: 2000,
                    taxAmount: 200,
                    totalAmount: 2200,
                    status: 'RECEIVED',
                    userId: user.id,
                    supplierId: supplier.id
                  }
                })
                entityId = po.id
                expectedTaskTitle = `Process Received Purchase Order: ${po.poNumber}`
              } else {
                return
              }
              break

            default:
              // For unknown events, create a generic entity
              const asset = await prisma.asset.create({
                data: {
                  assetName: `Asset ${uniqueId}`,
                  assetCode: `AST_${uniqueId}`,
                  assetType: 'EQUIPMENT',
                  purchaseCost: 10000,
                  purchaseDate: new Date(),
                  salvageValue: 1000,
                  usefulLifeYears: 10,
                  depreciationRate: 10,
                  conditionStatus: 'GOOD',
                  userId: user.id
                }
              })
              entityId = asset.id
              expectedTaskTitle = `System Event: ${testData.eventType}`
          }

          // Create task from system event
          const task = await createTaskFromSystemEvent(user.id, {
            eventType: testData.eventType,
            entityType: testData.entityType,
            entityId: entityId!,
            eventData: testData.eventData
          })

          // Verify task was created for known event types
          if (['MAINTENANCE_DUE', 'LOW_STOCK_ALERT', 'ANIMAL_HEALTH_CHECK', 'INVOICE_OVERDUE', 'PURCHASE_ORDER_RECEIVED'].includes(testData.eventType)) {
            expect(task).toBeDefined()
            expect(task!.taskTitle).toBe(expectedTaskTitle)
            expect(task!.userId).toBe(user.id)
            expect(task!.status).toBe('PENDING')
            expect(task!.dueDate).toBeDefined()
            expect(task!.notes).toContain('Auto-generated')
            
            // Verify entity linking
            if (expectedEntityLink.assetId) {
              expect(task!.assetId).toBe(expectedEntityLink.assetId)
            }
            if (expectedEntityLink.animalBatchId) {
              expect(task!.animalBatchId).toBe(expectedEntityLink.animalBatchId)
            }
            
            // Verify priority is set appropriately
            expect(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).toContain(task!.priority)
            
            // Verify due date is in the future
            expect(task!.dueDate!.getTime()).toBeGreaterThan(Date.now())
          } else {
            // Unknown event types should still create generic tasks
            expect(task).toBeDefined()
            expect(task!.taskTitle).toContain('System Event')
            expect(task!.userId).toBe(user.id)
          }
        }
      ),
      { numRuns: 20 } // Reduced runs due to complex database operations
    )
  })

  // **Feature: farm-management-completion, Property 19: Task Assignment and Tracking**
  // **Validates: Requirements 7.2**
  it('should properly track task status throughout its lifecycle for all assignments', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          taskData: fc.record({
            taskTitle: fc.string({ minLength: 1, maxLength: 100 }),
            description: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
            priority: fc.constantFrom('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
            initialStatus: fc.constantFrom('PENDING', 'IN_PROGRESS'),
            dueDate: fc.option(fc.date({ min: new Date(), max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) })),
            notes: fc.option(fc.string({ minLength: 1, maxLength: 200 }))
          }),
          statusTransitions: fc.array(
            fc.constantFrom('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
            { minLength: 1, maxLength: 5 }
          ),
          assignmentChanges: fc.array(
            fc.boolean(), // true = assign to user, false = unassign
            { minLength: 0, maxLength: 3 }
          )
        }),
        async (testData) => {
          const uniqueId = getUniqueId()
          
          // Create test users
          const creator = await prisma.user.create({
            data: {
              username: `creator_${uniqueId}`,
              email: `creator${uniqueId}@example.com`,
              passwordHash: 'hashedpassword123',
              firstName: 'Creator',
              lastName: 'User',
              role: 'ADMIN'
            }
          })

          const assignee = await prisma.user.create({
            data: {
              username: `assignee_${uniqueId}`,
              email: `assignee${uniqueId}@example.com`,
              passwordHash: 'hashedpassword123',
              firstName: 'Assignee',
              lastName: 'User',
              role: 'WORKER'
            }
          })

          // Create initial task
          let task = await createTask(creator.id, {
            taskTitle: testData.taskData.taskTitle,
            description: testData.taskData.description,
            priority: testData.taskData.priority,
            status: testData.taskData.initialStatus,
            dueDate: testData.taskData.dueDate,
            notes: testData.taskData.notes
          })

          // Verify initial task creation
          expect(task.userId).toBe(creator.id)
          expect(task.taskTitle).toBe(testData.taskData.taskTitle)
          expect(task.priority).toBe(testData.taskData.priority)
          expect(task.status).toBe(testData.taskData.initialStatus)
          expect(task.assignedTo).toBeNull()

          let currentAssignee: number | undefined = undefined

          // Apply assignment changes
          for (const shouldAssign of testData.assignmentChanges) {
            if (shouldAssign && !currentAssignee) {
              // Assign task
              task = await updateTask(task.id, creator.id, creator.role, {
                assignedTo: assignee.id
              })
              currentAssignee = assignee.id
              
              expect(task.assignedTo).toBe(assignee.id)
              expect(task.assignee?.id).toBe(assignee.id)
              expect(task.assignee?.username).toBe(assignee.username)
            } else if (!shouldAssign && currentAssignee) {
              // Unassign task
              task = await updateTask(task.id, creator.id, creator.role, {
                assignedTo: null
              })
              currentAssignee = undefined
              
              expect(task.assignedTo).toBeNull()
              expect(task.assignee).toBeNull()
            }
          }

          // Apply status transitions
          let previousStatus = task.status
          for (const newStatus of testData.statusTransitions) {
            if (newStatus !== previousStatus) {
              const updateData: any = { status: newStatus }
              
              // If completing task, set completion date
              if (newStatus === 'COMPLETED') {
                updateData.completedDate = new Date()
              }
              
              task = await updateTask(task.id, creator.id, creator.role, updateData)
              
              expect(task.status).toBe(newStatus)
              
              if (newStatus === 'COMPLETED') {
                expect(task.completedDate).toBeDefined()
                expect(task.completedDate!.getTime()).toBeGreaterThan(task.createdAt.getTime())
              }
              
              previousStatus = newStatus
            }
          }

          // Verify task can be retrieved by both creator and assignee (if assigned)
          const taskByCreator = await getTasks(creator.id, creator.role, {}, { page: 1, limit: 10 })
          expect(taskByCreator.data.some(t => t.id === task.id)).toBe(true)

          if (currentAssignee) {
            const taskByAssignee = await getTasks(assignee.id, assignee.role, {}, { page: 1, limit: 10 })
            expect(taskByAssignee.data.some(t => t.id === task.id)).toBe(true)
            
            // Verify assignee can see their assigned tasks
            const assignedTasks = await getTasks(assignee.id, assignee.role, { assignedTo: assignee.id }, { page: 1, limit: 10 })
            expect(assignedTasks.data.some(t => t.id === task.id)).toBe(true)
          }

          // Verify task history is maintained
          const finalTask = await getTasks(creator.id, creator.role, {}, { page: 1, limit: 10 })
          const retrievedTask = finalTask.data.find(t => t.id === task.id)
          
          expect(retrievedTask).toBeDefined()
          expect(retrievedTask!.taskTitle).toBe(testData.taskData.taskTitle)
          expect(retrievedTask!.priority).toBe(testData.taskData.priority)
          expect(retrievedTask!.userId).toBe(creator.id)
          expect(retrievedTask!.creator.id).toBe(creator.id)
          
          if (currentAssignee) {
            expect(retrievedTask!.assignedTo).toBe(assignee.id)
            expect(retrievedTask!.assignee?.id).toBe(assignee.id)
          } else {
            expect(retrievedTask!.assignedTo).toBeNull()
            expect(retrievedTask!.assignee).toBeNull()
          }
        }
      ),
      { numRuns: 15 } // Reduced runs due to complex database operations
    )
  })

  // **Feature: farm-management-completion, Property 20: Task Entity Linking**
  // **Validates: Requirements 7.3**
  it('should maintain proper links to entities for all task-entity relationships', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          taskData: fc.record({
            taskTitle: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            description: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
            priority: fc.constantFrom('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
            status: fc.constantFrom('PENDING', 'IN_PROGRESS'),
            notes: fc.option(fc.string({ minLength: 1, maxLength: 200 }))
          }),
          entityType: fc.constantFrom('ANIMAL_BATCH', 'ASSET', 'NONE'),
          linkingOperations: fc.array(
            fc.record({
              operation: fc.constantFrom('LINK', 'UNLINK', 'CHANGE_LINK'),
              newEntityType: fc.option(fc.constantFrom('ANIMAL_BATCH', 'ASSET'))
            }),
            { minLength: 0, maxLength: 3 }
          )
        }),
        async (testData) => {
          const uniqueId = getUniqueId()
          
          // Create test user
          const user = await prisma.user.create({
            data: {
              username: `user_${uniqueId}`,
              email: `test${uniqueId}@example.com`,
              passwordHash: 'hashedpassword123',
              firstName: 'Test',
              lastName: 'User',
              role: 'ADMIN'
            }
          })

          // Create test entities
          const animalBatch = await prisma.animalBatch.create({
            data: {
              batchCode: `batch_${uniqueId}`,
              species: 'CATTLE',
              breed: 'Holstein',
              initialQuantity: 10,
              currentQuantity: 10,
              batchStartDate: new Date(),
              batchStatus: 'ACTIVE',
              totalCost: 5000,
              userId: user.id
            }
          })

          const asset = await prisma.asset.create({
            data: {
              assetName: `Asset ${uniqueId}`,
              assetCode: `AST_${uniqueId}`,
              assetType: 'EQUIPMENT',
              purchaseCost: 10000,
              purchaseDate: new Date(),
              salvageValue: 1000,
              usefulLifeYears: 10,
              depreciationRate: 10,
              conditionStatus: 'GOOD',
              userId: user.id
            }
          })

          // Create initial task with or without entity linking
          let initialTaskData = { ...testData.taskData }
          if (testData.entityType === 'ANIMAL_BATCH') {
            initialTaskData.animalBatchId = animalBatch.id
          } else if (testData.entityType === 'ASSET') {
            initialTaskData.assetId = asset.id
          }

          let task = await createTask(user.id, initialTaskData)

          // Verify initial entity linking
          if (testData.entityType === 'ANIMAL_BATCH') {
            expect(task.animalBatchId).toBe(animalBatch.id)
            expect(task.animalBatch?.id).toBe(animalBatch.id)
            expect(task.animalBatch?.batchCode).toBe(animalBatch.batchCode)
            expect(task.assetId).toBeNull()
            expect(task.asset).toBeNull()
          } else if (testData.entityType === 'ASSET') {
            expect(task.assetId).toBe(asset.id)
            expect(task.asset?.id).toBe(asset.id)
            expect(task.asset?.assetCode).toBe(asset.assetCode)
            expect(task.animalBatchId).toBeNull()
            expect(task.animalBatch).toBeNull()
          } else {
            expect(task.animalBatchId).toBeNull()
            expect(task.assetId).toBeNull()
            expect(task.animalBatch).toBeNull()
            expect(task.asset).toBeNull()
          }

          // Apply linking operations
          for (const operation of testData.linkingOperations) {
            let updateData: any = {}

            switch (operation.operation) {
              case 'LINK':
                if (!task.animalBatchId && !task.assetId && operation.newEntityType) {
                  if (operation.newEntityType === 'ANIMAL_BATCH') {
                    updateData.animalBatchId = animalBatch.id
                  } else if (operation.newEntityType === 'ASSET') {
                    updateData.assetId = asset.id
                  }
                }
                break

              case 'UNLINK':
                if (task.animalBatchId) {
                  updateData.animalBatchId = null
                }
                if (task.assetId) {
                  updateData.assetId = null
                }
                break

              case 'CHANGE_LINK':
                if (operation.newEntityType) {
                  // Clear existing links
                  updateData.animalBatchId = null
                  updateData.assetId = null
                  
                  // Set new link
                  if (operation.newEntityType === 'ANIMAL_BATCH') {
                    updateData.animalBatchId = animalBatch.id
                  } else if (operation.newEntityType === 'ASSET') {
                    updateData.assetId = asset.id
                  }
                }
                break
            }

            if (Object.keys(updateData).length > 0) {
              task = await updateTask(task.id, user.id, user.role, updateData)
            }
          }

          // Verify final entity linking state
          const finalTask = await getTasks(user.id, user.role, {}, { page: 1, limit: 10 })
          const retrievedTask = finalTask.data.find(t => t.id === task.id)
          
          expect(retrievedTask).toBeDefined()

          // Verify entity linking consistency
          if (task.animalBatchId) {
            expect(retrievedTask!.animalBatchId).toBe(task.animalBatchId)
            expect(retrievedTask!.animalBatch?.id).toBe(task.animalBatchId)
            expect(retrievedTask!.animalBatch?.batchCode).toBe(animalBatch.batchCode)
            expect(retrievedTask!.animalBatch?.species).toBe(animalBatch.species)
            expect(retrievedTask!.animalBatch?.breed).toBe(animalBatch.breed)
            
            // Should not have asset link
            expect(retrievedTask!.assetId).toBeNull()
            expect(retrievedTask!.asset).toBeNull()
          }

          if (task.assetId) {
            expect(retrievedTask!.assetId).toBe(task.assetId)
            expect(retrievedTask!.asset?.id).toBe(task.assetId)
            expect(retrievedTask!.asset?.assetCode).toBe(asset.assetCode)
            expect(retrievedTask!.asset?.assetName).toBe(asset.assetName)
            expect(retrievedTask!.asset?.assetType).toBe(asset.assetType)
            
            // Should not have animal batch link
            expect(retrievedTask!.animalBatchId).toBeNull()
            expect(retrievedTask!.animalBatch).toBeNull()
          }

          if (!task.animalBatchId && !task.assetId) {
            expect(retrievedTask!.animalBatchId).toBeNull()
            expect(retrievedTask!.assetId).toBeNull()
            expect(retrievedTask!.animalBatch).toBeNull()
            expect(retrievedTask!.asset).toBeNull()
          }

          // Verify that tasks can be filtered by entity
          if (task.animalBatchId) {
            const batchTasks = await getTasks(user.id, user.role, { animalBatchId: animalBatch.id }, { page: 1, limit: 10 })
            expect(batchTasks.data.some(t => t.id === task.id)).toBe(true)
            
            // Should not appear in asset filter
            const assetTasks = await getTasks(user.id, user.role, { assetId: asset.id }, { page: 1, limit: 10 })
            expect(assetTasks.data.some(t => t.id === task.id)).toBe(false)
          }

          if (task.assetId) {
            const assetTasks = await getTasks(user.id, user.role, { assetId: asset.id }, { page: 1, limit: 10 })
            expect(assetTasks.data.some(t => t.id === task.id)).toBe(true)
            
            // Should not appear in batch filter
            const batchTasks = await getTasks(user.id, user.role, { animalBatchId: animalBatch.id }, { page: 1, limit: 10 })
            expect(batchTasks.data.some(t => t.id === task.id)).toBe(false)
          }

          // Verify validation of entity linking
          const validationErrors = validateTaskEntityLinking(task.animalBatchId, task.assetId)
          expect(validationErrors).toHaveLength(0) // Should be valid
        }
      ),
      { numRuns: 15 } // Reduced runs due to complex database operations
    )
  })

  // **Feature: farm-management-completion, Property 21: Overdue Task Alert Generation**
  // **Validates: Requirements 7.4**
  it('should generate appropriate alerts for all overdue tasks', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          tasks: fc.array(
            fc.record({
              taskTitle: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
              description: fc.option(fc.string({ minLength: 1, maxLength: 500 })),
              priority: fc.constantFrom('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
              status: fc.constantFrom('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
              daysOverdue: fc.integer({ min: -30, max: 30 }), // negative = future, positive = overdue
              notes: fc.option(fc.string({ minLength: 1, maxLength: 200 }))
            }),
            { minLength: 1, maxLength: 10 }
          ),
          userRole: fc.constantFrom('ADMIN', 'WORKER')
        }),
        async (testData) => {
          const uniqueId = getUniqueId()
          
          // Create test users
          const adminUser = await prisma.user.create({
            data: {
              username: `admin_${uniqueId}`,
              email: `admin${uniqueId}@example.com`,
              passwordHash: 'hashedpassword123',
              firstName: 'Admin',
              lastName: 'User',
              role: 'ADMIN'
            }
          })

          const workerUser = await prisma.user.create({
            data: {
              username: `worker_${uniqueId}`,
              email: `worker${uniqueId}@example.com`,
              passwordHash: 'hashedpassword123',
              firstName: 'Worker',
              lastName: 'User',
              role: 'WORKER'
            }
          })

          const testUser = testData.userRole === 'ADMIN' ? adminUser : workerUser
          const otherUser = testData.userRole === 'ADMIN' ? workerUser : adminUser

          // Create tasks with various due dates and statuses
          const createdTasks = []
          for (const taskData of testData.tasks) {
            // For overdue tasks (daysOverdue > 0), set due date in the past
            // For future tasks (daysOverdue <= 0), set due date in the future
            const dueDate = taskData.daysOverdue > 0 
              ? new Date(Date.now() - (taskData.daysOverdue * 24 * 60 * 60 * 1000))
              : new Date(Date.now() + (Math.abs(taskData.daysOverdue) + 1) * 24 * 60 * 60 * 1000)
            
            // Randomly assign tasks to test user or other user (for role-based filtering)
            const taskOwner = Math.random() > 0.5 ? testUser : otherUser
            const assignedTo = Math.random() > 0.7 ? (Math.random() > 0.5 ? testUser.id : otherUser.id) : null

            const task = await createTask(taskOwner.id, {
              taskTitle: taskData.taskTitle,
              description: taskData.description,
              priority: taskData.priority,
              status: taskData.status,
              dueDate: dueDate,
              notes: taskData.notes,
              assignedTo: assignedTo
            })

            createdTasks.push({
              ...task,
              daysOverdue: taskData.daysOverdue,
              originalStatus: taskData.status,
              taskOwner: taskOwner.id,
              assignedTo: assignedTo
            })
          }

          // Generate overdue task alerts
          const alerts = await generateOverdueTaskAlerts(testUser.id, testUser.role)

          // Filter alerts to only include those for tasks created in this test run
          const taskIds = createdTasks.map(task => task.id)
          const relevantAlerts = alerts.filter(alert => taskIds.includes(alert.entityId))

          // Determine which tasks should generate alerts
          const expectedOverdueTasks = createdTasks.filter(task => {
            // Task must be overdue (daysOverdue > 0 means past due date)
            const isOverdue = task.daysOverdue > 0
            
            // Task must not be completed
            const isNotCompleted = task.originalStatus !== 'COMPLETED'
            
            // For non-admin users, task must be owned by or assigned to the user
            let hasAccess = true
            if (testUser.role !== 'ADMIN') {
              hasAccess = task.taskOwner === testUser.id || task.assignedTo === testUser.id
            }
            
            return isOverdue && isNotCompleted && hasAccess
          })

          // Verify alert generation
          expect(relevantAlerts).toHaveLength(expectedOverdueTasks.length)

          // Verify each expected overdue task has a corresponding alert
          for (const expectedTask of expectedOverdueTasks) {
            const correspondingAlert = relevantAlerts.find(alert => alert.entityId === expectedTask.id)
            
            expect(correspondingAlert).toBeDefined()
            expect(correspondingAlert!.type).toBe('OVERDUE_TASK')
            expect(correspondingAlert!.title).toBe(`Overdue Task: ${expectedTask.taskTitle}`)
            expect(correspondingAlert!.message).toContain(expectedTask.taskTitle)
            expect(correspondingAlert!.message).toContain('was due on')
            expect(correspondingAlert!.priority).toBe(expectedTask.priority)
            expect(correspondingAlert!.entityType).toBe('TASK')
            expect(correspondingAlert!.entityId).toBe(expectedTask.id)
            expect(correspondingAlert!.createdAt).toBeInstanceOf(Date)
            
            // Verify the alert message contains the due date
            const dueDateString = expectedTask.dueDate?.toLocaleDateString()
            if (dueDateString) {
              expect(correspondingAlert!.message).toContain(dueDateString)
            }
          }

          // Verify no alerts are generated for non-overdue or completed tasks
          const nonOverdueTasks = createdTasks.filter(task => {
            const isOverdue = task.daysOverdue > 0
            const isNotCompleted = task.originalStatus !== 'COMPLETED'
            let hasAccess = true
            if (testUser.role !== 'ADMIN') {
              hasAccess = task.taskOwner === testUser.id || task.assignedTo === testUser.id
            }
            
            return !(isOverdue && isNotCompleted && hasAccess)
          })

          for (const nonOverdueTask of nonOverdueTasks) {
            const shouldNotHaveAlert = relevantAlerts.find(alert => alert.entityId === nonOverdueTask.id)
            expect(shouldNotHaveAlert).toBeUndefined()
          }

          // Verify alert properties are consistent
          for (const alert of relevantAlerts) {
            expect(alert.id).toBeDefined()
            expect(alert.type).toBe('OVERDUE_TASK')
            expect(alert.title).toMatch(/^Overdue Task: .+/)
            expect(alert.message).toMatch(/^Task ".+" was due on .+/)
            expect(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).toContain(alert.priority)
            expect(alert.entityType).toBe('TASK')
            expect(alert.entityId).toBeGreaterThan(0)
            expect(alert.createdAt).toBeInstanceOf(Date)
            expect(alert.createdAt.getTime()).toBeLessThanOrEqual(Date.now())
          }

          // Verify role-based access control
          if (testUser.role !== 'ADMIN') {
            // Non-admin users should only see alerts for tasks they own or are assigned to
            for (const alert of relevantAlerts) {
              const correspondingTask = createdTasks.find(task => task.id === alert.entityId)
              expect(correspondingTask).toBeDefined()
              
              const hasAccess = correspondingTask!.taskOwner === testUser.id || 
                               correspondingTask!.assignedTo === testUser.id
              expect(hasAccess).toBe(true)
            }
          }

          // Verify alerts are ordered by due date (earliest overdue first)
          if (relevantAlerts.length > 1) {
            for (let i = 1; i < relevantAlerts.length; i++) {
              const prevTask = createdTasks.find(task => task.id === relevantAlerts[i-1].entityId)
              const currTask = createdTasks.find(task => task.id === relevantAlerts[i].entityId)
              
              if (prevTask && currTask && prevTask.dueDate && currTask.dueDate) {
                expect(prevTask.dueDate.getTime()).toBeLessThanOrEqual(currTask.dueDate.getTime())
              }
            }
          }
        }
      ),
      { numRuns: 15 } // Reduced runs due to complex database operations
    )
  })
})