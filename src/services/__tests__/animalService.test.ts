import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { prisma } from '@/lib/prisma'
import { 
  createBatchRecord,
  getPerformanceMetrics,
  getHealthHistory,
  updateBatchFromIndividuals,
  validateAnimalRecord,
  validateAnimalAssociation
} from '../animalService'

// **Feature: farm-management-completion, Property 9: Animal Record Association Validation**
// **Validates: Requirements 4.1**

// Helper to generate unique identifiers
let testCounter = 0
const getUniqueId = () => {
  testCounter++
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${testCounter}`
}

describe('Animal Service Property Tests', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.animalRecord.deleteMany()
    await prisma.animal.deleteMany()
    await prisma.animalBatch.deleteMany()
    await prisma.salesExpenseCategory.deleteMany()
    await prisma.user.deleteMany()
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.animalRecord.deleteMany()
    await prisma.animal.deleteMany()
    await prisma.animalBatch.deleteMany()
    await prisma.salesExpenseCategory.deleteMany()
    await prisma.user.deleteMany()
  })

  // Property 9: Animal Record Association Validation
  it('should require either animal ID or batch ID for all animal records', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          animalId: fc.option(fc.integer({ min: 1, max: 1000 })),
          batchId: fc.option(fc.integer({ min: 1, max: 1000 }))
        }),
        (testData) => {
          const errors = validateAnimalAssociation(testData.animalId, testData.batchId)
          
          const hasAnimalId = testData.animalId !== null && testData.animalId !== undefined
          const hasBatchId = testData.batchId !== null && testData.batchId !== undefined
          
          // Should be valid if exactly one ID is provided
          const shouldBeValid = (hasAnimalId && !hasBatchId) || (!hasAnimalId && hasBatchId)
          
          if (shouldBeValid) {
            expect(errors).toHaveLength(0)
          } else {
            expect(errors.length).toBeGreaterThan(0)
            
            // Check specific error conditions
            if (!hasAnimalId && !hasBatchId) {
              expect(errors).toContain("Either animal ID or batch ID must be provided")
            }
            
            if (hasAnimalId && hasBatchId) {
              expect(errors).toContain("Cannot specify both animal ID and batch ID for the same record")
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })

  // Property 10: Batch Record Propagation
  it('should propagate batch records to individual animals appropriately', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          recordData: fc.record({
            recordType: fc.constantFrom('HEALTH_CHECK', 'VACCINATION', 'FEEDING', 'WEIGHING', 'PRODUCTION'),
            weight: fc.option(fc.integer({ min: 100, max: 100000 }).map(n => n / 100)),
            feedConsumption: fc.option(fc.integer({ min: 100, max: 10000 }).map(n => n / 100)),
            medicationCost: fc.option(fc.integer({ min: 100, max: 10000 }).map(n => n / 100)),
            healthStatus: fc.option(fc.constantFrom('HEALTHY', 'SICK', 'RECOVERING', 'QUARANTINE')),
            observations: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
            temperature: fc.option(fc.integer({ min: 35, max: 42 })),
            productionOutput: fc.option(fc.integer({ min: 100, max: 10000 }).map(n => n / 100)),
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

          // Create test batch
          const batch = await prisma.animalBatch.create({
            data: {
              batchCode: `batch_${uniqueId}`,
              species: 'CATTLE',
              breed: 'Holstein',
              initialQuantity: 3,
              currentQuantity: 3,
              batchStartDate: new Date(),
              batchStatus: 'ACTIVE',
              totalCost: 1000,
              userId: user.id
            }
          })

          // Create test animals in the batch
          const animals = await Promise.all([
            prisma.animal.create({
              data: {
                animalTag: `tag_${uniqueId}_1`,
                species: 'CATTLE',
                breed: 'Holstein',
                gender: 'MALE',
                currentWeight: 500,
                userId: user.id,
                batchId: batch.id
              }
            }),
            prisma.animal.create({
              data: {
                animalTag: `tag_${uniqueId}_2`,
                species: 'CATTLE',
                breed: 'Holstein',
                gender: 'FEMALE',
                currentWeight: 450,
                userId: user.id,
                batchId: batch.id
              }
            }),
            prisma.animal.create({
              data: {
                animalTag: `tag_${uniqueId}_3`,
                species: 'CATTLE',
                breed: 'Holstein',
                gender: 'FEMALE',
                currentWeight: 480,
                userId: user.id,
                batchId: batch.id
              }
            })
          ])

          // Create batch record
          const result = await createBatchRecord(
            batch.id,
            {
              ...testData.recordData,
              recordDate: new Date()
            },
            user.id
          )

          // Verify batch record was created
          expect(result.batchRecord).toBeDefined()
          expect(result.batchRecord.batchId).toBe(batch.id)
          expect(result.batchRecord.recordType).toBe(testData.recordData.recordType)

          // For propagatable record types, verify individual records were created
          const propagatableTypes = ['HEALTH_CHECK', 'VACCINATION', 'FEEDING']
          if (propagatableTypes.includes(testData.recordData.recordType)) {
            expect(result.individualRecords).toHaveLength(animals.length)
            
            // Verify each individual record
            const animalIds = animals.map(a => a.id)
            result.individualRecords.forEach((record) => {
              expect(animalIds).toContain(record.animalId)
              expect(record.recordType).toBe(testData.recordData.recordType)
              expect(record.userId).toBe(user.id)
              
              // Verify proportional distribution for numeric values
              if (testData.recordData.feedConsumption) {
                const expectedPortion = testData.recordData.feedConsumption / batch.currentQuantity
                expect(Number(record.feedConsumption?.toString() || 0)).toBeCloseTo(expectedPortion, 2)
              }
              
              if (testData.recordData.medicationCost) {
                const expectedPortion = testData.recordData.medicationCost / batch.currentQuantity
                expect(Number(record.medicationCost?.toString() || 0)).toBeCloseTo(expectedPortion, 2)
              }
              
              if (testData.recordData.productionOutput) {
                const expectedPortion = testData.recordData.productionOutput / batch.currentQuantity
                expect(Number(record.productionOutput?.toString() || 0)).toBeCloseTo(expectedPortion, 2)
              }
            })

            // Verify animals were updated if health status was provided
            if (testData.recordData.healthStatus) {
              const updatedAnimals = await prisma.animal.findMany({
                where: { batchId: batch.id }
              })
              
              updatedAnimals.forEach(animal => {
                expect(animal.healthStatus).toBe(testData.recordData.healthStatus)
                expect(animal.lastHealthCheck).toBeDefined()
              })
            }
          } else {
            // Non-propagatable types should not create individual records
            expect(result.individualRecords).toHaveLength(0)
          }
        }
      ),
      { numRuns: 20 } // Reduced runs due to database operations
    )
  })

  // Property 11: Animal Performance Aggregation
  it('should calculate performance metrics accurately across all inputs', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          records: fc.array(
            fc.record({
              recordType: fc.constantFrom('FEEDING', 'WEIGHING', 'HEALTH_CHECK', 'PRODUCTION'),
              weight: fc.option(fc.integer({ min: 100, max: 100000 }).map(n => n / 100)),
              feedConsumption: fc.option(fc.integer({ min: 100, max: 10000 }).map(n => n / 100)),
              medicationCost: fc.option(fc.integer({ min: 100, max: 10000 }).map(n => n / 100)),
              productionOutput: fc.option(fc.integer({ min: 100, max: 10000 }).map(n => n / 100)),
              temperature: fc.option(fc.integer({ min: 35, max: 42 })),
              mortalityCount: fc.option(fc.integer({ min: 0, max: 5 })),
              healthStatus: fc.option(fc.constantFrom('HEALTHY', 'SICK', 'RECOVERING', 'QUARANTINE'))
            }),
            { minLength: 1, maxLength: 10 }
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

          // Create test animal
          const animal = await prisma.animal.create({
            data: {
              animalTag: `tag_${uniqueId}`,
              species: 'CATTLE',
              breed: 'Holstein',
              gender: 'MALE',
              userId: user.id
            }
          })

          // Create test records
          await Promise.all(
            testData.records.map((recordData, index) =>
              prisma.animalRecord.create({
                data: {
                  userId: user.id,
                  animalId: animal.id,
                  recordType: recordData.recordType,
                  recordDate: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)), // Spread over days
                  weight: recordData.weight,
                  feedConsumption: recordData.feedConsumption,
                  medicationCost: recordData.medicationCost,
                  productionOutput: recordData.productionOutput,
                  temperature: recordData.temperature,
                  mortalityCount: recordData.mortalityCount || 0,
                  healthStatus: recordData.healthStatus
                }
              })
            )
          )

          // Get performance metrics
          const metrics = await getPerformanceMetrics(animal.id, undefined, user.id)

          // Verify calculations
          const weights = testData.records.filter(r => r.weight).map(r => r.weight!)
          const feedConsumptions = testData.records.filter(r => r.feedConsumption).map(r => r.feedConsumption!)
          const medicationCosts = testData.records.filter(r => r.medicationCost).map(r => r.medicationCost!)
          const productionOutputs = testData.records.filter(r => r.productionOutput).map(r => r.productionOutput!)
          const temperatures = testData.records.filter(r => r.temperature).map(r => r.temperature!)
          const mortalityCounts = testData.records.filter(r => r.mortalityCount).map(r => r.mortalityCount!)

          // Verify average weight calculation
          if (weights.length > 0) {
            const expectedAverage = weights.reduce((a, b) => a + b, 0) / weights.length
            expect(metrics.averageWeight).toBeCloseTo(expectedAverage, 2)
          } else {
            expect(metrics.averageWeight).toBeUndefined()
          }

          // Verify total feed consumption
          if (feedConsumptions.length > 0) {
            const expectedTotal = feedConsumptions.reduce((a, b) => a + b, 0)
            expect(metrics.totalFeedConsumption).toBeCloseTo(expectedTotal, 2)
          } else {
            expect(metrics.totalFeedConsumption).toBeUndefined()
          }

          // Verify total medication cost
          if (medicationCosts.length > 0) {
            const expectedTotal = medicationCosts.reduce((a, b) => a + b, 0)
            expect(metrics.totalMedicationCost).toBeCloseTo(expectedTotal, 2)
          } else {
            expect(metrics.totalMedicationCost).toBeUndefined()
          }

          // Verify total production output
          if (productionOutputs.length > 0) {
            const expectedTotal = productionOutputs.reduce((a, b) => a + b, 0)
            expect(metrics.totalProductionOutput).toBeCloseTo(expectedTotal, 2)
          } else {
            expect(metrics.totalProductionOutput).toBeUndefined()
          }

          // Verify average temperature
          if (temperatures.length > 0) {
            const expectedAverage = temperatures.reduce((a, b) => a + b, 0) / temperatures.length
            expect(metrics.averageTemperature).toBeCloseTo(expectedAverage, 2)
          } else {
            expect(metrics.averageTemperature).toBeUndefined()
          }

          // Verify mortality rate
          if (mortalityCounts.length > 0) {
            const expectedTotal = mortalityCounts.reduce((a, b) => a + b, 0)
            expect(metrics.mortalityRate).toBe(expectedTotal)
          } else {
            expect(metrics.mortalityRate).toBeUndefined()
          }

          // Verify health status distribution
          const healthStatuses = testData.records.filter(r => r.healthStatus).map(r => r.healthStatus!)
          if (healthStatuses.length > 0) {
            expect(metrics.healthStatusDistribution).toBeDefined()
            
            const expectedDistribution: Record<string, number> = {}
            healthStatuses.forEach(status => {
              expectedDistribution[status] = (expectedDistribution[status] || 0) + 1
            })
            
            expect(metrics.healthStatusDistribution).toEqual(expectedDistribution)
          }
        }
      ),
      { numRuns: 15 } // Reduced runs due to complex database operations
    )
  })

  // Property 12: Animal Health History Maintenance
  it('should maintain complete health history for animals and batches', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          healthRecords: fc.array(
            fc.record({
              recordType: fc.constantFrom('HEALTH_CHECK', 'VACCINATION', 'BREEDING', 'MORTALITY'),
              healthStatus: fc.constantFrom('HEALTHY', 'SICK', 'RECOVERING', 'QUARANTINE', 'DECEASED'),
              observations: fc.string({ minLength: 1, maxLength: 200 }),
              temperature: fc.option(fc.integer({ min: 35, max: 42 })),
              medicationCost: fc.option(fc.integer({ min: 100, max: 10000 }).map(n => n / 100)),
              mortalityCount: fc.option(fc.integer({ min: 0, max: 1 }))
            }),
            { minLength: 1, maxLength: 5 }
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

          // Create test animal
          const animal = await prisma.animal.create({
            data: {
              animalTag: `tag_${uniqueId}`,
              species: 'CATTLE',
              breed: 'Holstein',
              gender: 'MALE',
              userId: user.id
            }
          })

          // Create health records
          const createdRecords = await Promise.all(
            testData.healthRecords.map((recordData, index) =>
              prisma.animalRecord.create({
                data: {
                  userId: user.id,
                  animalId: animal.id,
                  recordType: recordData.recordType,
                  recordDate: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)), // Spread over days
                  healthStatus: recordData.healthStatus,
                  observations: recordData.observations,
                  temperature: recordData.temperature,
                  medicationCost: recordData.medicationCost,
                  mortalityCount: recordData.mortalityCount || 0
                }
              })
            )
          )

          // Get health history
          const healthHistory = await getHealthHistory(animal.id, undefined, user.id)

          // Verify all health records are included
          expect(healthHistory).toHaveLength(testData.healthRecords.length)

          // Verify records are properly linked and ordered
          healthHistory.forEach((record, index) => {
            expect(record.animalId).toBe(animal.id)
            expect(record.userId).toBe(user.id)
            expect(['HEALTH_CHECK', 'VACCINATION', 'BREEDING', 'MORTALITY']).toContain(record.recordType)
            
            // Verify chronological order (most recent first)
            if (index > 0) {
              expect(record.recordDate.getTime()).toBeLessThanOrEqual(healthHistory[index - 1].recordDate.getTime())
            }
          })

          // Verify data integrity - each record should match input data
          const sortedCreatedRecords = createdRecords.sort((a, b) => b.recordDate.getTime() - a.recordDate.getTime())
          healthHistory.forEach((record, index) => {
            const originalRecord = sortedCreatedRecords[index]
            expect(record.id).toBe(originalRecord.id)
            expect(record.recordType).toBe(originalRecord.recordType)
            expect(record.healthStatus).toBe(originalRecord.healthStatus)
            expect(record.observations).toBe(originalRecord.observations)
          })
        }
      ),
      { numRuns: 15 } // Reduced runs due to database operations
    )
  })

  it('should validate animal record data comprehensively', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          recordType: fc.oneof(
            fc.constantFrom('FEEDING', 'WEIGHING', 'HEALTH_CHECK', 'VACCINATION', 'PRODUCTION', 'MORTALITY', 'BREEDING', 'GENERAL'),
            fc.string() // Invalid types
          ),
          recordDate: fc.oneof(
            fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
            fc.constant(new Date('invalid'))
          ),
          weight: fc.oneof(
            fc.integer({ min: 0, max: 100000 }).map(n => n / 100), // Valid weights
            fc.integer({ min: -10000, max: -1 }).map(n => n / 100) // Invalid weights
          ),
          feedConsumption: fc.oneof(
            fc.integer({ min: 0, max: 10000 }).map(n => n / 100), // Valid consumption
            fc.integer({ min: -1000, max: -1 }).map(n => n / 100) // Invalid consumption
          ),
          medicationCost: fc.oneof(
            fc.integer({ min: 0, max: 10000 }).map(n => n / 100), // Valid cost
            fc.integer({ min: -1000, max: -1 }).map(n => n / 100) // Invalid cost
          ),
          temperature: fc.oneof(
            fc.integer({ min: 0, max: 50 }), // Valid temperature
            fc.integer({ min: -10, max: -1 }), // Invalid temperature (too low)
            fc.integer({ min: 51, max: 100 }) // Invalid temperature (too high)
          ),
          mortalityCount: fc.oneof(
            fc.integer({ min: 0, max: 100 }), // Valid count
            fc.integer({ min: -10, max: -1 }) // Invalid count
          ),
          productionOutput: fc.oneof(
            fc.integer({ min: 0, max: 10000 }).map(n => n / 100), // Valid output
            fc.integer({ min: -1000, max: -1 }).map(n => n / 100) // Invalid output
          )
        }),
        (testData) => {
          const errors = validateAnimalRecord(testData)
          
          // Check validation logic
          const hasValidRecordType = ['FEEDING', 'WEIGHING', 'HEALTH_CHECK', 'VACCINATION', 'PRODUCTION', 'MORTALITY', 'BREEDING', 'GENERAL'].includes(testData.recordType)
          const hasValidDate = testData.recordDate instanceof Date && !isNaN(testData.recordDate.getTime())
          const hasValidWeight = testData.weight === undefined || (typeof testData.weight === 'number' && testData.weight >= 0)
          const hasValidFeedConsumption = testData.feedConsumption === undefined || (typeof testData.feedConsumption === 'number' && testData.feedConsumption >= 0)
          const hasValidMedicationCost = testData.medicationCost === undefined || (typeof testData.medicationCost === 'number' && testData.medicationCost >= 0)
          const hasValidTemperature = testData.temperature === undefined || (typeof testData.temperature === 'number' && testData.temperature >= 0 && testData.temperature <= 50)
          const hasValidMortalityCount = testData.mortalityCount === undefined || (typeof testData.mortalityCount === 'number' && testData.mortalityCount >= 0)
          const hasValidProductionOutput = testData.productionOutput === undefined || (typeof testData.productionOutput === 'number' && testData.productionOutput >= 0)
          
          const shouldBeValid = hasValidRecordType && hasValidDate && hasValidWeight && 
                               hasValidFeedConsumption && hasValidMedicationCost && hasValidTemperature &&
                               hasValidMortalityCount && hasValidProductionOutput
          
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