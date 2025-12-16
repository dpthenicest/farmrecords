import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { apiSuccess, apiError, Successes, Errors } from '../responses'

/**
 * **Feature: farm-management-completion, Property 5: API Response Format Consistency**
 * **Validates: Requirements 2.1, 2.2, 2.3**
 * 
 * For any API endpoint and request type, responses should follow the standardized format 
 * with consistent success/error indicators and appropriate HTTP status codes
 */
describe('API Response Format Consistency', () => {
  it('should maintain consistent success response format across all success helpers', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        data: fc.oneof(
          fc.constant(null),
          fc.constant(undefined),
          fc.string(),
          fc.integer(),
          fc.boolean(),
          fc.array(fc.string()),
          fc.record({ name: fc.string(), value: fc.integer() })
        ),
        message: fc.string({ minLength: 1 }),
        status: fc.constantFrom(200, 201, 202) // Exclude 204 as it can't have JSON body
      }),
      async (options) => {
        const response = apiSuccess(options)
        const responseData = await response.json()
        
        // All success responses should have consistent structure
        expect(responseData).toHaveProperty('success', true)
        expect(responseData).toHaveProperty('message')
        expect(responseData).toHaveProperty('data')
        expect(typeof responseData.message).toBe('string')
        expect(response.status).toBeGreaterThanOrEqual(200)
        expect(response.status).toBeLessThan(300)
        
        // Data should be present and properly serialized
        if (options.data === undefined) {
          expect(responseData.data).toBe(null)
        }
      }
    ), { numRuns: 100 })
  })

  it('should maintain consistent error response format across all error helpers', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        code: fc.constantFrom('VALIDATION_ERROR', 'UNAUTHORIZED', 'INSUFFICIENT_PERMISSIONS', 'RESOURCE_NOT_FOUND', 'INTERNAL_ERROR'),
        message: fc.string({ minLength: 1 }),
        status: fc.integer({ min: 400, max: 599 }),
        details: fc.option(fc.array(fc.record({
          field: fc.option(fc.string()),
          message: fc.string({ minLength: 1 })
        })))
      }),
      async (options) => {
        const response = apiError(options)
        const responseData = await response.json()
        
        // All error responses should have consistent structure
        expect(responseData).toHaveProperty('success', false)
        expect(responseData).toHaveProperty('error')
        expect(responseData.error).toHaveProperty('code')
        expect(responseData.error).toHaveProperty('message')
        expect(typeof responseData.error.code).toBe('string')
        expect(typeof responseData.error.message).toBe('string')
        expect(response.status).toBeGreaterThanOrEqual(400)
        expect(response.status).toBeLessThan(600)
        
        // If details are provided, they should be in the response
        if (options.details) {
          expect(responseData.error).toHaveProperty('details')
          expect(Array.isArray(responseData.error.details)).toBe(true)
        }
      }
    ), { numRuns: 100 })
  })

  it('should ensure all success helper methods return consistent format', async () => {
    await fc.assert(fc.asyncProperty(
      fc.oneof(
        fc.constant(null),
        fc.constant(undefined),
        fc.string(),
        fc.integer(),
        fc.boolean(),
        fc.array(fc.string()),
        fc.record({ name: fc.string(), value: fc.integer() })
      ),
      async (data) => {
        const responses = [
          Successes.Ok(data),
          Successes.Created(data),
          Successes.Accepted(data)
        ]
        
        for (const response of responses) {
          const responseData = await response.json()
          expect(responseData).toHaveProperty('success', true)
          expect(responseData).toHaveProperty('message')
          expect(responseData).toHaveProperty('data')
          expect(typeof responseData.message).toBe('string')
          
          // Data should be properly handled
          if (data === undefined) {
            expect(responseData.data).toBe(null)
          }
        }
        
        // NoContent should have no body and correct status
        const noContentResponse = Successes.NoContent()
        expect(noContentResponse.status).toBe(204)
      }
    ), { numRuns: 100 })
  })

  it('should ensure all error helper methods return consistent format', async () => {
    await fc.assert(fc.asyncProperty(
      fc.option(fc.array(fc.record({
        field: fc.option(fc.string()),
        message: fc.string({ minLength: 1 })
      }))),
      async (details) => {
        const responses = [
          Errors.Validation(details),
          Errors.Unauthorized(),
          Errors.Forbidden(),
          Errors.NotFound(),
          Errors.Internal()
        ]
        
        for (const response of responses) {
          const responseData = await response.json()
          expect(responseData).toHaveProperty('success', false)
          expect(responseData).toHaveProperty('error')
          expect(responseData.error).toHaveProperty('code')
          expect(responseData.error).toHaveProperty('message')
          expect(typeof responseData.error.code).toBe('string')
          expect(typeof responseData.error.message).toBe('string')
        }
      }
    ), { numRuns: 100 })
  })

  it('should ensure HTTP status codes are appropriate for response types', () => {
    fc.assert(fc.property(
      fc.anything(),
      (data) => {
        // Success responses should have 2xx status codes
        expect(Successes.Ok(data).status).toBe(200)
        expect(Successes.Created(data).status).toBe(201)
        expect(Successes.NoContent().status).toBe(204)
        expect(Successes.Accepted(data).status).toBe(202)
        
        // Error responses should have appropriate 4xx/5xx status codes
        expect(Errors.Validation().status).toBe(400)
        expect(Errors.Unauthorized().status).toBe(401)
        expect(Errors.Forbidden().status).toBe(403)
        expect(Errors.NotFound().status).toBe(404)
        expect(Errors.Internal().status).toBe(500)
      }
    ), { numRuns: 100 })
  })
})