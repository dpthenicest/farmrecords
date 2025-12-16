# Design Document

## Overview

This design addresses the completion and integration of the existing farm management system. The system currently has a well-structured Prisma schema with comprehensive relationships, partial API implementations, and incomplete UI components. This design will standardize all components, ensure proper data relationships, and provide complete CRUD functionality across all modules.

The system follows a Next.js 14 App Router architecture with:
- **Frontend**: React components with TypeScript, custom hooks for data fetching
- **Backend**: Next.js API routes with Prisma ORM for database operations
- **Database**: PostgreSQL with comprehensive relational schema
- **Authentication**: NextAuth.js with role-based access control

## Architecture

### Current Architecture Strengths
- Well-defined database schema with proper relationships
- Consistent authentication and authorization patterns
- Standardized response utilities (success/error handling)
- Service layer abstraction for business logic
- Custom hooks for data fetching and state management

### Architecture Improvements Needed
- Standardize API response formats across all endpoints
- Complete missing UI components and client-side implementations
- Implement proper data relationship handling in services
- Add comprehensive validation and error handling
- Ensure consistent CRUD patterns across all modules

### System Modules
1. **User Management**: Authentication, authorization, role management
2. **Financial Management**: Records, invoices, purchase orders, categories
3. **Asset & Inventory Management**: Items, movements, depreciation, maintenance
4. **Animal Management**: Individual animals, batches, health records
5. **Contact Management**: Customers, suppliers, relationship tracking
6. **Task Management**: Work assignments, scheduling, notifications
7. **Dashboard & Reporting**: Analytics, alerts, performance metrics

## Components and Interfaces

### API Layer Standardization

#### Consistent Response Format
All API endpoints will use the standardized response utilities from `src/lib/responses.ts`:

```typescript
// Success responses
Successes.Ok(data)           // 200 with data
Successes.Created(data)      // 201 for new resources
Successes.NoContent()        // 204 for deletions
Successes.Accepted(data)     // 202 for async operations

// Error responses
Errors.Validation(details)   // 400 with validation errors
Errors.Unauthorized()        // 401 for auth failures
Errors.Forbidden()          // 403 for permission issues
Errors.NotFound()           // 404 for missing resources
Errors.Internal()           // 500 for server errors
```

#### Service Layer Patterns
All services will implement consistent CRUD patterns:

```typescript
interface ServiceInterface<T> {
  getAll(filters: FilterOptions, pagination: PaginationOptions): Promise<PaginatedResponse<T>>
  getById(id: number, userId: number, role: string): Promise<T | null>
  create(data: CreateData, userId: number): Promise<T>
  update(id: number, data: UpdateData, userId: number, role: string): Promise<T>
  delete(id: number, userId: number, role: string): Promise<void>
}
```

### UI Component Architecture

#### Page Structure
All protected routes will follow this pattern:
```
/app/(protected)/module/
├── page.tsx          # Server component wrapper
├── client.tsx        # Main client component
└── _components/      # Module-specific components
    ├── ModuleTable.tsx
    ├── ModuleForm.tsx
    ├── ModuleFilters.tsx
    └── ModuleDetails.tsx
```

#### Component Responsibilities
- **Page Components**: Server-side rendering, initial data fetching
- **Client Components**: State management, user interactions, real-time updates
- **Table Components**: Data display, pagination, sorting, filtering
- **Form Components**: Data entry, validation, submission
- **Filter Components**: Search, filtering, date ranges
- **Detail Components**: Single record views, related data display

### Data Relationship Handling

#### Financial Record Linking
Financial records will be automatically created and linked for:
- Invoice creation → Income record with invoice reference
- Invoice payment → Payment record linked to original invoice
- Purchase order receipt → Expense record with PO reference
- Inventory movements → Cost tracking records
- Asset maintenance → Maintenance expense records

#### Animal Data Integration
Animal management will maintain proper relationships:
- Individual animals linked to batches
- Records applicable to both individuals and batches
- Batch-level aggregations for performance metrics
- Health tracking across individual and batch levels

#### Inventory Movement Tracking
All inventory changes will be tracked through:
- Purchase order receipts → Inventory increases
- Invoice items → Inventory decreases
- Manual adjustments → Documented movements
- Production activities → Raw material consumption

## Data Models

### Enhanced Service Interfaces

