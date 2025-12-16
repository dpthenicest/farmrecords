/**
 * **Feature: farm-management-completion, Property 3: Form Validation Consistency**
 * 
 * Property-based test to verify that form validation returns appropriate validation 
 * errors in a consistent format across all form types.
 * 
 * **Validates: Requirements 1.4**
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// Import validation functions from services
import { validateTaskData } from '@/services/taskService'

// Define common validation patterns that should be consistent across forms
interface ValidationResult {
  isValid: boolean
  errors: string[]
}

// Asset form validation function (extracted from AssetForm component logic)
function validateAssetData(data: {
  assetName: string
  assetCode: string
  assetType: string
  purchaseCost: string
  salvageValue: string
  usefulLifeYears: string
  depreciationRate: string
}): ValidationResult {
  const errors: string[] = []

  if (!data.assetName.trim()) {
    errors.push("Asset name is required")
  }

  if (!data.assetCode.trim()) {
    errors.push("Asset code is required")
  }

  if (!data.assetType) {
    errors.push("Asset type is required")
  }

  if (!data.purchaseCost || isNaN(Number(data.purchaseCost)) || Number(data.purchaseCost) <= 0) {
    errors.push("Valid purchase cost is required")
  }

  if (!data.salvageValue || isNaN(Number(data.salvageValue)) || Number(data.salvageValue) < 0) {
    errors.push("Valid salvage value is required")
  }

  if (Number(data.salvageValue) >= Number(data.purchaseCost)) {
    errors.push("Salvage value must be less than purchase cost")
  }

  if (!data.usefulLifeYears || isNaN(Number(data.usefulLifeYears)) || Number(data.usefulLifeYears) <= 0) {
    errors.push("Valid useful life years is required")
  }

  if (!data.depreciationRate || isNaN(Number(data.depreciationRate)) || Number(data.depreciationRate) < 0) {
    errors.push("Valid depreciation rate is required")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Animal form validation function (extracted from AnimalForm component logic)
function validateAnimalData(data: {
  animalTag: string
  species: string
  purchaseWeight?: string
  currentWeight?: string
  purchaseCost?: string
  birthDate?: string
}): ValidationResult {
  const errors: string[] = []

  if (!data.animalTag.trim()) {
    errors.push("Animal tag is required")
  }

  if (!data.species.trim()) {
    errors.push("Species is required")
  }

  if (data.purchaseWeight && isNaN(Number(data.purchaseWeight))) {
    errors.push("Purchase weight must be a valid number")
  }

  if (data.currentWeight && isNaN(Number(data.currentWeight))) {
    errors.push("Current weight must be a valid number")
  }

  if (data.purchaseCost && isNaN(Number(data.purchaseCost))) {
    errors.push("Purchase cost must be a valid number")
  }

  if (data.birthDate) {
    const birthDate = new Date(data.birthDate)
    const today = new Date()
    if (birthDate > today) {
      errors.push("Birth date cannot be in the future")
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Invoice form validation function (extracted from InvoiceForm component logic)
function validateInvoiceData(data: {
  invoiceNumber: string
  invoiceDate?: Date
  dueDate?: Date
}): ValidationResult {
  const errors: string[] = []

  if (!data.invoiceNumber.trim()) {
    errors.push("Invoice number is required")
  }

  if (!data.invoiceDate) {
    errors.push("Invoice Date is required")
  }

  if (!data.dueDate) {
    errors.push("Due Date is required")
  }

  if (data.invoiceDate && data.dueDate && data.dueDate.getTime() <= data.invoiceDate.getTime()) {
    errors.push("Due date must be after invoice date")
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Task form validation wrapper (using existing service function)
function validateTaskFormData(data: {
  taskTitle: string
  priority: string
  status: string
  dueDate?: Date | null
  assignedTo?: number | null
  animalBatchId?: number | null
  assetId?: number | null
}): ValidationResult {
  // Convert null values to undefined for the service function
  const cleanedData = {
    ...data,
    dueDate: data.dueDate || undefined,
    assignedTo: data.assignedTo || undefined,
    animalBatchId: data.animalBatchId || undefined,
    assetId: data.assetId || undefined
  }
  
  const serviceErrors = validateTaskData(cleanedData)
  
  return {
    isValid: serviceErrors.length === 0,
    errors: serviceErrors
  }
}

describe('Property 3: Form Validation Consistency', () => {
  it('should return consistent validation error format for Asset forms with invalid data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          assetName: fc.oneof(fc.constant(""), fc.constant("   ")), // Invalid: empty or whitespace
          assetCode: fc.oneof(fc.constant(""), fc.constant("   ")), // Invalid: empty or whitespace
          assetType: fc.constant(""), // Invalid: empty
          purchaseCost: fc.oneof(fc.constant(""), fc.constant("invalid"), fc.constant("-100")), // Invalid values
          salvageValue: fc.oneof(fc.constant(""), fc.constant("invalid"), fc.constant("-50")), // Invalid values
          usefulLifeYears: fc.oneof(fc.constant(""), fc.constant("0"), fc.constant("-5")), // Invalid values
          depreciationRate: fc.oneof(fc.constant(""), fc.constant("invalid"), fc.constant("-10")) // Invalid values
        }),
        async (invalidAssetData) => {
          const result = validateAssetData(invalidAssetData)
          
          // Property: Invalid data should always result in validation errors
          expect(result.isValid).toBe(false)
          expect(result.errors).toBeInstanceOf(Array)
          expect(result.errors.length).toBeGreaterThan(0)
          
          // Property: All error messages should be non-empty strings
          result.errors.forEach(error => {
            expect(typeof error).toBe('string')
            expect(error.trim().length).toBeGreaterThan(0)
          })
          
          // Property: Error messages should be descriptive (contain field context)
          const hasDescriptiveErrors = result.errors.some(error => 
            error.toLowerCase().includes('asset') || 
            error.toLowerCase().includes('cost') || 
            error.toLowerCase().includes('required') ||
            error.toLowerCase().includes('valid')
          )
          expect(hasDescriptiveErrors).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return consistent validation error format for Animal forms with invalid data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          animalTag: fc.oneof(fc.constant(""), fc.constant("   ")), // Invalid: empty or whitespace
          species: fc.oneof(fc.constant(""), fc.constant("   ")), // Invalid: empty or whitespace
          purchaseWeight: fc.oneof(fc.constant("invalid"), fc.constant("abc")), // Invalid: non-numeric
          currentWeight: fc.oneof(fc.constant("invalid"), fc.constant("xyz")), // Invalid: non-numeric
          purchaseCost: fc.oneof(fc.constant("invalid"), fc.constant("not-a-number")), // Invalid: non-numeric
          birthDate: fc.date({ min: new Date(Date.now() + 24 * 60 * 60 * 1000) }).map(d => d.toISOString().split('T')[0]) // Invalid: future date
        }),
        async (invalidAnimalData) => {
          const result = validateAnimalData(invalidAnimalData)
          
          // Property: Invalid data should always result in validation errors
          expect(result.isValid).toBe(false)
          expect(result.errors).toBeInstanceOf(Array)
          expect(result.errors.length).toBeGreaterThan(0)
          
          // Property: All error messages should be non-empty strings
          result.errors.forEach(error => {
            expect(typeof error).toBe('string')
            expect(error.trim().length).toBeGreaterThan(0)
          })
          
          // Property: Error messages should be descriptive
          const hasDescriptiveErrors = result.errors.some(error => 
            error.toLowerCase().includes('animal') || 
            error.toLowerCase().includes('species') || 
            error.toLowerCase().includes('required') ||
            error.toLowerCase().includes('valid') ||
            error.toLowerCase().includes('number') ||
            error.toLowerCase().includes('date')
          )
          expect(hasDescriptiveErrors).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return consistent validation error format for Invoice forms with invalid data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          invoiceNumber: fc.oneof(fc.constant(""), fc.constant("   ")), // Invalid: empty or whitespace
          invoiceDate: fc.constant(undefined), // Invalid: missing required date
          dueDate: fc.constant(undefined) // Invalid: missing required date
        }),
        async (invalidInvoiceData) => {
          const result = validateInvoiceData(invalidInvoiceData)
          
          // Property: Invalid data should always result in validation errors
          expect(result.isValid).toBe(false)
          expect(result.errors).toBeInstanceOf(Array)
          expect(result.errors.length).toBeGreaterThan(0)
          
          // Property: All error messages should be non-empty strings
          result.errors.forEach(error => {
            expect(typeof error).toBe('string')
            expect(error.trim().length).toBeGreaterThan(0)
          })
          
          // Property: Error messages should be descriptive
          const hasDescriptiveErrors = result.errors.some(error => 
            error.toLowerCase().includes('invoice') || 
            error.toLowerCase().includes('date') || 
            error.toLowerCase().includes('required')
          )
          expect(hasDescriptiveErrors).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return consistent validation error format for Task forms with invalid data', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          taskTitle: fc.oneof(fc.constant(""), fc.constant("   ")), // Invalid: empty or whitespace
          priority: fc.oneof(fc.constant(""), fc.constant("INVALID_PRIORITY")), // Invalid: empty or invalid value
          status: fc.oneof(fc.constant(""), fc.constant("INVALID_STATUS")), // Invalid: empty or invalid value
          dueDate: fc.date({ max: new Date(Date.now() - 24 * 60 * 60 * 1000) }), // Invalid: past date
          assignedTo: fc.oneof(fc.constant(-1), fc.constant(0)), // Invalid: non-positive numbers
          animalBatchId: fc.oneof(fc.constant(-1), fc.constant(0)), // Invalid: non-positive numbers
          assetId: fc.oneof(fc.constant(-1), fc.constant(0)) // Invalid: non-positive numbers
        }),
        async (invalidTaskData) => {
          const result = validateTaskFormData(invalidTaskData)
          
          // Property: Invalid data should always result in validation errors
          expect(result.isValid).toBe(false)
          expect(result.errors).toBeInstanceOf(Array)
          expect(result.errors.length).toBeGreaterThan(0)
          
          // Property: All error messages should be non-empty strings
          result.errors.forEach(error => {
            expect(typeof error).toBe('string')
            expect(error.trim().length).toBeGreaterThan(0)
          })
          
          // Property: Error messages should be descriptive
          const hasDescriptiveErrors = result.errors.some(error => 
            error.toLowerCase().includes('task') || 
            error.toLowerCase().includes('title') || 
            error.toLowerCase().includes('priority') ||
            error.toLowerCase().includes('status') ||
            error.toLowerCase().includes('required') ||
            error.toLowerCase().includes('valid')
          )
          expect(hasDescriptiveErrors).toBe(true)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should return no validation errors for valid form data across all form types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          // Valid asset data
          assetData: fc.record({
            assetName: fc.string({ minLength: 1, maxLength: 100 }).filter(s => s.trim().length > 0),
            assetCode: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            assetType: fc.constantFrom('INFRASTRUCTURE', 'EQUIPMENT', 'VEHICLES'),
            purchaseCost: fc.float({ min: Math.fround(100), max: Math.fround(100000), noNaN: true }).map(n => n.toString()),
            salvageValue: fc.float({ min: Math.fround(0), max: Math.fround(50000), noNaN: true }).map(n => n.toString()),
            usefulLifeYears: fc.integer({ min: 1, max: 50 }).map(n => n.toString()),
            depreciationRate: fc.float({ min: Math.fround(0.1), max: Math.fround(50), noNaN: true }).map(n => n.toString())
          }).filter(data => Number(data.salvageValue) < Number(data.purchaseCost)),
          
          // Valid animal data
          animalData: fc.record({
            animalTag: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            species: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            purchaseWeight: fc.option(fc.float({ min: Math.fround(0.1), max: Math.fround(1000), noNaN: true }).map(n => n.toString())),
            currentWeight: fc.option(fc.float({ min: Math.fround(0.1), max: Math.fround(1000), noNaN: true }).map(n => n.toString())),
            purchaseCost: fc.option(fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }).map(n => n.toString())),
            birthDate: fc.option(fc.date({ max: new Date() }).map(d => d.toISOString().split('T')[0]))
          }),
          
          // Valid invoice data
          invoiceData: fc.tuple(
            fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            fc.date({ max: new Date() })
          ).chain(([invoiceNumber, invoiceDate]) => 
            fc.record({
              invoiceNumber: fc.constant(invoiceNumber),
              invoiceDate: fc.constant(invoiceDate),
              dueDate: fc.date({ min: new Date(invoiceDate.getTime() + 24 * 60 * 60 * 1000) }) // At least 1 day after invoice date
            })
          ),
          
          // Valid task data
          taskData: fc.record({
            taskTitle: fc.string({ minLength: 1, maxLength: 255 }).filter(s => s.trim().length > 0),
            priority: fc.constantFrom('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
            status: fc.constantFrom('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
            dueDate: fc.option(fc.date({ min: new Date(Date.now() + 60 * 60 * 1000), max: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) })), // At least 1 hour in future, max 1 year
            assignedTo: fc.option(fc.integer({ min: 1, max: 1000000 })),
            animalBatchId: fc.option(fc.integer({ min: 1, max: 1000000 })),
            assetId: fc.option(fc.integer({ min: 1, max: 1000000 }))
          })
        }),
        async (validData) => {
          // Test Asset validation
          const assetResult = validateAssetData(validData.assetData)
          expect(assetResult.isValid).toBe(true)
          expect(assetResult.errors).toHaveLength(0)
          
          // Test Animal validation
          const animalResult = validateAnimalData(validData.animalData)
          expect(animalResult.isValid).toBe(true)
          expect(animalResult.errors).toHaveLength(0)
          
          // Test Invoice validation
          const invoiceResult = validateInvoiceData(validData.invoiceData)
          expect(invoiceResult.isValid).toBe(true)
          expect(invoiceResult.errors).toHaveLength(0)
          
          // Test Task validation
          const taskResult = validateTaskFormData(validData.taskData)
          expect(taskResult.isValid).toBe(true)
          expect(taskResult.errors).toHaveLength(0)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('should maintain consistent error message structure across all form types', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          formType: fc.constantFrom('asset', 'animal', 'invoice', 'task'),
          testInvalidData: fc.boolean()
        }),
        async ({ formType, testInvalidData }) => {
          let result: ValidationResult
          
          switch (formType) {
            case 'asset':
              result = validateAssetData({
                assetName: testInvalidData ? "" : "Valid Asset",
                assetCode: testInvalidData ? "" : "ASSET001",
                assetType: testInvalidData ? "" : "EQUIPMENT",
                purchaseCost: testInvalidData ? "invalid" : "1000",
                salvageValue: testInvalidData ? "invalid" : "100",
                usefulLifeYears: testInvalidData ? "0" : "10",
                depreciationRate: testInvalidData ? "invalid" : "10"
              })
              break
              
            case 'animal':
              result = validateAnimalData({
                animalTag: testInvalidData ? "" : "COW001",
                species: testInvalidData ? "" : "Cattle",
                purchaseWeight: testInvalidData ? "invalid" : "500",
                currentWeight: testInvalidData ? "invalid" : "600",
                purchaseCost: testInvalidData ? "invalid" : "1500"
              })
              break
              
            case 'invoice':
              result = validateInvoiceData({
                invoiceNumber: testInvalidData ? "" : "INV001",
                invoiceDate: testInvalidData ? undefined : new Date(),
                dueDate: testInvalidData ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
              })
              break
              
            case 'task':
              result = validateTaskFormData({
                taskTitle: testInvalidData ? "" : "Valid Task",
                priority: testInvalidData ? "INVALID" : "MEDIUM",
                status: testInvalidData ? "INVALID" : "PENDING",
                dueDate: testInvalidData ? new Date(Date.now() - 24 * 60 * 60 * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000)
              })
              break
              
            default:
              throw new Error(`Unknown form type: ${formType}`)
          }
          
          if (testInvalidData) {
            // Property: Invalid data should produce errors
            expect(result.isValid).toBe(false)
            expect(result.errors.length).toBeGreaterThan(0)
            
            // Property: Error messages should follow consistent patterns
            result.errors.forEach(error => {
              // Should be a non-empty string
              expect(typeof error).toBe('string')
              expect(error.trim().length).toBeGreaterThan(0)
              
              // Should not contain technical jargon or stack traces
              expect(error).not.toMatch(/Error:|Exception:|Stack trace:/i)
              
              // Should be user-friendly (contain common validation terms)
              const isUserFriendly = /required|valid|must|cannot|should|invalid/i.test(error)
              expect(isUserFriendly).toBe(true)
            })
          } else {
            // Property: Valid data should not produce errors
            expect(result.isValid).toBe(true)
            expect(result.errors).toHaveLength(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})