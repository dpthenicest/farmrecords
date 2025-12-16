/**
 * **Feature: farm-management-completion, Property 2: Data List Operations**
 * 
 * Property-based test to verify that data list operations with pagination, 
 * filtering, and sorting parameters return consistent and correct subsets of data.
 * 
 * **Validates: Requirements 1.3**
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { prisma } from '@/lib/prisma'
import { getAnimals } from '@/services/animalService'
import { inventoryService } from '@/services/inventoryService'
import { getCategoriesService } from '@/services/categoryService'

describe('Property 2: Data List Operations', () => {
  let testUserId: number

  beforeEach(async () => {
    // Create test user with auto-increment ID
    const testUser = await prisma.user.create({
      data: {
        username: `test-datalist-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        email: `test-datalist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
        passwordHash: 'test-hash',
        role: 'ADMIN'
      }
    })
    testUserId = testUser.id
  })

  afterEach(async () => {
    // Clean up test data thoroughly
    await cleanupTestData(testUserId)
  })

  // Helper function for thorough cleanup
  async function cleanupTestData(userId: number) {
    try {
      // Clean up in correct order to respect foreign key constraints
      await prisma.animalRecord.deleteMany({ where: { userId } })
      await prisma.animal.deleteMany({ where: { userId } })
      await prisma.inventoryMovement.deleteMany({ where: { userId } })
      await prisma.inventory.deleteMany({ where: { userId } })
      await prisma.salesExpenseCategory.deleteMany({ where: { userId } })
      await prisma.user.delete({ where: { id: userId } }).catch(() => {})
    } catch (error) {
      // Ignore cleanup errors - they might be expected if data doesn't exist
    }
  }

  it('should return consistent pagination results for animal data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            animalTag: fc.string({ minLength: 1, maxLength: 50 }),
            species: fc.constantFrom('CATTLE', 'SHEEP', 'GOAT', 'PIG', 'CHICKEN'),
            breed: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
            gender: fc.option(fc.constantFrom('MALE', 'FEMALE')),
            healthStatus: fc.option(fc.constantFrom('HEALTHY', 'SICK', 'RECOVERING'))
          }),
          { minLength: 3, maxLength: 8 } // Smaller size for better isolation
        ),
        fc.record({
          page: fc.integer({ min: 1, max: 3 }),
          limit: fc.integer({ min: 2, max: 5 }),
          sortBy: fc.constantFrom('animalTag', 'species', 'createdAt'),
          sortOrder: fc.constantFrom('asc', 'desc')
        }),
        async (animalData, paginationParams) => {
          // Ensure clean state before test
          await prisma.animal.deleteMany({ where: { userId: testUserId } })
          
          // Create test animals with unique tags
          const createdAnimals = await Promise.all(
            animalData.map((animal, index) => 
              prisma.animal.create({
                data: {
                  ...animal,
                  animalTag: `TEST_${testUserId}_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                  userId: testUserId,
                  breed: animal.breed || null,
                  gender: animal.gender || null,
                  healthStatus: animal.healthStatus || null
                }
              })
            )
          )

          // Test pagination consistency - use USER role to ensure proper filtering
          const result = await getAnimals(testUserId, 'USER', {
            sortBy: paginationParams.sortBy,
            sortOrder: paginationParams.sortOrder
          }, {
            page: paginationParams.page,
            limit: paginationParams.limit
          })

          // Verify pagination metadata consistency
          expect(result.pagination.page).toBe(paginationParams.page)
          expect(result.pagination.limit).toBe(paginationParams.limit)
          expect(result.pagination.total).toBe(createdAnimals.length)
          expect(result.pagination.pages).toBe(Math.ceil(createdAnimals.length / paginationParams.limit))

          // Verify data subset correctness
          const expectedStartIndex = (paginationParams.page - 1) * paginationParams.limit
          const expectedEndIndex = Math.min(expectedStartIndex + paginationParams.limit, createdAnimals.length)
          const expectedCount = Math.max(0, expectedEndIndex - expectedStartIndex)

          if (paginationParams.page <= result.pagination.pages) {
            expect(result.data.length).toBe(expectedCount)
          } else {
            expect(result.data.length).toBe(0)
          }

          // Verify sorting consistency - if we have data, check order
          if (result.data.length > 1) {
            for (let i = 0; i < result.data.length - 1; i++) {
              const current = result.data[i]
              const next = result.data[i + 1]
              
              let currentValue: any
              let nextValue: any
              
              if (paginationParams.sortBy === 'createdAt') {
                currentValue = new Date(current.createdAt).getTime()
                nextValue = new Date(next.createdAt).getTime()
              } else {
                currentValue = current[paginationParams.sortBy as keyof typeof current]
                nextValue = next[paginationParams.sortBy as keyof typeof next]
              }

              // Handle null/undefined values in sorting
              if (currentValue == null && nextValue == null) continue
              if (currentValue == null) currentValue = paginationParams.sortOrder === 'asc' ? '' : 'zzz'
              if (nextValue == null) nextValue = paginationParams.sortOrder === 'asc' ? '' : 'zzz'

              if (paginationParams.sortOrder === 'asc') {
                expect(currentValue <= nextValue).toBe(true)
              } else {
                expect(currentValue >= nextValue).toBe(true)
              }
            }
          }

          // Clean up created animals immediately
          await prisma.animal.deleteMany({
            where: { id: { in: createdAnimals.map(a => a.id) } }
          })
        }
      ),
      { numRuns: 25 } // Reduced runs for better performance and isolation
    )
  })

  it('should return consistent filtering results for inventory data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            itemName: fc.string({ minLength: 2, maxLength: 20 }).filter(s => s.trim().length >= 2),
            itemCode: fc.string({ minLength: 2, maxLength: 10 }).filter(s => s.trim().length >= 2),
            unitOfMeasure: fc.constantFrom('KG', 'LITERS', 'PIECES', 'BAGS'),
            currentQuantity: fc.float({ min: Math.fround(0), max: Math.fround(100), noNaN: true }),
            reorderLevel: fc.float({ min: Math.fround(0), max: Math.fround(50), noNaN: true }),
            unitCost: fc.float({ min: Math.fround(0.01), max: Math.fround(100), noNaN: true }),
            sellingPrice: fc.float({ min: Math.fround(0.01), max: Math.fround(200), noNaN: true })
          }),
          { minLength: 3, maxLength: 6 } // Smaller size for better isolation
        ),
        fc.record({
          page: fc.integer({ min: 1, max: 2 }),
          limit: fc.integer({ min: 3, max: 5 }),
          search: fc.option(fc.string({ minLength: 1, maxLength: 5 })),
          sortBy: fc.constantFrom('itemName', 'currentQuantity', 'createdAt'),
          sortOrder: fc.constantFrom('asc', 'desc')
        }),
        async (inventoryData, filterParams) => {
          // Ensure clean state before test
          await prisma.inventory.deleteMany({ where: { userId: testUserId } })
          
          // Create test inventory items with unique codes
          const createdItems = await Promise.all(
            inventoryData.map((item, index) => 
              prisma.inventory.create({
                data: {
                  ...item,
                  itemCode: `TEST_${testUserId}_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                  userId: testUserId
                }
              })
            )
          )

          // Test filtering and pagination
          const result = await inventoryService.getAll({
            page: filterParams.page,
            limit: filterParams.limit,
            search: filterParams.search,
            sortBy: filterParams.sortBy,
            sortOrder: filterParams.sortOrder,
            userId: testUserId,
            isAdmin: false
          })

          // Verify pagination metadata
          expect(result.pagination.page).toBe(filterParams.page)
          expect(result.pagination.limit).toBe(filterParams.limit)
          expect(typeof result.pagination.total).toBe('number')
          expect(typeof result.pagination.pages).toBe('number')

          // If search filter is applied, verify all results match the search
          if (filterParams.search && filterParams.search.trim().length > 0 && result.items.length > 0) {
            const searchLower = filterParams.search.toLowerCase().trim()
            result.items.forEach((item: any) => {
              const matchesName = item.itemName.toLowerCase().includes(searchLower)
              const matchesCode = item.itemCode.toLowerCase().includes(searchLower)
              expect(matchesName || matchesCode).toBe(true)
            })
          }

          // Verify data subset size is within expected bounds
          const maxExpectedItems = Math.min(filterParams.limit, result.pagination.total)
          expect(result.items.length).toBeLessThanOrEqual(maxExpectedItems)

          // Verify sorting if we have multiple items - with better null handling
          if (result.items.length > 1) {
            for (let i = 0; i < result.items.length - 1; i++) {
              const current = result.items[i]
              const next = result.items[i + 1]
              
              let currentValue: any
              let nextValue: any
              
              if (filterParams.sortBy === 'createdAt') {
                currentValue = new Date(current.createdAt).getTime()
                nextValue = new Date(next.createdAt).getTime()
              } else if (filterParams.sortBy === 'currentQuantity') {
                // Handle Decimal type properly
                currentValue = parseFloat(current.currentQuantity.toString())
                nextValue = parseFloat(next.currentQuantity.toString())
              } else {
                currentValue = current[filterParams.sortBy as keyof typeof current]
                nextValue = next[filterParams.sortBy as keyof typeof next]
              }

              // Handle null/undefined values in sorting
              if (currentValue == null && nextValue == null) continue
              if (currentValue == null) currentValue = filterParams.sortOrder === 'asc' ? -Infinity : Infinity
              if (nextValue == null) nextValue = filterParams.sortOrder === 'asc' ? -Infinity : Infinity

              if (filterParams.sortOrder === 'asc') {
                expect(currentValue <= nextValue).toBe(true)
              } else {
                expect(currentValue >= nextValue).toBe(true)
              }
            }
          }

          // Clean up created items immediately
          await prisma.inventory.deleteMany({
            where: { id: { in: createdItems.map(i => i.id) } }
          })
        }
      ),
      { numRuns: 20 } // Reduced runs for better performance and isolation
    )
  }, 15000) // Increased timeout

  it('should return consistent pagination across different page requests', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            categoryName: fc.string({ minLength: 1, maxLength: 50 }),
            categoryType: fc.constantFrom('INCOME', 'EXPENSE'),
            isActive: fc.boolean()
          }),
          { minLength: 4, maxLength: 8 } // Smaller size for better isolation
        ),
        fc.record({
          limit: fc.integer({ min: 2, max: 4 }),
          sortBy: fc.constantFrom('categoryName', 'categoryType', 'createdAt'),
          sortOrder: fc.constantFrom('asc', 'desc')
        }),
        async (categoryData, params) => {
          // Ensure user exists for this iteration
          let currentUserId = testUserId
          try {
            await prisma.user.findUniqueOrThrow({ where: { id: testUserId } })
          } catch {
            // User doesn't exist, create a new one for this iteration
            const testUser = await prisma.user.create({
              data: {
                username: `test-datalist-user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                email: `test-datalist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}@example.com`,
                passwordHash: 'test-hash',
                role: 'ADMIN'
              }
            })
            currentUserId = testUser.id
          }
          
          // Ensure clean state before test
          await prisma.salesExpenseCategory.deleteMany({ where: { userId: currentUserId } })
          
          // Create test categories with unique names
          const createdCategories = await Promise.all(
            categoryData.map((category, index) => 
              prisma.salesExpenseCategory.create({
                data: {
                  ...category,
                  categoryName: `TEST_${currentUserId}_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                  userId: currentUserId
                }
              })
            )
          )

          const totalItems = createdCategories.length
          const totalPages = Math.ceil(totalItems / params.limit)

          // Test multiple pages for consistency (limit to 2 pages for performance)
          const pageResults = []
          for (let page = 1; page <= Math.min(totalPages, 2); page++) {
            const result = await getCategoriesService(currentUserId, 'USER', {}, {
              page,
              limit: params.limit,
              sortBy: params.sortBy,
              sortOrder: params.sortOrder
            })
            pageResults.push(result)
          }

          // Verify each page result
          pageResults.forEach((result, index) => {
            const page = index + 1
            
            // Verify pagination metadata consistency
            expect(result.pagination.page).toBe(page)
            expect(result.pagination.limit).toBe(params.limit)
            expect(result.pagination.total).toBe(totalItems)
            expect(result.pagination.pages).toBe(totalPages)

            // Verify data count for each page
            const expectedStartIndex = (page - 1) * params.limit
            const expectedEndIndex = Math.min(expectedStartIndex + params.limit, totalItems)
            const expectedCount = expectedEndIndex - expectedStartIndex

            expect(result.data.length).toBe(expectedCount)
          })

          // Verify no data overlap between pages
          if (pageResults.length > 1) {
            const allIds = new Set()
            pageResults.forEach(result => {
              result.data.forEach((item: any) => {
                expect(allIds.has(item.id)).toBe(false) // No duplicates across pages
                allIds.add(item.id)
              })
            })
          }

          // Clean up created categories immediately
          await prisma.salesExpenseCategory.deleteMany({
            where: { id: { in: createdCategories.map(c => c.id) } }
          })
        }
      ),
      { numRuns: 20 } // Reduced runs for better performance and isolation
    )
  })

  it('should handle edge cases in pagination parameters correctly', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            animalTag: fc.string({ minLength: 1, maxLength: 20 }),
            species: fc.constantFrom('CATTLE', 'SHEEP', 'GOAT')
          }),
          { minLength: 1, maxLength: 4 }
        ),
        fc.record({
          page: fc.integer({ min: 1, max: 10 }), // Reduced range for better performance
          limit: fc.integer({ min: 1, max: 5 })
        }),
        async (animalData, paginationParams) => {
          // Ensure clean state before test
          await prisma.animal.deleteMany({ where: { userId: testUserId } })
          
          // Create test animals with unique tags
          const createdAnimals = await Promise.all(
            animalData.map((animal, index) => 
              prisma.animal.create({
                data: {
                  ...animal,
                  animalTag: `TEST_${testUserId}_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                  userId: testUserId
                }
              })
            )
          )

          const result = await getAnimals(testUserId, 'USER', {}, paginationParams)

          // Verify pagination metadata is always consistent
          expect(result.pagination.page).toBe(paginationParams.page)
          expect(result.pagination.limit).toBe(paginationParams.limit)
          expect(result.pagination.total).toBe(createdAnimals.length)
          expect(result.pagination.pages).toBe(Math.ceil(createdAnimals.length / paginationParams.limit))

          // Verify data array is never null/undefined
          expect(Array.isArray(result.data)).toBe(true)

          // For pages beyond available data, should return empty array
          if (paginationParams.page > result.pagination.pages) {
            expect(result.data.length).toBe(0)
          } else {
            // For valid pages, data length should not exceed limit
            expect(result.data.length).toBeLessThanOrEqual(paginationParams.limit)
          }

          // Clean up created animals immediately
          await prisma.animal.deleteMany({
            where: { id: { in: createdAnimals.map(a => a.id) } }
          })
        }
      ),
      { numRuns: 25 } // Reduced runs for better performance and isolation
    )
  })

  it('should maintain data integrity across filtering operations', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            itemName: fc.string({ minLength: 2, maxLength: 20 }).filter(s => s.trim().length >= 2),
            itemCode: fc.string({ minLength: 2, maxLength: 10 }).filter(s => s.trim().length >= 2),
            unitOfMeasure: fc.constantFrom('KG', 'LITERS', 'PIECES', 'BAGS'), // Use constants for consistency
            currentQuantity: fc.float({ min: Math.fround(0), max: Math.fround(100), noNaN: true }),
            reorderLevel: fc.float({ min: Math.fround(0), max: Math.fround(50), noNaN: true }),
            unitCost: fc.float({ min: Math.fround(0.01), max: Math.fround(100), noNaN: true }),
            sellingPrice: fc.float({ min: Math.fround(0.01), max: Math.fround(200), noNaN: true })
          }),
          { minLength: 3, maxLength: 5 } // Smaller size for better isolation
        ),
        fc.string({ minLength: 2, maxLength: 4 }).filter(s => s.trim().length > 0),
        async (inventoryData, searchTerm) => {
          // Ensure clean state before test
          await prisma.inventory.deleteMany({ where: { userId: testUserId } })
          
          // Create test inventory items with unique codes
          const createdItems = await Promise.all(
            inventoryData.map((item, index) => 
              prisma.inventory.create({
                data: {
                  ...item,
                  itemCode: `TEST_${testUserId}_${index}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                  userId: testUserId
                }
              })
            )
          )

          // Get all items without filter
          const allItemsResult = await inventoryService.getAll({
            page: 1,
            limit: 100,
            userId: testUserId,
            isAdmin: false
          })

          // Get filtered items
          const filteredResult = await inventoryService.getAll({
            page: 1,
            limit: 100,
            search: searchTerm,
            userId: testUserId,
            isAdmin: false
          })

          // Verify filtered results are subset of all results
          expect(filteredResult.pagination.total).toBeLessThanOrEqual(allItemsResult.pagination.total)

          // Verify all filtered items actually match the search criteria
          if (filteredResult.items.length > 0 && searchTerm.trim().length > 0) {
            const searchLower = searchTerm.toLowerCase().trim()
            filteredResult.items.forEach((item: any) => {
              const matchesName = item.itemName.toLowerCase().includes(searchLower)
              const matchesCode = item.itemCode.toLowerCase().includes(searchLower)
              expect(matchesName || matchesCode).toBe(true)
            })
          }

          // Verify no data corruption - all returned items should have required fields
          allItemsResult.items.forEach((item: any) => {
            expect(typeof item.itemName).toBe('string')
            expect(typeof item.itemCode).toBe('string')
            expect(typeof item.unitOfMeasure).toBe('string')
            expect(typeof item.currentQuantity).toBe('object') // Decimal type
            expect(typeof item.reorderLevel).toBe('object') // Decimal type
            expect(typeof item.unitCost).toBe('object') // Decimal type
            expect(typeof item.sellingPrice).toBe('object') // Decimal type
          })

          // Clean up created items immediately
          await prisma.inventory.deleteMany({
            where: { id: { in: createdItems.map(i => i.id) } }
          })
        }
      ),
      { numRuns: 15 } // Reduced runs for better performance and isolation
    )
  })
})