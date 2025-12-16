/**
 * **Feature: farm-management-completion, Property 1: CRUD Operations Consistency**
 * 
 * Property-based test to verify that CRUD operations maintain data consistency
 * and return expected results across all entity types.
 * 
 * **Validates: Requirements 1.2**
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { prisma } from '@/lib/prisma'

// Test user for isolation
const TEST_USER_ID = 999999
const TEST_USER_EMAIL = 'test-crud@example.com'

describe('Property 1: CRUD Operations Consistency', () => {
  beforeEach(async () => {
    // Clean up any existing test data
    await prisma.animalRecord.deleteMany({ where: { userId: TEST_USER_ID } })
    await prisma.animal.deleteMany({ where: { userId: TEST_USER_ID } })
    await prisma.animalBatch.deleteMany({ where: { userId: TEST_USER_ID } })
    await prisma.inventoryMovement.deleteMany({ where: { userId: TEST_USER_ID } })
    await prisma.inventory.deleteMany({ where: { userId: TEST_USER_ID } })
    await prisma.assetMaintenance.deleteMany({ where: { userId: TEST_USER_ID } })
    await prisma.asset.deleteMany({ where: { userId: TEST_USER_ID } })
    await prisma.user.deleteMany({ where: { id: TEST_USER_ID } })
    
    // Create test user
    await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        username: 'test-crud-user',
        email: TEST_USER_EMAIL,
        passwordHash: 'test-hash',
        role: 'ADMIN'
      }
    })
  })

  afterEach(async () => {
    // Clean up test data in correct order (children first)
    await prisma.animalRecord.deleteMany({ where: { userId: TEST_USER_ID } })
    await prisma.animal.deleteMany({ where: { userId: TEST_USER_ID } })
    await prisma.animalBatch.deleteMany({ where: { userId: TEST_USER_ID } })
    await prisma.inventoryMovement.deleteMany({ where: { userId: TEST_USER_ID } })
    await prisma.inventory.deleteMany({ where: { userId: TEST_USER_ID } })
    await prisma.assetMaintenance.deleteMany({ where: { userId: TEST_USER_ID } })
    await prisma.asset.deleteMany({ where: { userId: TEST_USER_ID } })
    await prisma.customer.deleteMany({ where: { userId: TEST_USER_ID } })
    await prisma.supplier.deleteMany({ where: { userId: TEST_USER_ID } })
    await prisma.user.delete({ where: { id: TEST_USER_ID } }).catch(() => {})
  })

  it('should maintain CRUD consistency for Animal entities', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          animalTag: fc.string({ minLength: 1, maxLength: 50 }),
          species: fc.string({ minLength: 1, maxLength: 50 }),
          breed: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
          gender: fc.option(fc.constantFrom('MALE', 'FEMALE')),
          purchaseWeight: fc.option(fc.float({ min: Math.fround(0.1), max: Math.fround(1000) })),
          currentWeight: fc.option(fc.float({ min: Math.fround(0.1), max: Math.fround(1000) })),
          purchaseCost: fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(10000) })),
          healthStatus: fc.option(fc.constantFrom('HEALTHY', 'SICK', 'RECOVERING', 'QUARANTINE', 'DECEASED')),
          isActive: fc.boolean()
        }),
        async (animalData) => {
          // CREATE: Create an animal
          const createdAnimal = await prisma.animal.create({
            data: {
              ...animalData,
              userId: TEST_USER_ID,
              breed: animalData.breed || null,
              gender: animalData.gender || null,
              purchaseWeight: animalData.purchaseWeight || null,
              currentWeight: animalData.currentWeight || null,
              purchaseCost: animalData.purchaseCost || null,
              healthStatus: animalData.healthStatus || null
            }
          })

          // READ: Verify the created animal can be retrieved
          const retrievedAnimal = await prisma.animal.findUnique({
            where: { id: createdAnimal.id }
          })

          expect(retrievedAnimal).toBeTruthy()
          expect(retrievedAnimal!.animalTag).toBe(animalData.animalTag)
          expect(retrievedAnimal!.species).toBe(animalData.species)
          expect(retrievedAnimal!.isActive).toBe(animalData.isActive)

          // UPDATE: Modify the animal
          const updatedData = {
            species: animalData.species + '_UPDATED',
            isActive: !animalData.isActive
          }

          const updatedAnimal = await prisma.animal.update({
            where: { id: createdAnimal.id },
            data: updatedData
          })

          expect(updatedAnimal.species).toBe(updatedData.species)
          expect(updatedAnimal.isActive).toBe(updatedData.isActive)
          expect(updatedAnimal.animalTag).toBe(animalData.animalTag) // Unchanged field should remain

          // READ after UPDATE: Verify changes persisted
          const reRetrievedAnimal = await prisma.animal.findUnique({
            where: { id: createdAnimal.id }
          })

          expect(reRetrievedAnimal!.species).toBe(updatedData.species)
          expect(reRetrievedAnimal!.isActive).toBe(updatedData.isActive)

          // DELETE: Remove the animal
          await prisma.animal.delete({
            where: { id: createdAnimal.id }
          })

          // READ after DELETE: Verify animal no longer exists
          const deletedAnimal = await prisma.animal.findUnique({
            where: { id: createdAnimal.id }
          })

          expect(deletedAnimal).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain CRUD consistency for Inventory entities', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          itemName: fc.string({ minLength: 1, maxLength: 100 }),
          itemCode: fc.string({ minLength: 1, maxLength: 50 }).map(code => `${code}_${Date.now()}_${Math.random()}`),
          unitOfMeasure: fc.string({ minLength: 1, maxLength: 20 }),
          currentQuantity: fc.float({ min: 0, max: Math.fround(10000), noNaN: true }),
          reorderLevel: fc.float({ min: 0, max: Math.fround(1000), noNaN: true }),
          unitCost: fc.float({ min: Math.fround(0.01), max: Math.fround(1000), noNaN: true }),
          sellingPrice: fc.float({ min: Math.fround(0.01), max: Math.fround(2000), noNaN: true }),
          location: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
          description: fc.option(fc.string({ minLength: 1, maxLength: 500 }))
        }),
        async (inventoryData) => {
          // CREATE: Create an inventory item
          const createdItem = await prisma.inventory.create({
            data: {
              ...inventoryData,
              userId: TEST_USER_ID,
              location: inventoryData.location || null,
              description: inventoryData.description || null
            }
          })

          // READ: Verify the created item can be retrieved
          const retrievedItem = await prisma.inventory.findUnique({
            where: { id: createdItem.id }
          })

          expect(retrievedItem).toBeTruthy()
          expect(retrievedItem!.itemName).toBe(inventoryData.itemName)
          expect(retrievedItem!.itemCode).toBe(inventoryData.itemCode)
          expect(Number(retrievedItem!.currentQuantity)).toBeCloseTo(inventoryData.currentQuantity, 2)

          // UPDATE: Modify the inventory item
          const newQuantity = inventoryData.currentQuantity + 100
          const updatedItem = await prisma.inventory.update({
            where: { id: createdItem.id },
            data: { currentQuantity: newQuantity }
          })

          expect(Number(updatedItem.currentQuantity)).toBeCloseTo(newQuantity, 2)
          expect(updatedItem.itemName).toBe(inventoryData.itemName) // Unchanged field should remain

          // READ after UPDATE: Verify changes persisted
          const reRetrievedItem = await prisma.inventory.findUnique({
            where: { id: createdItem.id }
          })

          expect(Number(reRetrievedItem!.currentQuantity)).toBeCloseTo(newQuantity, 2)

          // DELETE: Remove the inventory item
          await prisma.inventory.delete({
            where: { id: createdItem.id }
          })

          // READ after DELETE: Verify item no longer exists
          const deletedItem = await prisma.inventory.findUnique({
            where: { id: createdItem.id }
          })

          expect(deletedItem).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain CRUD consistency for Asset entities', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          assetName: fc.string({ minLength: 1, maxLength: 100 }),
          assetCode: fc.uuid().map(uuid => `ASSET_${uuid.replace(/-/g, '_')}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
          assetType: fc.constantFrom('INFRASTRUCTURE', 'EQUIPMENT', 'VEHICLES'),
          purchaseCost: fc.float({ min: 1, max: Math.fround(100000), noNaN: true }),
          salvageValue: fc.float({ min: 0, max: Math.fround(50000), noNaN: true }),
          usefulLifeYears: fc.integer({ min: 1, max: 50 }),
          depreciationRate: fc.float({ min: Math.fround(0.1), max: Math.fround(50), noNaN: true }),
          conditionStatus: fc.constantFrom('EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL'),
          location: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
          isActive: fc.boolean()
        }),
        async (assetData) => {
          // CREATE: Create an asset
          const createdAsset = await prisma.asset.create({
            data: {
              ...assetData,
              userId: TEST_USER_ID,
              purchaseDate: new Date(),
              location: assetData.location || null
            }
          })

          // READ: Verify the created asset can be retrieved
          const retrievedAsset = await prisma.asset.findUnique({
            where: { id: createdAsset.id }
          })

          expect(retrievedAsset).toBeTruthy()
          expect(retrievedAsset!.assetName).toBe(assetData.assetName)
          expect(retrievedAsset!.assetType).toBe(assetData.assetType)
          expect(Number(retrievedAsset!.purchaseCost)).toBeCloseTo(assetData.purchaseCost, 2)

          // UPDATE: Modify the asset
          const updatedCondition = assetData.conditionStatus === 'EXCELLENT' ? 'GOOD' : 'EXCELLENT'
          const updatedAsset = await prisma.asset.update({
            where: { id: createdAsset.id },
            data: { conditionStatus: updatedCondition }
          })

          expect(updatedAsset.conditionStatus).toBe(updatedCondition)
          expect(updatedAsset.assetName).toBe(assetData.assetName) // Unchanged field should remain

          // READ after UPDATE: Verify changes persisted
          const reRetrievedAsset = await prisma.asset.findUnique({
            where: { id: createdAsset.id }
          })

          expect(reRetrievedAsset!.conditionStatus).toBe(updatedCondition)

          // DELETE: Remove the asset
          await prisma.asset.delete({
            where: { id: createdAsset.id }
          })

          // READ after DELETE: Verify asset no longer exists
          const deletedAsset = await prisma.asset.findUnique({
            where: { id: createdAsset.id }
          })

          expect(deletedAsset).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain referential integrity during CRUD operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          batchCode: fc.string({ minLength: 1, maxLength: 50 }),
          species: fc.string({ minLength: 1, maxLength: 50 }),
          initialQuantity: fc.integer({ min: 1, max: 1000 }),
          animalTag: fc.string({ minLength: 1, maxLength: 50 })
        }),
        async (testData) => {
          // CREATE: Create a batch first
          const batch = await prisma.animalBatch.create({
            data: {
              batchCode: testData.batchCode,
              species: testData.species,
              initialQuantity: testData.initialQuantity,
              currentQuantity: testData.initialQuantity,
              batchStartDate: new Date(),
              totalCost: 1000,
              batchStatus: 'ACTIVE',
              userId: TEST_USER_ID
            }
          })

          // CREATE: Create an animal linked to the batch
          const animal = await prisma.animal.create({
            data: {
              animalTag: testData.animalTag,
              species: testData.species,
              batchId: batch.id,
              userId: TEST_USER_ID
            }
          })

          // READ: Verify the relationship exists
          const animalWithBatch = await prisma.animal.findUnique({
            where: { id: animal.id },
            include: { batch: true }
          })

          expect(animalWithBatch!.batch!.id).toBe(batch.id)
          expect(animalWithBatch!.batch!.batchCode).toBe(testData.batchCode)

          // UPDATE: Modify the batch and verify animal relationship remains
          const updatedBatch = await prisma.animalBatch.update({
            where: { id: batch.id },
            data: { batchStatus: 'COMPLETED' }
          })

          const animalAfterBatchUpdate = await prisma.animal.findUnique({
            where: { id: animal.id },
            include: { batch: true }
          })

          expect(animalAfterBatchUpdate!.batch!.batchStatus).toBe('COMPLETED')
          expect(animalAfterBatchUpdate!.batchId).toBe(batch.id)

          // DELETE: Clean up (animal first due to foreign key constraint)
          await prisma.animal.delete({ where: { id: animal.id } })
          await prisma.animalBatch.delete({ where: { id: batch.id } })

          // READ after DELETE: Verify both entities are gone
          const deletedAnimal = await prisma.animal.findUnique({ where: { id: animal.id } })
          const deletedBatch = await prisma.animalBatch.findUnique({ where: { id: batch.id } })

          expect(deletedAnimal).toBeNull()
          expect(deletedBatch).toBeNull()
        }
      ),
      { numRuns: 100 }
    )
  })
})