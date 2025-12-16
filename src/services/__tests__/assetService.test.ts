import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { prisma } from '@/lib/prisma'
import { 
  calculateDepreciationSchedule,
  scheduleMaintenance,
  completeMaintenance,
  generateMaintenanceAlerts,
  validateMaintenanceData,
  validateAssetData
} from '../assetService'

// **Feature: farm-management-completion, Property 14: Asset Depreciation Calculation**
// **Validates: Requirements 6.1**

// Helper to generate unique identifiers
let testCounter = 0
const getUniqueId = () => {
  testCounter++
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${testCounter}`
}

describe('Asset Service Property Tests', () => {
  beforeEach(async () => {
    // Clean up test data in correct order to avoid foreign key constraints
    await prisma.financialRecord.deleteMany()
    await prisma.task.deleteMany()
    await prisma.assetMaintenance.deleteMany()
    await prisma.asset.deleteMany()
    await prisma.salesExpenseCategory.deleteMany()
    await prisma.user.deleteMany()
  })

  afterEach(async () => {
    // Clean up test data in correct order to avoid foreign key constraints
    await prisma.financialRecord.deleteMany()
    await prisma.task.deleteMany()
    await prisma.assetMaintenance.deleteMany()
    await prisma.asset.deleteMany()
    await prisma.salesExpenseCategory.deleteMany()
    await prisma.user.deleteMany()
  })

  // Property 14: Asset Depreciation Calculation
  it('should calculate depreciation schedules correctly for all asset parameters', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          purchaseCost: fc.integer({ min: 1000, max: 1000000 }).map(n => n / 100), // $10 to $10,000
          salvageValue: fc.integer({ min: 0, max: 50000 }).map(n => n / 100), // $0 to $500
          usefulLifeYears: fc.integer({ min: 1, max: 50 }),
          purchaseDate: fc.date({ min: new Date('2020-01-01'), max: new Date('2024-12-31') })
        }).filter(data => data.salvageValue < data.purchaseCost), // Ensure salvage < purchase
        (testData) => {
          const schedule = calculateDepreciationSchedule(
            testData.purchaseCost,
            testData.salvageValue,
            testData.usefulLifeYears,
            testData.purchaseDate
          )

          // Verify schedule length
          expect(schedule).toHaveLength(testData.usefulLifeYears)

          // Calculate expected depreciation per year
          const expectedDepreciationPerYear = (testData.purchaseCost - testData.salvageValue) / testData.usefulLifeYears

          // Verify each year in the schedule
          schedule.forEach((yearData, index) => {
            const year = index + 1
            
            // Verify year number
            expect(yearData.year).toBe(year)
            
            // Verify depreciation amount per year
            expect(yearData.depreciationAmount).toBeCloseTo(expectedDepreciationPerYear, 2)
            
            // Verify accumulated depreciation
            const expectedAccumulated = expectedDepreciationPerYear * year
            expect(yearData.accumulatedDepreciation).toBeCloseTo(expectedAccumulated, 2)
            
            // Verify book value
            const expectedBookValue = Math.max(
              testData.purchaseCost - expectedAccumulated,
              testData.salvageValue
            )
            expect(yearData.bookValue).toBeCloseTo(expectedBookValue, 2)
            
            // Book value should never go below salvage value
            expect(yearData.bookValue).toBeGreaterThanOrEqual(testData.salvageValue - 0.01) // Small tolerance for floating point
          })

          // Verify final year book value equals salvage value
          const finalYear = schedule[schedule.length - 1]
          expect(finalYear.bookValue).toBeCloseTo(testData.salvageValue, 2)

          // Verify accumulated depreciation never exceeds depreciable amount
          const depreciableAmount = testData.purchaseCost - testData.salvageValue
          schedule.forEach(yearData => {
            expect(yearData.accumulatedDepreciation).toBeLessThanOrEqual(depreciableAmount + 0.01) // Small tolerance
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  // Property 15: Maintenance Task Creation
  it('should create maintenance tasks and track history correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          maintenanceData: fc.record({
            maintenanceType: fc.constantFrom('MAINTENANCE', 'REPAIR', 'CLEANING', 'INSPECTION'),
            scheduledDate: fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
            cost: fc.integer({ min: 100, max: 100000 }).map(n => n / 100),
            description: fc.string({ minLength: 5, maxLength: 200 }),
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

          // Create test asset
          const asset = await prisma.asset.create({
            data: {
              assetName: `Asset ${uniqueId}`,
              assetCode: `asset_${uniqueId}`,
              assetType: 'EQUIPMENT',
              purchaseCost: 10000,
              purchaseDate: new Date('2023-01-01'),
              salvageValue: 1000,
              usefulLifeYears: 10,
              depreciationRate: 10,
              conditionStatus: 'GOOD',
              userId: user.id
            }
          })

          // Schedule maintenance
          const maintenance = await scheduleMaintenance(
            asset.id,
            testData.maintenanceData,
            user.id
          )

          // Verify maintenance record was created
          expect(maintenance).toBeDefined()
          expect(maintenance.assetId).toBe(asset.id)
          expect(maintenance.userId).toBe(user.id)
          expect(maintenance.maintenanceType).toBe(testData.maintenanceData.maintenanceType)
          expect(maintenance.scheduledDate).toEqual(testData.maintenanceData.scheduledDate)
          expect(Number(maintenance.cost.toString())).toBeCloseTo(testData.maintenanceData.cost, 2)
          expect(maintenance.description).toBe(testData.maintenanceData.description)
          expect(maintenance.status).toBe('SCHEDULED')

          // Verify associated task was created
          const tasks = await prisma.task.findMany({
            where: { assetId: asset.id, userId: user.id }
          })
          
          expect(tasks).toHaveLength(1)
          const task = tasks[0]
          expect(task.taskTitle).toContain(testData.maintenanceData.maintenanceType)
          expect(task.taskTitle).toContain(asset.assetName)
          expect(task.description).toBe(testData.maintenanceData.description)
          expect(task.priority).toBe('MEDIUM')
          expect(task.status).toBe('PENDING')
          expect(task.dueDate).toEqual(testData.maintenanceData.scheduledDate)
          expect(task.assetId).toBe(asset.id)
        }
      ),
      { numRuns: 20 } // Reduced runs due to database operations
    )
  })

  // Property 16: Maintenance Completion Processing
  it('should process maintenance completion correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          completionNotes: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
          maintenanceType: fc.constantFrom('MAINTENANCE', 'REPAIR', 'CLEANING', 'INSPECTION')
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

          // Create test category for financial records
          const category = await prisma.salesExpenseCategory.create({
            data: {
              categoryName: `Category ${uniqueId}`,
              categoryType: 'EXPENSE',
              userId: user.id
            }
          })

          // Create test asset
          const asset = await prisma.asset.create({
            data: {
              assetName: `Asset ${uniqueId}`,
              assetCode: `asset_${uniqueId}`,
              assetType: 'EQUIPMENT',
              purchaseCost: 10000,
              purchaseDate: new Date('2023-01-01'),
              salvageValue: 1000,
              usefulLifeYears: 10,
              depreciationRate: 10,
              conditionStatus: 'POOR',
              categoryId: category.id,
              userId: user.id
            }
          })

          // Create maintenance record
          const maintenance = await prisma.assetMaintenance.create({
            data: {
              assetId: asset.id,
              userId: user.id,
              maintenanceType: testData.maintenanceType,
              scheduledDate: new Date(),
              cost: 500,
              description: 'Test maintenance',
              status: 'SCHEDULED'
            }
          })

          // Create associated task
          await prisma.task.create({
            data: {
              userId: user.id,
              taskTitle: `${testData.maintenanceType} - ${asset.assetName}`,
              description: 'Test maintenance task',
              priority: 'MEDIUM',
              status: 'PENDING',
              dueDate: new Date(),
              assetId: asset.id
            }
          })

          // Complete maintenance
          const completedMaintenance = await completeMaintenance(
            maintenance.id,
            user.id,
            testData.completionNotes
          )

          // Verify maintenance was marked as completed
          expect(completedMaintenance.status).toBe('COMPLETED')
          expect(completedMaintenance.completedDate).toBeDefined()
          
          // Verify notes were updated if provided
          if (testData.completionNotes) {
            expect(completedMaintenance.notes).toContain(testData.completionNotes)
          }

          // Verify asset condition was updated for repair/maintenance
          if (['REPAIR', 'MAINTENANCE'].includes(testData.maintenanceType)) {
            const updatedAsset = await prisma.asset.findUnique({ where: { id: asset.id } })
            expect(updatedAsset?.conditionStatus).toBe('GOOD')
          }

          // Verify associated task was completed
          const updatedTasks = await prisma.task.findMany({
            where: { assetId: asset.id, status: 'COMPLETED' }
          })
          expect(updatedTasks.length).toBeGreaterThan(0)
          expect(updatedTasks[0].completedDate).toBeDefined()

          // Verify financial record was created
          const financialRecords = await prisma.financialRecord.findMany({
            where: { 
              userId: user.id,
              transactionType: 'EXPENSE',
              description: { contains: 'Maintenance expense' }
            }
          })
          expect(financialRecords.length).toBeGreaterThan(0)
          expect(Number(financialRecords[0].amount.toString())).toBe(500)
        }
      ),
      { numRuns: 15 } // Reduced runs due to complex database operations
    )
  })

  // Property 17: Maintenance Alert Generation
  it('should generate appropriate maintenance alerts', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          assetCondition: fc.constantFrom('EXCELLENT', 'GOOD', 'FAIR', 'POOR'),
          maintenanceScheduled: fc.boolean(),
          daysFromNow: fc.integer({ min: -30, max: 60 }), // Past due to future
          assetAge: fc.integer({ min: 1, max: 20 }) // Years
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

          // Create test asset
          const purchaseDate = new Date()
          purchaseDate.setFullYear(purchaseDate.getFullYear() - testData.assetAge)
          
          const asset = await prisma.asset.create({
            data: {
              assetName: `Asset ${uniqueId}`,
              assetCode: `asset_${uniqueId}`,
              assetType: 'EQUIPMENT',
              purchaseCost: 10000,
              purchaseDate: purchaseDate,
              salvageValue: 1000,
              usefulLifeYears: 10,
              depreciationRate: 10,
              conditionStatus: testData.assetCondition,
              userId: user.id
            }
          })

          // Optionally create scheduled maintenance
          if (testData.maintenanceScheduled) {
            const scheduledDate = new Date()
            scheduledDate.setDate(scheduledDate.getDate() + testData.daysFromNow)
            
            await prisma.assetMaintenance.create({
              data: {
                assetId: asset.id,
                userId: user.id,
                maintenanceType: 'MAINTENANCE',
                scheduledDate: scheduledDate,
                cost: 500,
                description: 'Scheduled maintenance',
                status: 'SCHEDULED'
              }
            })
          }

          // Generate alerts
          const alerts = await generateMaintenanceAlerts(user.id)

          // Verify alert generation logic
          const assetAlerts = alerts.filter(alert => alert.assetId === asset.id)

          // Check for overdue maintenance alerts
          if (testData.maintenanceScheduled && testData.daysFromNow < 0) {
            const overdueAlerts = assetAlerts.filter(alert => alert.type === 'OVERDUE_MAINTENANCE')
            expect(overdueAlerts.length).toBeGreaterThan(0)
            expect(overdueAlerts[0].severity).toBe('CRITICAL')
            expect(overdueAlerts[0].title).toContain('Overdue Maintenance')
            expect(overdueAlerts[0].title).toContain(asset.assetName)
          }

          // Check for upcoming maintenance alerts
          if (testData.maintenanceScheduled && testData.daysFromNow >= 0 && testData.daysFromNow <= 30) {
            const upcomingAlerts = assetAlerts.filter(alert => alert.type === 'UPCOMING_MAINTENANCE')
            expect(upcomingAlerts.length).toBeGreaterThan(0)
            expect(upcomingAlerts[0].severity).toBe('MEDIUM')
            expect(upcomingAlerts[0].title).toContain('Upcoming Maintenance')
            expect(upcomingAlerts[0].title).toContain(asset.assetName)
          }

          // Check for poor condition alerts
          if (testData.assetCondition === 'POOR') {
            const conditionAlerts = assetAlerts.filter(alert => alert.type === 'POOR_CONDITION')
            expect(conditionAlerts.length).toBeGreaterThan(0)
            expect(conditionAlerts[0].severity).toBe('HIGH')
            expect(conditionAlerts[0].title).toContain('Poor Condition')
            expect(conditionAlerts[0].title).toContain(asset.assetName)
          }

          // Check for end of life alerts
          if (testData.assetAge >= 9) { // 90% of 10 year useful life
            const endOfLifeAlerts = assetAlerts.filter(alert => alert.type === 'END_OF_LIFE')
            expect(endOfLifeAlerts.length).toBeGreaterThan(0)
            expect(endOfLifeAlerts[0].severity).toBe('MEDIUM')
            expect(endOfLifeAlerts[0].title).toContain('Asset Aging')
            expect(endOfLifeAlerts[0].title).toContain(asset.assetName)
          }
        }
      ),
      { numRuns: 20 } // Reduced runs due to database operations
    )
  })

  it('should validate maintenance data comprehensively', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          maintenanceType: fc.oneof(
            fc.constantFrom('MAINTENANCE', 'REPAIR', 'CLEANING', 'INSPECTION'),
            fc.string() // Invalid types
          ),
          scheduledDate: fc.oneof(
            fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
            fc.constant(new Date('invalid'))
          ),
          cost: fc.oneof(
            fc.integer({ min: 0, max: 100000 }).map(n => n / 100), // Valid costs
            fc.integer({ min: -10000, max: -1 }).map(n => n / 100) // Invalid costs
          ),
          description: fc.oneof(
            fc.string({ minLength: 1, maxLength: 200 }), // Valid descriptions
            fc.constant(''), // Empty description
            fc.constant('   ') // Whitespace only
          )
        }),
        (testData) => {
          const errors = validateMaintenanceData(testData)
          
          // Check validation logic
          const hasValidMaintenanceType = ['MAINTENANCE', 'REPAIR', 'CLEANING', 'INSPECTION'].includes(testData.maintenanceType)
          const hasValidDate = testData.scheduledDate instanceof Date && !isNaN(testData.scheduledDate.getTime())
          const hasValidCost = typeof testData.cost === 'number' && testData.cost >= 0
          const hasValidDescription = typeof testData.description === 'string' && testData.description.trim().length > 0
          
          const shouldBeValid = hasValidMaintenanceType && hasValidDate && hasValidCost && hasValidDescription
          
          if (shouldBeValid) {
            expect(errors).toHaveLength(0)
          } else {
            expect(errors.length).toBeGreaterThan(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate asset data comprehensively', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          assetName: fc.oneof(
            fc.string({ minLength: 1, maxLength: 100 }), // Valid names
            fc.constant(''), // Empty name
            fc.constant('   ') // Whitespace only
          ),
          assetCode: fc.oneof(
            fc.string({ minLength: 1, maxLength: 50 }), // Valid codes
            fc.constant(''), // Empty code
            fc.constant('   ') // Whitespace only
          ),
          assetType: fc.oneof(
            fc.constantFrom('INFRASTRUCTURE', 'EQUIPMENT', 'VEHICLES'),
            fc.string() // Invalid types
          ),
          purchaseCost: fc.oneof(
            fc.integer({ min: 1, max: 1000000 }).map(n => n / 100), // Valid costs
            fc.integer({ min: -10000, max: 0 }).map(n => n / 100) // Invalid costs
          ),
          salvageValue: fc.oneof(
            fc.integer({ min: 0, max: 100000 }).map(n => n / 100), // Valid salvage values
            fc.integer({ min: -1000, max: -1 }).map(n => n / 100) // Invalid salvage values
          ),
          usefulLifeYears: fc.oneof(
            fc.integer({ min: 1, max: 100 }), // Valid years
            fc.integer({ min: -10, max: 0 }) // Invalid years
          ),
          purchaseDate: fc.oneof(
            fc.date({ min: new Date('2000-01-01'), max: new Date('2030-12-31') }),
            fc.constant(new Date('invalid'))
          )
        }),
        (testData) => {
          const errors = validateAssetData(testData)
          
          // Check validation logic
          const hasValidAssetName = typeof testData.assetName === 'string' && testData.assetName.trim().length > 0
          const hasValidAssetCode = typeof testData.assetCode === 'string' && testData.assetCode.trim().length > 0
          const hasValidAssetType = ['INFRASTRUCTURE', 'EQUIPMENT', 'VEHICLES'].includes(testData.assetType)
          const hasValidPurchaseCost = typeof testData.purchaseCost === 'number' && testData.purchaseCost > 0
          const hasValidSalvageValue = typeof testData.salvageValue === 'number' && testData.salvageValue >= 0
          const hasValidUsefulLife = typeof testData.usefulLifeYears === 'number' && testData.usefulLifeYears > 0
          const hasValidPurchaseDate = testData.purchaseDate instanceof Date && !isNaN(testData.purchaseDate.getTime())
          const salvageLessThanPurchase = testData.salvageValue < testData.purchaseCost
          
          const shouldBeValid = hasValidAssetName && hasValidAssetCode && hasValidAssetType && 
                               hasValidPurchaseCost && hasValidSalvageValue && hasValidUsefulLife &&
                               hasValidPurchaseDate && salvageLessThanPurchase
          
          if (shouldBeValid) {
            expect(errors).toHaveLength(0)
          } else {
            expect(errors.length).toBeGreaterThan(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})