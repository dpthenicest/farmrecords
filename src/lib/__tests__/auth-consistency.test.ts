import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { requireAuth, requireRole, requireSelfOrRole } from '../auth'
import { Errors } from '../responses'

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn()
}))

// Mock the auth options
vi.mock('@/app/api/auth/[...nextauth]/route', () => ({
  authOptions: {}
}))

import { getServerSession } from 'next-auth'

/**
 * **Feature: farm-management-completion, Property 6: Authentication Consistency**
 * **Validates: Requirements 2.4**
 * 
 * For any protected API endpoint, unauthorized requests should be consistently 
 * rejected with proper authentication errors
 */
describe('Authentication Consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should consistently return unauthorized for missing sessions', async () => {
    await fc.assert(fc.asyncProperty(
      fc.array(fc.string(), { minLength: 1, maxLength: 5 }), // roles array
      async (roles) => {
        // Mock no session
        vi.mocked(getServerSession).mockResolvedValue(null)
        
        const authResult = await requireAuth()
        const roleResult = await requireRole(roles)
        const selfOrRoleResult = await requireSelfOrRole('user123', roles)
        
        // All auth functions should consistently reject unauthorized requests
        expect(authResult.authorized).toBe(false)
        expect(authResult.error).toBe('Unauthorized')
        
        expect(roleResult.authorized).toBe(false)
        expect(roleResult.error).toBe('Unauthorized')
        
        expect(selfOrRoleResult.authorized).toBe(false)
        expect(selfOrRoleResult.error).toBe('Unauthorized')
      }
    ), { numRuns: 100 })
  })

  it('should consistently return authorized for valid sessions with proper roles', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        userId: fc.string({ minLength: 1 }),
        userRole: fc.constantFrom('ADMIN', 'USER', 'MANAGER'),
        requiredRoles: fc.array(fc.constantFrom('ADMIN', 'USER', 'MANAGER'), { minLength: 1, maxLength: 3 })
      }),
      async ({ userId, userRole, requiredRoles }) => {
        // Mock valid session
        const mockSession = {
          user: {
            id: userId,
            role: userRole,
            username: 'testuser',
            email: 'test@example.com'
          }
        }
        vi.mocked(getServerSession).mockResolvedValue(mockSession)
        
        const authResult = await requireAuth()
        
        // requireAuth should always succeed with valid session
        expect(authResult.authorized).toBe(true)
        expect(authResult.user).toEqual(mockSession.user)
        
        const roleResult = await requireRole(requiredRoles)
        
        // requireRole should succeed only if user has required role
        if (requiredRoles.includes(userRole)) {
          expect(roleResult.authorized).toBe(true)
          expect(roleResult.user).toEqual(mockSession.user)
        } else {
          expect(roleResult.authorized).toBe(false)
          expect(roleResult.error).toBe('Forbidden: insufficient role')
        }
        
        const selfOrRoleResult = await requireSelfOrRole(userId, requiredRoles)
        
        // requireSelfOrRole should succeed if user is accessing their own data or has required role
        expect(selfOrRoleResult.authorized).toBe(true)
        expect(selfOrRoleResult.user).toEqual(mockSession.user)
      }
    ), { numRuns: 100 })
  })

  it('should consistently handle forbidden access for insufficient roles', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        userId: fc.string({ minLength: 1 }),
        targetUserId: fc.string({ minLength: 1 }),
        userRole: fc.constantFrom('USER', 'MANAGER'),
        requiredRoles: fc.constant(['ADMIN']) // Only admin allowed
      }).filter(({ userId, targetUserId }) => userId !== targetUserId), // Ensure different users
      async ({ userId, targetUserId, userRole, requiredRoles }) => {
        // Mock valid session but insufficient role
        const mockSession = {
          user: {
            id: userId,
            role: userRole,
            username: 'testuser',
            email: 'test@example.com'
          }
        }
        vi.mocked(getServerSession).mockResolvedValue(mockSession)
        
        const roleResult = await requireRole(requiredRoles)
        const selfOrRoleResult = await requireSelfOrRole(targetUserId, requiredRoles)
        
        // Both should consistently reject insufficient permissions
        expect(roleResult.authorized).toBe(false)
        expect(roleResult.error).toBe('Forbidden: insufficient role')
        
        expect(selfOrRoleResult.authorized).toBe(false)
        expect(selfOrRoleResult.error).toBe('Forbidden')
      }
    ), { numRuns: 100 })
  })

  it('should ensure error responses use standardized format', async () => {
    await fc.assert(fc.asyncProperty(
      fc.string({ minLength: 1 }),
      async (userId) => {
        // Mock no session to trigger unauthorized error
        vi.mocked(getServerSession).mockResolvedValue(null)
        
        const authResult = await requireAuth()
        
        // Verify the error format matches what API endpoints should return
        expect(authResult.authorized).toBe(false)
        expect(typeof authResult.error).toBe('string')
        expect(authResult.error.length).toBeGreaterThan(0)
        
        // Verify that the error can be used with standardized error responses
        const unauthorizedResponse = Errors.Unauthorized()
        const responseData = await unauthorizedResponse.json()
        
        expect(responseData.success).toBe(false)
        expect(responseData.error.code).toBe('UNAUTHORIZED')
        expect(unauthorizedResponse.status).toBe(401)
        
        const forbiddenResponse = Errors.Forbidden()
        const forbiddenData = await forbiddenResponse.json()
        
        expect(forbiddenData.success).toBe(false)
        expect(forbiddenData.error.code).toBe('INSUFFICIENT_PERMISSIONS')
        expect(forbiddenResponse.status).toBe(403)
      }
    ), { numRuns: 100 })
  })

  it('should maintain consistent auth result structure across all auth functions', async () => {
    await fc.assert(fc.asyncProperty(
      fc.record({
        hasSession: fc.boolean(),
        userId: fc.string({ minLength: 1 }),
        userRole: fc.constantFrom('ADMIN', 'USER', 'MANAGER'),
        requiredRoles: fc.array(fc.constantFrom('ADMIN', 'USER', 'MANAGER'), { minLength: 1, maxLength: 3 })
      }),
      async ({ hasSession, userId, userRole, requiredRoles }) => {
        if (hasSession) {
          const mockSession = {
            user: {
              id: userId,
              role: userRole,
              username: 'testuser',
              email: 'test@example.com'
            }
          }
          vi.mocked(getServerSession).mockResolvedValue(mockSession)
        } else {
          vi.mocked(getServerSession).mockResolvedValue(null)
        }
        
        const results = [
          await requireAuth(),
          await requireRole(requiredRoles),
          await requireSelfOrRole(userId, requiredRoles)
        ]
        
        // All auth functions should return consistent result structure
        results.forEach(result => {
          expect(result).toHaveProperty('authorized')
          expect(typeof result.authorized).toBe('boolean')
          
          if (result.authorized) {
            expect(result).toHaveProperty('user')
            expect(result.user).toHaveProperty('id')
            expect(result.user).toHaveProperty('role')
          } else {
            expect(result).toHaveProperty('error')
            expect(typeof result.error).toBe('string')
            expect(result.error.length).toBeGreaterThan(0)
          }
        })
      }
    ), { numRuns: 100 })
  })
})