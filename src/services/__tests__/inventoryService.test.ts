import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { prisma } from '@/lib/prisma'
import { inventoryService } from '../inventoryService'

// **Feature: farm-management-completion, Property 13: Inventory Movement Auto-Creation**
// **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

// Generate unique identifiers for test data
const generateUniqueId = () => `${process.pid}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${performance.now().toString().replace('.', '')}`

describe('Inventory Service Property Tests', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.inventoryMovement.deleteMany()
    await prisma.invoiceItem.deleteMany()
    await prisma.invoice.deleteMany()
    await prisma.purchaseOrderItem.deleteMany()
    await prisma.purchaseOrder.deleteMany()
    await prisma.inventory.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.salesExpenseCategory.deleteMany()
    await prisma.user.deleteMany()
  })

  afterEach(async () => {
    // Clean up test data
    await prisma.inventoryMovement.deleteMany()
    await prisma.invoiceItem.deleteMany()
    await prisma.invoice.deleteMany()
    await prisma.purchaseOrderItem.deleteMany()
    await prisma.purchaseOrder.deleteMany()
    await prisma.inventory.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.salesExpenseCategory.deleteMany()
    await prisma.user.deleteMany()
  })

  // Property 13: Inventory Movement Auto-Creation
  it('should automatically create inventory movements for all transaction types', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate test data
        fc.record({
          user: fc.record({
            username: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            email: fc.emailAddress(),
            passwordHash: fc.string({ minLength: 10 }),
            firstName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            lastName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            role: fc.constantFrom('ADMIN', 'MANAGER', 'OWNER')
          }),
          customer: fc.record({
            customerName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            customerCode: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            customerType: fc.constantFrom('INDIVIDUAL', 'RESTAURANT', 'MARKET', 'PROCESSOR')
          }),
          supplier: fc.record({
            supplierName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            supplierCode: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            supplierType: fc.constantFrom('FEED', 'VETERINARY', 'EQUIPMENT', 'SERVICES', 'GENERAL')
          }),
          category: fc.record({
            categoryName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            categoryType: fc.constantFrom('SALES', 'EXPENSE')
          }),
          inventory: fc.record({
            itemName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            itemCode: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            unitOfMeasure: fc.constantFrom('KG', 'LITERS', 'PIECES', 'BOXES'),
            currentQuantity: fc.integer({ min: 100, max: 1000 }).map(n => n / 10), // 10-100 units
            reorderLevel: fc.integer({ min: 10, max: 50 }).map(n => n / 10), // 1-5 units
            unitCost: fc.integer({ min: 100, max: 10000 }).map(n => n / 100), // $1-$100
            sellingPrice: fc.integer({ min: 150, max: 15000 }).map(n => n / 100) // $1.50-$150
          }),
          transactionQuantity: fc.integer({ min: 1, max: 50 }).map(n => n / 10), // 0.1-5 units
          purchaseQuantity: fc.integer({ min: 10, max: 100 }).map(n => n / 10) // 1-10 units
        }),
        async (testData) => {
          // Generate unique identifiers for this test run
          const uniqueId = generateUniqueId()
          
          // Create test user with unique data
          const user = await prisma.user.create({
            data: {
              ...testData.user,
              username: `user_${uniqueId}`,
              email: `test_${uniqueId}@example.com`
            }
          })

          // Create test customer
          const customer = await prisma.customer.create({
            data: {
              ...testData.customer,
              customerCode: `cust_${uniqueId}`,
              userId: user.id
            }
          })

          // Create test supplier
          const supplier = await prisma.supplier.create({
            data: {
              ...testData.supplier,
              supplierCode: `supp_${uniqueId}`,
              userId: user.id
            }
          })

          // Create test category
          const category = await prisma.salesExpenseCategory.create({
            data: {
              ...testData.category,
              userId: user.id
            }
          })

          // Create test inventory item
          const inventory = await prisma.inventory.create({
            data: {
              ...testData.inventory,
              itemCode: `item_${uniqueId}`,
              userId: user.id,
              categoryId: category.id
            }
          })

          const initialQuantity = Number(inventory.currentQuantity.toString())

          // Test 1: Purchase order receipt should increase inventory and create movement
          const purchaseOrder = await prisma.purchaseOrder.create({
            data: {
              userId: user.id,
              supplierId: supplier.id,
              poNumber: `PO_${Date.now()}`,
              orderDate: new Date(),
              subtotal: testData.purchaseQuantity * testData.inventory.unitCost,
              taxAmount: 0,
              totalAmount: testData.purchaseQuantity * testData.inventory.unitCost,
              status: 'RECEIVED',
              actualDeliveryDate: new Date(),
              items: {
                create: [{
                  inventoryId: inventory.id,
                  itemDescription: testData.inventory.itemName,
                  quantity: testData.purchaseQuantity,
                  unitPrice: testData.inventory.unitCost,
                  totalPrice: testData.purchaseQuantity * testData.inventory.unitCost
                }]
              }
            },
            include: { items: true }
          })

          const purchaseMovements = await inventoryService.adjustFromPurchaseOrder(
            purchaseOrder.items.map(item => ({
              ...item,
              inventoryId: item.inventoryId ?? undefined
            })), 
            purchaseOrder.id, 
            user.id
          )

          // Verify purchase movement was created
          expect(purchaseMovements).toHaveLength(1)
          expect(purchaseMovements[0].movement.movementType).toBe('PURCHASE')
          expect(Number(purchaseMovements[0].movement.quantity)).toBeCloseTo(testData.purchaseQuantity, 2)
          expect(purchaseMovements[0].movement.referenceId).toBe(purchaseOrder.id)
          expect(purchaseMovements[0].movement.referenceType).toBe('PURCHASE_ORDER')

          // Verify inventory quantity increased
          const updatedInventoryAfterPurchase = await prisma.inventory.findUnique({ where: { id: inventory.id } })
          const expectedQuantityAfterPurchase = initialQuantity + testData.purchaseQuantity
          expect(Number(updatedInventoryAfterPurchase!.currentQuantity.toString())).toBeCloseTo(expectedQuantityAfterPurchase, 2)

          // Test 2: Invoice creation should decrease inventory and create movement (if sufficient stock)
          const currentQuantityAfterPurchase = Number(updatedInventoryAfterPurchase!.currentQuantity.toString())
          
          if (testData.transactionQuantity <= currentQuantityAfterPurchase) {
            const invoice = await prisma.invoice.create({
              data: {
                userId: user.id,
                customerId: customer.id,
                invoiceNumber: `INV_${Date.now()}`,
                invoiceDate: new Date(),
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                subtotal: testData.transactionQuantity * testData.inventory.sellingPrice,
                taxAmount: 0,
                totalAmount: testData.transactionQuantity * testData.inventory.sellingPrice,
                status: 'DRAFT',
                items: {
                  create: [{
                    inventoryId: inventory.id,
                    itemDescription: testData.inventory.itemName,
                    quantity: testData.transactionQuantity,
                    unitPrice: testData.inventory.sellingPrice,
                    totalPrice: testData.transactionQuantity * testData.inventory.sellingPrice
                  }]
                }
              },
              include: { items: true }
            })

            const saleMovements = await inventoryService.adjustFromInvoice(
              invoice.items.map(item => ({
                ...item,
                inventoryId: item.inventoryId ?? undefined
              })), 
              invoice.id, 
              user.id
            )

            // Verify sale movement was created
            expect(saleMovements).toHaveLength(1)
            expect(saleMovements[0].movement.movementType).toBe('SALE')
            expect(Number(saleMovements[0].movement.quantity)).toBeCloseTo(testData.transactionQuantity, 2)
            expect(saleMovements[0].movement.referenceId).toBe(invoice.id)
            expect(saleMovements[0].movement.referenceType).toBe('INVOICE')

            // Verify inventory quantity decreased
            const updatedInventoryAfterSale = await prisma.inventory.findUnique({ where: { id: inventory.id } })
            const expectedQuantityAfterSale = currentQuantityAfterPurchase - testData.transactionQuantity
            expect(Number(updatedInventoryAfterSale!.currentQuantity.toString())).toBeCloseTo(expectedQuantityAfterSale, 2)
          }

          // Test 3: Manual adjustment should create movement
          const adjustmentQuantity = 5
          const adjustmentResult = await inventoryService.adjustQuantity(
            inventory.id,
            adjustmentQuantity,
            'ADJUSTMENT',
            'Test manual adjustment',
            user.id,
            false
          )

          // Verify adjustment movement was created
          expect(adjustmentResult.movement).toBeDefined()
          expect(adjustmentResult.movement.movementType).toBe('ADJUSTMENT')
          expect(Number(adjustmentResult.movement.quantity)).toBe(adjustmentQuantity)

          // Test 4: Low stock detection should work correctly
          const lowStockItems = await inventoryService.getLowStockItems(user.id, false)
          
          // Check if our item appears in low stock (depends on final quantity vs reorder level)
          const finalInventory = await prisma.inventory.findUnique({ where: { id: inventory.id } })
          const finalQuantity = Number(finalInventory!.currentQuantity.toString())
          const reorderLevel = Number(finalInventory!.reorderLevel.toString())
          
          const isLowStock = finalQuantity <= reorderLevel
          const itemInLowStock = lowStockItems.some((item: any) => item.inventory_id === inventory.id)
          
          expect(itemInLowStock).toBe(isLowStock)

          // Test 5: Movement history should be retrievable
          const movementHistory = await inventoryService.getMovementHistory(inventory.id, user.id, false)
          
          // Should have at least the movements we created
          expect(movementHistory.length).toBeGreaterThan(0)
          
          // All movements should be for our inventory item
          movementHistory.forEach(movement => {
            expect(movement.inventoryId).toBe(inventory.id)
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should prevent negative inventory levels', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          user: fc.record({
            username: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            email: fc.emailAddress(),
            passwordHash: fc.string({ minLength: 10 }),
            firstName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            lastName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            role: fc.constantFrom('ADMIN', 'MANAGER', 'OWNER')
          }),
          inventory: fc.record({
            itemName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            itemCode: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            unitOfMeasure: fc.constantFrom('KG', 'LITERS', 'PIECES', 'BOXES'),
            currentQuantity: fc.integer({ min: 10, max: 100 }).map(n => n / 10), // 1-10 units
            reorderLevel: fc.integer({ min: 5, max: 20 }).map(n => n / 10), // 0.5-2 units
            unitCost: fc.integer({ min: 100, max: 10000 }).map(n => n / 100),
            sellingPrice: fc.integer({ min: 150, max: 15000 }).map(n => n / 100)
          }),
          excessiveQuantity: fc.integer({ min: 200, max: 1000 }).map(n => n / 10) // 20-100 units (more than available)
        }),
        async (testData) => {
          // Generate unique identifiers for this test run
          const uniqueId2 = generateUniqueId()
          
          // Create test user with unique data
          const user = await prisma.user.create({
            data: {
              ...testData.user,
              username: `user2_${uniqueId2}`,
              email: `test2_${uniqueId2}@example.com`
            }
          })

          // Create test inventory item
          const inventory = await prisma.inventory.create({
            data: {
              ...testData.inventory,
              itemCode: `item2_${uniqueId2}`,
              userId: user.id
            }
          })

          const initialQuantity = Number(inventory.currentQuantity.toString())

          // Attempt to reduce inventory by more than available
          const reductionQuantity = -testData.excessiveQuantity

          // This should throw an error
          await expect(
            inventoryService.adjustQuantity(
              inventory.id,
              reductionQuantity,
              'ADJUSTMENT',
              'Test excessive reduction',
              user.id,
              false
            )
          ).rejects.toThrow(/Insufficient inventory|Cannot reduce quantity below zero/)

          // Verify inventory quantity unchanged
          const unchangedInventory = await prisma.inventory.findUnique({ where: { id: inventory.id } })
          expect(Number(unchangedInventory!.currentQuantity.toString())).toBeCloseTo(initialQuantity, 2)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate inventory data integrity', () => {
    fc.assert(
      fc.property(
        fc.record({
          itemName: fc.oneof(
            fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0), // Valid names
            fc.constant(''), // Empty name
            fc.constant('   ') // Whitespace only
          ),
          itemCode: fc.oneof(
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0), // Valid codes
            fc.constant(''), // Empty code
            fc.constant('   ') // Whitespace only
          ),
          unitOfMeasure: fc.oneof(
            fc.constantFrom('KG', 'LITERS', 'PIECES', 'BOXES'), // Valid units
            fc.constant(''), // Empty unit
            fc.constant('   ') // Whitespace only
          ),
          currentQuantity: fc.oneof(
            fc.integer({ min: 0, max: 1000 }).map(n => n / 10), // Valid quantities
            fc.integer({ min: -100, max: -1 }).map(n => n / 10), // Negative quantities
            fc.constant(NaN), // Invalid number
            fc.constant("invalid") // Invalid type
          ),
          reorderLevel: fc.oneof(
            fc.integer({ min: 0, max: 100 }).map(n => n / 10), // Valid levels
            fc.integer({ min: -50, max: -1 }).map(n => n / 10) // Negative levels
          ),
          unitCost: fc.oneof(
            fc.integer({ min: 0, max: 10000 }).map(n => n / 100), // Valid costs
            fc.integer({ min: -1000, max: -1 }).map(n => n / 100) // Negative costs
          ),
          sellingPrice: fc.oneof(
            fc.integer({ min: 0, max: 15000 }).map(n => n / 100), // Valid prices
            fc.integer({ min: -1500, max: -1 }).map(n => n / 100) // Negative prices
          ),
          expiryDate: fc.oneof(
            fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }), // Valid dates
            fc.constant('invalid-date'), // Invalid date
            fc.constant(null) // Null date (should be valid)
          )
        }),
        (testData) => {
          const errors = inventoryService.validateInventoryData(testData)
          
          // Verify validation logic
          const hasValidItemName = typeof testData.itemName === 'string' && testData.itemName.trim().length > 0
          const hasValidItemCode = typeof testData.itemCode === 'string' && testData.itemCode.trim().length > 0
          const hasValidUnitOfMeasure = typeof testData.unitOfMeasure === 'string' && testData.unitOfMeasure.trim().length > 0
          const hasValidCurrentQuantity = typeof testData.currentQuantity === 'number' && !isNaN(testData.currentQuantity) && testData.currentQuantity >= 0
          const hasValidReorderLevel = typeof testData.reorderLevel === 'number' && !isNaN(testData.reorderLevel) && testData.reorderLevel >= 0
          const hasValidUnitCost = typeof testData.unitCost === 'number' && !isNaN(testData.unitCost) && testData.unitCost >= 0
          const hasValidSellingPrice = typeof testData.sellingPrice === 'number' && !isNaN(testData.sellingPrice) && testData.sellingPrice >= 0
          const hasValidExpiryDate = testData.expiryDate === null || (testData.expiryDate instanceof Date && !isNaN(testData.expiryDate.getTime()))
          
          const shouldBeValid = hasValidItemName && hasValidItemCode && hasValidUnitOfMeasure && 
                               hasValidCurrentQuantity && hasValidReorderLevel && hasValidUnitCost && 
                               hasValidSellingPrice && hasValidExpiryDate
          
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