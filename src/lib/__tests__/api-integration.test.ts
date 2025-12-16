import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Successes, Errors } from '../responses'

/**
 * Integration test to verify API response standardization
 * This test ensures that the standardized response utilities work correctly
 */
describe('API Response Standardization Integration', () => {
  it('should create consistent success responses', async () => {
    const testData = { id: 1, name: 'Test User', email: 'test@example.com' }
    
    const okResponse = Successes.Ok(testData)
    const createdResponse = Successes.Created(testData)
    const acceptedResponse = Successes.Accepted(testData)
    const noContentResponse = Successes.NoContent()
    
    // Test OK response
    const okData = await okResponse.json()
    expect(okResponse.status).toBe(200)
    expect(okData.success).toBe(true)
    expect(okData.data).toEqual(testData)
    expect(okData.message).toBe('Request successful')
    
    // Test Created response
    const createdData = await createdResponse.json()
    expect(createdResponse.status).toBe(201)
    expect(createdData.success).toBe(true)
    expect(createdData.data).toEqual(testData)
    expect(createdData.message).toBe('Resource created successfully')
    
    // Test Accepted response
    const acceptedData = await acceptedResponse.json()
    expect(acceptedResponse.status).toBe(202)
    expect(acceptedData.success).toBe(true)
    expect(acceptedData.data).toEqual(testData)
    expect(acceptedData.message).toBe('Request accepted for processing')
    
    // Test NoContent response
    expect(noContentResponse.status).toBe(204)
  })

  it('should create consistent error responses', async () => {
    const validationErrors = [
      { field: 'email', message: 'Email is required' },
      { field: 'password', message: 'Password must be at least 8 characters' }
    ]
    
    const unauthorizedResponse = Errors.Unauthorized()
    const forbiddenResponse = Errors.Forbidden()
    const notFoundResponse = Errors.NotFound()
    const validationResponse = Errors.Validation(validationErrors)
    const internalResponse = Errors.Internal()
    
    // Test Unauthorized response
    const unauthorizedData = await unauthorizedResponse.json()
    expect(unauthorizedResponse.status).toBe(401)
    expect(unauthorizedData.success).toBe(false)
    expect(unauthorizedData.error.code).toBe('UNAUTHORIZED')
    expect(unauthorizedData.error.message).toBe('Authentication required')
    
    // Test Forbidden response
    const forbiddenData = await forbiddenResponse.json()
    expect(forbiddenResponse.status).toBe(403)
    expect(forbiddenData.success).toBe(false)
    expect(forbiddenData.error.code).toBe('INSUFFICIENT_PERMISSIONS')
    
    // Test NotFound response
    const notFoundData = await notFoundResponse.json()
    expect(notFoundResponse.status).toBe(404)
    expect(notFoundData.success).toBe(false)
    expect(notFoundData.error.code).toBe('RESOURCE_NOT_FOUND')
    
    // Test Validation response
    const validationData = await validationResponse.json()
    expect(validationResponse.status).toBe(400)
    expect(validationData.success).toBe(false)
    expect(validationData.error.code).toBe('VALIDATION_ERROR')
    expect(validationData.error.details).toEqual(validationErrors)
    
    // Test Internal response
    const internalData = await internalResponse.json()
    expect(internalResponse.status).toBe(500)
    expect(internalData.success).toBe(false)
    expect(internalData.error.code).toBe('INTERNAL_ERROR')
  })
})