#### Financial Service Extensions
```typescript
interface FinancialRecordService {
  // Existing methods...
  createFromInvoice(invoice: Invoice): Promise<FinancialRecord>
  createFromPurchaseOrder(po: PurchaseOrder): Promise<FinancialRecord>
  createPaymentRecord(invoiceId: number, paymentData: PaymentData): Promise<FinancialRecord>
  getRecordsBySource(sourceType: string, sourceId: number): Promise<FinancialRecord[]>
}
```

#### Inventory Service Extensions
```typescript
interface InventoryService {
  // Existing methods...
  processMovement(movementData: InventoryMovementData): Promise<InventoryMovement>
  adjustFromPurchaseOrder(poItems: PurchaseOrderItem[]): Promise<InventoryMovement[]>
  adjustFromInvoice(invoiceItems: InvoiceItem[]): Promise<InventoryMovement[]>
  getLowStockItems(userId: number, role: string): Promise<Inventory[]>
  getMovementHistory(inventoryId: number): Promise<InventoryMovement[]>
}
```

#### Animal Service Extensions
```typescript
interface AnimalService {
  // Existing methods...
  createBatchRecord(batchId: number, recordData: AnimalRecordData): Promise<AnimalRecord>
  getPerformanceMetrics(animalId?: number, batchId?: number): Promise<PerformanceMetrics>
  getHealthHistory(animalId?: number, batchId?: number): Promise<AnimalRecord[]>
  updateBatchFromIndividuals(batchId: number): Promise<AnimalBatch>
}
```

### Validation Schemas

#### Common Validation Patterns
- **Required Fields**: All entities must have required fields validated
- **Date Validation**: Logical date sequences (start < end, birth < current)
- **Numeric Validation**: Positive values for quantities, prices, weights
- **Referential Integrity**: Foreign key existence validation
- **Business Rules**: Custom validation for domain-specific rules

#### Data Integrity Constraints
- **Financial Accuracy**: Decimal precision for monetary values
- **Inventory Consistency**: Prevent negative stock levels
- **Animal Tracking**: Unique tags within user scope
- **Asset Management**: Depreciation calculation validation
- **User Permissions**: Role-based data access validation

## Error Handling

### Client-Side Error Handling
- **Form Validation**: Real-time validation with clear error messages
- **API Error Display**: User-friendly error messages from API responses
- **Network Errors**: Retry mechanisms and offline state handling
- **Loading States**: Proper loading indicators during async operations
- **Error Boundaries**: React error boundaries for component failures

### Server-Side Error Handling
- **Validation Errors**: Detailed field-level error information
- **Database Errors**: Proper error mapping and user-friendly messages
- **Authentication Errors**: Clear unauthorized/forbidden responses
- **Business Logic Errors**: Domain-specific error handling
- **System Errors**: Proper logging and generic user messages

### Error Recovery Patterns
- **Optimistic Updates**: UI updates with rollback on failure
- **Retry Logic**: Automatic retry for transient failures
- **Graceful Degradation**: Partial functionality when services are unavailable
- **Error Logging**: Comprehensive error tracking for debugging
- **User Feedback**: Clear communication of error states and recovery options

## Testing Strategy

### Unit Testing Approach
Unit tests will focus on:
- **Service Layer Logic**: Business rules, data transformations, calculations
- **Validation Functions**: Input validation, constraint checking
- **Utility Functions**: Helper functions, formatters, converters
- **API Route Handlers**: Request processing, response formatting
- **Component Logic**: State management, event handling

### Property-Based Testing Approach
Property-based tests will verify universal properties using **fast-check** library with minimum 100 iterations per test:

- **Data Integrity Properties**: Verify relationships remain consistent across operations
- **Financial Calculation Properties**: Ensure mathematical accuracy in all calculations
- **Inventory Movement Properties**: Verify stock levels remain accurate through all operations
- **API Response Properties**: Ensure all endpoints return consistent response formats
- **Validation Properties**: Verify validation rules work across all input combinations

Each property-based test will be tagged with comments referencing the specific correctness property from this design document using the format: `**Feature: farm-management-completion, Property {number}: {property_text}**`

### Integration Testing
Integration tests will cover:
- **API Endpoint Integration**: Full request/response cycles
- **Database Integration**: Data persistence and retrieval
- **Authentication Integration**: Login flows and permission checks
- **Module Integration**: Cross-module data relationships
- **UI Integration**: User workflows and form submissions

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

After reviewing all testable properties from the prework analysis, I identified several areas where properties can be consolidated to eliminate redundancy:

