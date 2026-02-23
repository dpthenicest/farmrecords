/**
 * Financial Integration Tests
 * Tests the integration between invoices, purchase orders, assets, and financial records
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { prisma } from '@/lib/prisma'
import { invoiceService } from '@/services/invoiceService'
import { purchaseOrderService } from '@/services/purchaseOrderService'
import { getFinancialRecords } from '@/services/financialRecordService'

describe('Financial Integration Tests', () => {
  let testUserId: number
  let testCustomerId: number
  let testSupplierId: number
  let testCategoryId: number
  let testAssetId: number
  let testAnimalBatchId: number
  let testInventoryId: number

  beforeAll(async () => {
    // Create test user
    const user = await prisma.user.create({
      data: {
        username: 'fintest_user',
        email: 'fintest@test.com',
        passwordHash: 'test',
        role: 'OWNER',
      },
    })
    testUserId = user.id

    // Create test customer
    const customer = await prisma.customer.create({
      data: {
        userId: testUserId,
        customerName: 'Test Customer',
        customerCode: 'CUST-TEST-001',
        customerType: 'INDIVIDUAL',
      },
    })
    testCustomerId = customer.id

    // Create test supplier
    const supplier = await prisma.supplier.create({
      data: {
        userId: testUserId,
        supplierName: 'Test Supplier',
        supplierCode: 'SUPP-TEST-001',
        supplierType: 'GENERAL',
      },
    })
    testSupplierId = supplier.id

    // Create test category
    const category = await prisma.salesExpenseCategory.create({
      data: {
        userId: testUserId,
        categoryName: 'Test Category',
        categoryType: 'SALES',
      },
    })
    testCategoryId = category.id

    // Create test asset
    const asset = await prisma.asset.create({
      data: {
        userId: testUserId,
        assetName: 'Test Tractor',
        assetCode: 'ASSET-TEST-001',
        assetType: 'EQUIPMENT',
        purchaseCost: 50000,
        purchaseDate: new Date(),
        salvageValue: 5000,
        usefulLifeYears: 10,
        depreciationRate: 10,
        conditionStatus: 'GOOD',
      },
    })
    testAssetId = asset.id

    // Create test animal batch
    const batch = await prisma.animalBatch.create({
      data: {
        userId: testUserId,
        batchCode: 'BATCH-TEST-001',
        species: 'Chicken',
        breed: 'Broiler',
        initialQuantity: 100,
        currentQuantity: 100,
        batchStartDate: new Date(),
        totalCost: 10000,
        batchStatus: 'ACTIVE',
      },
    })
    testAnimalBatchId = batch.id

    // Create test inventory
    const inventory = await prisma.inventory.create({
      data: {
        userId: testUserId,
        itemName: 'Test Feed',
        itemCode: 'INV-TEST-001',
        unitOfMeasure: 'kg',
        currentQuantity: 1000,
        reorderLevel: 100,
        unitCost: 50,
        sellingPrice: 75,
      },
    })
    testInventoryId = inventory.id
  })

  afterAll(async () => {
    // Clean up test data
    await prisma.invoiceItem.deleteMany({ where: { invoice: { userId: testUserId } } })
    await prisma.invoice.deleteMany({ where: { userId: testUserId } })
    await prisma.purchaseOrderItem.deleteMany({ where: { purchaseOrder: { userId: testUserId } } })
    await prisma.purchaseOrder.deleteMany({ where: { userId: testUserId } })
    await prisma.financialRecord.deleteMany({ where: { userId: testUserId } })
    await prisma.inventory.deleteMany({ where: { userId: testUserId } })
    await prisma.animalBatch.deleteMany({ where: { userId: testUserId } })
    await prisma.asset.deleteMany({ where: { userId: testUserId } })
    await prisma.salesExpenseCategory.deleteMany({ where: { userId: testUserId } })
    await prisma.customer.deleteMany({ where: { userId: testUserId } })
    await prisma.supplier.deleteMany({ where: { userId: testUserId } })
    await prisma.user.delete({ where: { id: testUserId } })
  })

  describe('Invoice with Asset Items', () => {
    it('should create invoice with asset item', async () => {
      const invoiceData = {
        customerId: testCustomerId,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'DRAFT',
        taxRate: 8,
        items: [
          {
            assetId: testAssetId,
            itemDescription: 'Sale of Test Tractor',
            quantity: 1,
            unitPrice: 45000,
          },
        ],
      }

      const invoice = await invoiceService.createInvoice(testUserId, invoiceData)

      expect(invoice).toBeDefined()
      expect(invoice.items).toHaveLength(1)
      expect(invoice.items[0].assetId).toBe(testAssetId)
      expect(invoice.items[0].itemDescription).toBe('Sale of Test Tractor')
      expect(Number(invoice.totalAmount)).toBeCloseTo(48600, 2) // 45000 + 8% tax
    })

    it('should create invoice with animal batch item', async () => {
      const invoiceData = {
        customerId: testCustomerId,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'DRAFT',
        taxRate: 8,
        items: [
          {
            animalBatchId: testAnimalBatchId,
            itemDescription: 'Sale of 50 Broiler Chickens',
            quantity: 50,
            unitPrice: 150,
          },
        ],
      }

      const invoice = await invoiceService.createInvoice(testUserId, invoiceData)

      expect(invoice).toBeDefined()
      expect(invoice.items).toHaveLength(1)
      expect(invoice.items[0].animalBatchId).toBe(testAnimalBatchId)
      expect(Number(invoice.totalAmount)).toBeCloseTo(8100, 2) // 7500 + 8% tax
    })

    it('should create invoice with mixed items (inventory + asset)', async () => {
      const invoiceData = {
        customerId: testCustomerId,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'DRAFT',
        taxRate: 8,
        items: [
          {
            inventoryId: testInventoryId,
            itemDescription: 'Test Feed',
            quantity: 100,
            unitPrice: 75,
          },
          {
            assetId: testAssetId,
            itemDescription: 'Sale of Test Tractor',
            quantity: 1,
            unitPrice: 45000,
          },
        ],
      }

      const invoice = await invoiceService.createInvoice(testUserId, invoiceData)

      expect(invoice).toBeDefined()
      expect(invoice.items).toHaveLength(2)
      expect(invoice.items.some(item => item.inventoryId === testInventoryId)).toBe(true)
      expect(invoice.items.some(item => item.assetId === testAssetId)).toBe(true)
      expect(Number(invoice.totalAmount)).toBeCloseTo(56700, 2) // (7500 + 45000) + 8% tax = 52500 * 1.08
    })
  })

  describe('Purchase Order with Asset Items', () => {
    it('should create purchase order with asset item', async () => {
      const poData = {
        supplierId: testSupplierId,
        orderDate: new Date().toISOString(),
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        taxRate: 8,
        items: [
          {
            assetId: testAssetId,
            itemDescription: 'Purchase of New Tractor',
            quantity: 1,
            unitPrice: 50000,
          },
        ],
      }

      const po = await purchaseOrderService.createPurchaseOrder(testUserId, poData)

      expect(po).toBeDefined()
      expect(po.items).toHaveLength(1)
      expect(po.items[0].assetId).toBe(testAssetId)
      expect(Number(po.totalAmount)).toBeCloseTo(54000, 2) // 50000 + 8% tax
    })

    it('should create purchase order with animal batch item', async () => {
      const poData = {
        supplierId: testSupplierId,
        orderDate: new Date().toISOString(),
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        taxRate: 8,
        items: [
          {
            animalBatchId: testAnimalBatchId,
            itemDescription: 'Purchase of 100 Day-Old Chicks',
            quantity: 100,
            unitPrice: 100,
          },
        ],
      }

      const po = await purchaseOrderService.createPurchaseOrder(testUserId, poData)

      expect(po).toBeDefined()
      expect(po.items).toHaveLength(1)
      expect(po.items[0].animalBatchId).toBe(testAnimalBatchId)
      expect(Number(po.totalAmount)).toBeCloseTo(10800, 2) // 10000 + 8% tax
    })
  })

  describe('Financial Record Auto-Creation', () => {
    it('should auto-create financial record when invoice is sent', async () => {
      const invoiceData = {
        customerId: testCustomerId,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'SENT',
        categoryId: testCategoryId,
        taxRate: 8,
        items: [
          {
            inventoryId: testInventoryId,
            itemDescription: 'Test Feed',
            quantity: 50,
            unitPrice: 75,
          },
        ],
      }

      const invoice = await invoiceService.createInvoice(testUserId, invoiceData)

      // Check if financial record was created
      const records = await getFinancialRecords({
        userId: testUserId,
        role: 'OWNER',
        page: 1,
        limit: 10,
      })

      const invoiceRecord = records.records.find(r => r.invoiceId === invoice.id)
      expect(invoiceRecord).toBeDefined()
      expect(invoiceRecord?.transactionType).toBe('INCOME')
      expect(Number(invoiceRecord?.amount)).toBeCloseTo(4050, 2) // 3750 + 8% tax
    })

    it('should NOT auto-create financial record when invoice is draft', async () => {
      const invoiceData = {
        customerId: testCustomerId,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'DRAFT',
        categoryId: testCategoryId,
        taxRate: 8,
        items: [
          {
            inventoryId: testInventoryId,
            itemDescription: 'Test Feed',
            quantity: 25,
            unitPrice: 75,
          },
        ],
      }

      const invoice = await invoiceService.createInvoice(testUserId, invoiceData)

      // Check that no financial record was created
      const records = await getFinancialRecords({
        userId: testUserId,
        role: 'OWNER',
        page: 1,
        limit: 10,
      })

      const invoiceRecord = records.records.find(r => r.invoiceId === invoice.id)
      expect(invoiceRecord).toBeUndefined()
    })
  })

  describe('Update Operations', () => {
    it('should update invoice with new asset item', async () => {
      // Create initial invoice
      const invoiceData = {
        customerId: testCustomerId,
        invoiceDate: new Date().toISOString(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'DRAFT',
        taxRate: 8,
        items: [
          {
            inventoryId: testInventoryId,
            itemDescription: 'Test Feed',
            quantity: 10,
            unitPrice: 75,
          },
        ],
      }

      const invoice = await invoiceService.createInvoice(testUserId, invoiceData)

      // Update with asset item
      const updateData = {
        customerId: testCustomerId,
        invoiceDate: invoice.invoiceDate.toISOString(),
        dueDate: invoice.dueDate.toISOString(),
        status: 'DRAFT',
        taxRate: 8,
        items: [
          {
            assetId: testAssetId,
            itemDescription: 'Sale of Test Tractor',
            quantity: 1,
            unitPrice: 45000,
          },
        ],
      }

      const updated = await invoiceService.updateInvoice(
        invoice.id,
        testUserId,
        'OWNER',
        updateData
      )

      expect(updated).toBeDefined()
      expect(updated?.items).toHaveLength(1)
      expect(updated?.items[0].assetId).toBe(testAssetId)
      expect(updated?.items[0].inventoryId).toBeNull()
    })

    it('should update purchase order with new animal batch item', async () => {
      // Create initial PO
      const poData = {
        supplierId: testSupplierId,
        orderDate: new Date().toISOString(),
        expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        taxRate: 8,
        items: [
          {
            inventoryId: testInventoryId,
            itemDescription: 'Test Feed',
            quantity: 100,
            unitPrice: 50,
          },
        ],
      }

      const po = await purchaseOrderService.createPurchaseOrder(testUserId, poData)

      // Update with animal batch item
      const updateData = {
        supplierId: testSupplierId,
        orderDate: po.orderDate.toISOString(),
        expectedDeliveryDate: po.expectedDeliveryDate?.toISOString(),
        status: 'DRAFT',
        taxRate: 8,
        items: [
          {
            animalBatchId: testAnimalBatchId,
            itemDescription: 'Purchase of 100 Day-Old Chicks',
            quantity: 100,
            unitPrice: 100,
          },
        ],
      }

      const updated = await purchaseOrderService.updatePurchaseOrder(
        po.id,
        testUserId,
        'OWNER',
        updateData
      )

      expect(updated).toBeDefined()
      expect(updated?.items).toHaveLength(1)
      expect(updated?.items[0].animalBatchId).toBe(testAnimalBatchId)
      expect(updated?.items[0].inventoryId).toBeNull()
    })
  })
})
