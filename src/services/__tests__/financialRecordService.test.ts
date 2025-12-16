import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { prisma } from '@/lib/prisma'
import { 
  createFromInvoice, 
  createFromPurchaseOrder, 
  createPaymentRecord,
  validateFinancialRecord,
  calculateFinancialAmount
} from '../financialRecordService'

// **Feature: farm-management-completion, Property 8: Financial Record Auto-Creation**
// **Validates: Requirements 3.1, 3.2, 3.3, 3.5**

describe('Financial Record Service Property Tests', () => {
  beforeEach(async () => {
    // Clean up test data
    await prisma.financialRecord.deleteMany()
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
    // Clean up test data
    await prisma.financialRecord.deleteMany()
    await prisma.invoiceItem.deleteMany()
    await prisma.invoice.deleteMany()
    await prisma.purchaseOrderItem.deleteMany()
    await prisma.purchaseOrder.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.supplier.deleteMany()
    await prisma.salesExpenseCategory.deleteMany()
    await prisma.user.deleteMany()
  })

  // Property 8: Financial Record Auto-Creation
  it('should automatically create financial records for all business transactions', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate test data
        fc.record({
          user: fc.record({
            username: fc.string({ minLength: 3, maxLength: 20 }).map(s => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${s.replace(/\s/g, '_')}`),
            email: fc.emailAddress(),
            passwordHash: fc.string({ minLength: 10 }),
            firstName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            lastName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            role: fc.constantFrom('ADMIN', 'MANAGER', 'OWNER')
          }),
          customer: fc.record({
            customerName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            customerCode: fc.string({ minLength: 1, maxLength: 20 }).map(s => `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
            customerType: fc.constantFrom('INDIVIDUAL', 'RESTAURANT', 'MARKET', 'PROCESSOR')
          }),
          supplier: fc.record({
            supplierName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            supplierCode: fc.string({ minLength: 1, maxLength: 20 }).map(s => `supp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
            supplierType: fc.constantFrom('FEED', 'VETERINARY', 'EQUIPMENT', 'SERVICES', 'GENERAL')
          }),
          category: fc.record({
            categoryName: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            categoryType: fc.constantFrom('SALES', 'EXPENSE')
          }),
          invoice: fc.record({
            invoiceNumber: fc.string({ minLength: 1, maxLength: 20 }).map(s => `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
            subtotal: fc.integer({ min: 100, max: 1000000 }).map(n => n / 100), // Convert to decimal
            taxAmount: fc.integer({ min: 0, max: 100000 }).map(n => n / 100),
            totalAmount: fc.integer({ min: 100, max: 1100000 }).map(n => n / 100)
          }),
          purchaseOrder: fc.record({
            poNumber: fc.string({ minLength: 1, maxLength: 20 }).map(s => `po_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`),
            subtotal: fc.integer({ min: 100, max: 1000000 }).map(n => n / 100),
            taxAmount: fc.integer({ min: 0, max: 100000 }).map(n => n / 100),
            totalAmount: fc.integer({ min: 100, max: 1100000 }).map(n => n / 100)
          }),
          paymentAmount: fc.integer({ min: 100, max: 1100000 }).map(n => n / 100)
        }),
        async (testData) => {
          // Create test user
          const user = await prisma.user.create({
            data: testData.user
          })

          // Create test customer
          const customer = await prisma.customer.create({
            data: {
              ...testData.customer,
              userId: user.id
            }
          })

          // Create test supplier
          const supplier = await prisma.supplier.create({
            data: {
              ...testData.supplier,
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

          // Test 1: Invoice creation should create financial record
          const invoice = await prisma.invoice.create({
            data: {
              ...testData.invoice,
              userId: user.id,
              customerId: customer.id,
              invoiceDate: new Date(),
              dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              status: 'DRAFT'
            }
          })

          const invoiceFinancialRecord = await createFromInvoice(invoice.id, user.id, category.id)
          
          // Verify financial record was created correctly
          expect(invoiceFinancialRecord).toBeDefined()
          expect(invoiceFinancialRecord.transactionType).toBe('INCOME')
          expect(Number(invoiceFinancialRecord.amount)).toBeCloseTo(testData.invoice.totalAmount, 2)
          expect(invoiceFinancialRecord.invoiceId).toBe(invoice.id)
          expect(invoiceFinancialRecord.customerId).toBe(customer.id)
          expect(invoiceFinancialRecord.userId).toBe(user.id)

          // Test 2: Purchase order creation should create financial record
          const purchaseOrder = await prisma.purchaseOrder.create({
            data: {
              ...testData.purchaseOrder,
              userId: user.id,
              supplierId: supplier.id,
              orderDate: new Date(),
              status: 'RECEIVED',
              actualDeliveryDate: new Date()
            }
          })

          const poFinancialRecord = await createFromPurchaseOrder(purchaseOrder.id, user.id, category.id)
          
          // Verify financial record was created correctly
          expect(poFinancialRecord).toBeDefined()
          expect(poFinancialRecord.transactionType).toBe('EXPENSE')
          expect(Number(poFinancialRecord.amount)).toBeCloseTo(testData.purchaseOrder.totalAmount, 2)
          expect(poFinancialRecord.purchaseOrderId).toBe(purchaseOrder.id)
          expect(poFinancialRecord.supplierId).toBe(supplier.id)
          expect(poFinancialRecord.userId).toBe(user.id)

          // Test 3: Payment processing should create payment record
          const paymentRecord = await createPaymentRecord(
            invoice.id,
            {
              amount: testData.paymentAmount,
              paymentMethod: 'CASH',
              paymentDate: new Date(),
              description: 'Test payment'
            },
            user.id,
            category.id
          )

          // Verify payment record was created correctly
          expect(paymentRecord).toBeDefined()
          expect(paymentRecord.transactionType).toBe('INCOME')
          expect(Number(paymentRecord.amount)).toBeCloseTo(testData.paymentAmount, 2)
          expect(paymentRecord.invoiceId).toBe(invoice.id)
          expect(paymentRecord.customerId).toBe(customer.id)
          expect(paymentRecord.userId).toBe(user.id)

          // Verify invoice was marked as paid
          const updatedInvoice = await prisma.invoice.findUnique({ where: { id: invoice.id } })
          expect(updatedInvoice?.status).toBe('PAID')
          expect(updatedInvoice?.paymentDate).toBeDefined()
        }
      ),
      { numRuns: 100 }
    )
  })

  // **Feature: farm-management-completion, Property 23: Financial Calculation Accuracy**
  // **Validates: Requirements 8.3**
  it('should maintain mathematical accuracy in all financial calculations', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          baseAmount: fc.integer({ min: 1, max: 99999999 }).map(n => n / 100), // Convert to decimal
          taxRate: fc.integer({ min: 0, max: 50 }).map(n => n / 100) // 0% to 50% tax
        }),
        (testData) => {
          const result = calculateFinancialAmount(testData.baseAmount, testData.taxRate)
          
          // Verify calculation accuracy
          const expectedTotal = testData.baseAmount * (1 + testData.taxRate)
          const actualTotal = Number(result.toString())
          
          // Should be accurate to 2 decimal places (currency precision)
          expect(actualTotal).toBeCloseTo(expectedTotal, 2)
          
          // Result should always be greater than or equal to base amount
          expect(actualTotal).toBeGreaterThanOrEqual(testData.baseAmount)
          
          // Tax calculation should be consistent
          const calculatedTax = actualTotal - testData.baseAmount
          const expectedTax = testData.baseAmount * testData.taxRate
          expect(calculatedTax).toBeCloseTo(expectedTax, 2)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should validate financial record data integrity', async () => {
    await fc.assert(
      fc.property(
        fc.record({
          transactionType: fc.oneof(
            fc.constant('INCOME'),
            fc.constant('EXPENSE'), 
            fc.constant('TRANSFER'),
            fc.string() // Invalid types
          ),
          amount: fc.oneof(
            fc.integer({ min: 1, max: 99999999 }).map(n => n / 100), // Valid amounts
            fc.integer({ min: -100000, max: 0 }).map(n => n / 100), // Invalid amounts
            fc.constant(0) // Zero amount
          ),
          categoryId: fc.oneof(
            fc.integer({ min: 1, max: 1000 }), // Valid IDs
            fc.integer({ min: -100, max: 0 }) // Invalid IDs
          ),
          description: fc.oneof(
            fc.string({ minLength: 1, maxLength: 200 }), // Valid descriptions
            fc.constant(''), // Empty description
            fc.constant('   ') // Whitespace only
          ),
          transactionDate: fc.oneof(
            fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }), // Valid dates
            fc.constant(new Date('invalid')) // Invalid date
          ),
          customerId: fc.option(fc.integer({ min: 1, max: 1000 })),
          supplierId: fc.option(fc.integer({ min: 1, max: 1000 })),
          invoiceId: fc.option(fc.integer({ min: 1, max: 1000 })),
          purchaseOrderId: fc.option(fc.integer({ min: 1, max: 1000 }))
        }),
        (testData) => {
          const errors = validateFinancialRecord(testData)
          
          // Verify validation logic
          const hasValidTransactionType = ['INCOME', 'EXPENSE', 'TRANSFER'].includes(testData.transactionType)
          const hasValidAmount = typeof testData.amount === 'number' && testData.amount > 0
          const hasValidCategoryId = typeof testData.categoryId === 'number' && testData.categoryId > 0
          const hasValidDescription = typeof testData.description === 'string' && testData.description.trim().length > 0
          const hasValidDate = testData.transactionDate instanceof Date && !isNaN(testData.transactionDate.getTime())
          
          // Income records should have customer or invoice reference
          const incomeHasReference = testData.transactionType !== 'INCOME' || testData.customerId || testData.invoiceId
          
          // Expense records should have supplier or purchase order reference  
          const expenseHasReference = testData.transactionType !== 'EXPENSE' || testData.supplierId || testData.purchaseOrderId
          
          const shouldBeValid = hasValidTransactionType && hasValidAmount && hasValidCategoryId && 
                               hasValidDescription && hasValidDate && incomeHasReference && expenseHasReference
          
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