- **API Response Consistency**: Properties 2.1, 2.2, and 2.3 can be combined into a comprehensive API consistency property
- **Financial Record Linking**: Properties 3.1, 3.2, 3.3, and 3.5 all test automatic financial record creation and can be consolidated
- **Inventory Movement Tracking**: Properties 5.1, 5.2, 5.3, and 5.4 all test inventory movement creation and tracking
- **Data Validation**: Properties 8.1, 8.2, 8.4, and 8.5 all test various validation rules and can be combined

The following properties provide unique validation value and will be implemented:

**Property 1: CRUD Operations Consistency**
*For any* entity and valid data, performing create, read, update, and delete operations should maintain data consistency and return expected results
**Validates: Requirements 1.2**

**Property 2: Data List Operations**
*For any* data list with pagination, filtering, and sorting parameters, the operations should return consistent and correct subsets of the data
**Validates: Requirements 1.3**

**Property 3: Form Validation Consistency**
*For any* form with invalid input data, the system should return appropriate validation errors in a consistent format
**Validates: Requirements 1.4**

**Property 4: Form Submission Success**
*For any* form with valid input data, submitting the form should successfully save the data and provide confirmation
**Validates: Requirements 1.5**

**Property 5: API Response Format Consistency**
*For any* API endpoint and request type, responses should follow the standardized format with consistent success/error indicators and appropriate HTTP status codes
**Validates: Requirements 2.1, 2.2, 2.3**

**Property 6: Authentication Consistency**
*For any* protected API endpoint, unauthorized requests should be consistently rejected with proper authentication errors
**Validates: Requirements 2.4**

**Property 7: Data Integrity Maintenance**
*For any* data operation that affects multiple related records, referential integrity should be maintained throughout the transaction
**Validates: Requirements 2.5**

**Property 8: Financial Record Auto-Creation**
*For any* business transaction (invoice creation, purchase order receipt, payment processing), corresponding financial records should be automatically created with proper linking
**Validates: Requirements 3.1, 3.2, 3.3, 3.5**

**Property 9: Animal Record Association Validation**
*For any* animal record creation, the system should require and validate either an individual animal or batch association
**Validates: Requirements 4.1**

**Property 10: Batch Record Propagation**
*For any* batch-level record creation, the data should be properly applied to all animals in the batch where appropriate
**Validates: Requirements 4.3**

**Property 11: Animal Performance Aggregation**
*For any* set of individual and batch animal data, performance aggregations should be mathematically accurate and consistent
**Validates: Requirements 4.4**

**Property 12: Animal Health History Maintenance**
*For any* animal health record, it should be properly linked to specific animals or batches and maintained in complete history
**Validates: Requirements 4.5**

**Property 13: Inventory Movement Auto-Creation**
*For any* business transaction affecting inventory (purchase order receipt, invoice creation, manual adjustment), appropriate inventory movements should be automatically created and stock levels updated correctly
**Validates: Requirements 5.1, 5.2, 5.3, 5.4**

**Property 14: Asset Depreciation Calculation**
*For any* asset with depreciation parameters, the depreciation schedule should be calculated correctly based on the asset's purchase cost, salvage value, and useful life
**Validates: Requirements 6.1**

**Property 15: Maintenance Task Creation**
*For any* scheduled maintenance, appropriate tasks should be created and maintenance history should be tracked
**Validates: Requirements 6.2**

**Property 16: Maintenance Completion Processing**
*For any* completed maintenance, asset condition should be updated and financial records should be created for associated costs
**Validates: Requirements 6.3**

**Property 17: Maintenance Alert Generation**
*For any* asset requiring maintenance based on schedule or condition, appropriate alerts should be generated
**Validates: Requirements 6.5**

**Property 18: System Event Task Creation**
*For any* system event that requires follow-up actions, relevant tasks should be automatically created with proper entity linking
**Validates: Requirements 7.1**

**Property 19: Task Assignment and Tracking**
*For any* task assignment, the task status should be properly tracked and maintained throughout its lifecycle
**Validates: Requirements 7.2**

**Property 20: Task Entity Linking**
*For any* task related to specific entities, proper links to animals, assets, or other records should be maintained
**Validates: Requirements 7.3**

**Property 21: Overdue Task Alert Generation**
*For any* task that becomes overdue, appropriate alerts should be generated
**Validates: Requirements 7.4**

**Property 22: Comprehensive Data Validation**
*For any* data input, the system should validate against business rules, data constraints, referential integrity, date logic, and quantity constraints
**Validates: Requirements 8.1, 8.2, 8.4, 8.5**

**Property 23: Financial Calculation Accuracy**
*For any* financial calculation involving monetary values, the results should be mathematically accurate without rounding errors
**Validates: Requirements 8.3**