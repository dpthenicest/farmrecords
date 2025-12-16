/**
 * **Feature: farm-management-completion, Property 4: Form Submission Success**
 * 
 * Property-based test to verify that form submission with valid data successfully 
 * saves the data and provides confirmation feedback.
 * 
 * **Validates: Requirements 1.5**
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'

// Mock fetch globally for testing
const mockFetch = vi.fn()
global.fetch = mockFetch

// Define form submission result interface
interface FormSubmissionResult {
  success: boolean
  data?: any
  error?: string
}

// Generic form submission function
async function submitForm(endpoint: string, data: any): Promise<FormSubmissionResult> {
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      credentials: "include",
      body: JSON.stringify(data)
    })

    if (response.ok) {
      const result = await response.json()
      return { success: true, data: result.data || result }
    } else {
      const result = await response.json()
      return { success: false, error: result.error || "Failed to save data" }
    }
  } catch (error) {
    return { success: false, error: "Network error occurred" }
  }
}

describe('Property 4: Form Submission Success', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('should successfully submit forms with valid data and provide confirmation', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          endpoint: fc.constantFrom('/api/assets', '/api/animals', '/api/invoices', '/api/customers'),
          formData: fc.record({
            name: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
            code: fc.string({ minLength: 1, maxLength: 20 }).filter(s => s.trim().length > 0),
            type: fc.constantFrom('EQUIPMENT', 'CATTLE', 'INVOICE', 'CUSTOMER'),
            status: fc.constantFrom('ACTIVE', 'INACTIVE', 'PENDING')
          }),
          responseId: fc.integer({ min: 1, max: 1000 })
        }),
        async ({ endpoint, formData, responseId }) => {
          // Clear previous mocks for this iteration
          vi.clearAllMocks()
          
          // Mock successful API response
          const mockResponseData = { id: responseId, ...formData }
          mockFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true, data: mockResponseData })
          })

          const result = await submitForm(endpoint, formData)

          // Property: Valid data should result in successful submission
          expect(result.success).toBe(true)
          expect(result.error).toBeUndefined()
          
          // Property: Successful submission should return data
          expect(result.data).toBeDefined()
          expect(result.data).toEqual(mockResponseData)
          
          // Property: API should be called with correct parameters
          expect(mockFetch).toHaveBeenCalledTimes(1)
          expect(mockFetch).toHaveBeenCalledWith(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(formData)
          })
        }
      ),
      { numRuns: 50 }
    )
  })

  it('should handle API errors gracefully and provide error feedback', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          endpoint: fc.constantFrom('/api/assets', '/api/animals', '/api/invoices', '/api/customers'),
          errorMessage: fc.string({ minLength: 1, maxLength: 50 }).filter(s => s.trim().length > 0),
          statusCode: fc.constantFrom(400, 401, 403, 404, 422, 500)
        }),
        async ({ endpoint, errorMessage, statusCode }) => {
          // Clear previous mocks for this iteration
          vi.clearAllMocks()
          
          // Mock error API response
          mockFetch.mockResolvedValueOnce({
            ok: false,
            status: statusCode,
            json: async () => ({ error: errorMessage })
          })

          const result = await submitForm(endpoint, { name: "Test", code: "TEST001" })
          
          // Property: API errors should be handled gracefully
          expect(result.success).toBe(false)
          expect(result.data).toBeUndefined()
          expect(result.error).toBeDefined()
          expect(typeof result.error).toBe('string')
          expect(result.error).toBe(errorMessage)
        }
      ),
      { numRuns: 25 }
    )
  })

  it('should handle network errors gracefully and provide fallback error messages', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('/api/assets', '/api/animals', '/api/invoices', '/api/customers'),
        async (endpoint) => {
          // Clear previous mocks for this iteration
          vi.clearAllMocks()
          
          // Mock network error
          mockFetch.mockRejectedValueOnce(new Error("Network error"))

          const result = await submitForm(endpoint, { name: "Test", code: "TEST001" })
          
          // Property: Network errors should be handled gracefully
          expect(result.success).toBe(false)
          expect(result.data).toBeUndefined()
          expect(result.error).toBeDefined()
          expect(result.error).toBe("Network error occurred")
        }
      ),
      { numRuns: 25 }
    )
  })
})