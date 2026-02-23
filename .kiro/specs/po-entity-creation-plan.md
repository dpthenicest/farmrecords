# Purchase Order Entity Creation Feature

## Overview
Allow users to create Inventory, Assets, and Animal Batches directly from Purchase Order items when the PO is received. This creates a seamless workflow where purchasing automatically creates the entities and financial records.

## Current State
- PO items can link to existing inventory/assets/batches
- When PO is received, inventory quantities are updated
- Financial records are created when PO is received (if categoryId provided)

## Proposed Changes

### 1. Database Schema
**No changes needed** - Current schema already supports the relationships:
- `PurchaseOrderItem` has `inventoryId`, `assetId`, `animalBatchId` (all optional)
- When these are null, we can create new entities

### 2. Purchase Order Service Updates

#### New Method: `receivePurchaseOrderWithEntityCreation()`
When a PO is received, for each item:
- If `inventoryId` is null AND `createInventory` flag is true → Create new inventory item
- If `assetId` is null AND `createAsset` flag is true → Create new asset
- If `animalBatchId` is null AND `createBatch` flag is true → Create new animal batch
- Create financial record for the purchase
- Link the created entity to the PO item

#### Entity Creation Data Structure
```typescript
interface POItemWithEntityData {
  // Existing PO item fields
  itemDescription: string
  quantity: number
  unitPrice: number
  
  // Entity creation flags
  createInventory?: boolean
  createAsset?: boolean
  createBatch?: boolean
  
  // Inventory creation data (if createInventory = true)
  inventoryData?: {
    itemName: string
    itemCode: string
    description?: string
    unitOfMeasure: string
    reorderLevel: number
    sellingPrice: number
    location?: string
    categoryId?: number
    expiryDate?: string
  }
  
  // Asset creation data (if createAsset = true)
  assetData?: {
    assetName: string
    assetCode: string
    assetType: string
    description?: string
    salvageValue: number
    usefulLifeYears: number
    depreciationRate: number
    conditionStatus: string
    location?: string
    categoryId?: number
    warrantyInfo?: string
    insuranceInfo?: string
  }
  
  // Batch creation data (if createBatch = true)
  batchData?: {
    batchCode: string
    species: string
    breed?: string
    averageWeight?: number
    location?: string
    categoryId?: number
    notes?: string
  }
}
```

### 3. Purchase Order Form Updates

#### UI Changes
For each PO item, add a toggle/selector:
- "Link to existing" (current behavior)
- "Create new" (new behavior)

When "Create new" is selected, show inline form fields for the entity type:
- **Inventory**: Show essential fields (name, code, unit of measure, reorder level, selling price)
- **Asset**: Show essential fields (name, code, type, salvage value, useful life, depreciation rate)
- **Batch**: Show essential fields (batch code, species, breed, average weight)

#### Form State Management
```typescript
interface POItemFormState {
  mode: 'existing' | 'new'
  entityType: 'inventory' | 'asset' | 'batch'
  existingEntityId?: number
  newEntityData?: InventoryData | AssetData | BatchData
  itemDescription: string
  quantity: number
  unitPrice: number
}
```

### 4. Financial Record Integration

When PO is received with entity creation:
1. Create the entity (inventory/asset/batch)
2. Link entity to PO item
3. Create financial record with:
   - `transactionType`: "EXPENSE"
   - `amount`: item.totalPrice
   - `categoryId`: from entity or PO
   - `supplierId`: from PO
   - `purchaseOrderId`: PO id
   - `description`: "Purchase: [entity name]"
   - `referenceNumber`: PO number

### 5. API Updates

#### POST `/api/purchase-orders`
Add support for entity creation data in items array

#### PUT `/api/purchase-orders/[id]/receive`
Enhanced to handle entity creation:
```typescript
{
  categoryId: number, // For financial record
  items: [
    {
      itemId: number, // PO item ID
      createInventory?: boolean,
      inventoryData?: {...},
      createAsset?: boolean,
      assetData?: {...},
      createBatch?: boolean,
      batchData?: {...}
    }
  ]
}
```

## Implementation Steps

### Phase 1: Backend (Service Layer)
1. ✅ Update PurchaseOrderService with entity creation logic
2. ✅ Add validation for entity creation data
3. ✅ Integrate with inventory/asset/batch services
4. ✅ Ensure financial records are created correctly
5. ✅ Add comprehensive error handling

### Phase 2: Backend (API Layer)
1. ✅ Update POST `/api/purchase-orders` to accept entity data
2. ✅ Update PUT `/api/purchase-orders/[id]/receive` for entity creation
3. ✅ Add validation middleware
4. ✅ Update response types

### Phase 3: Frontend (Form)
1. ✅ Add mode selector (existing vs new) for each item
2. ✅ Create inline entity creation forms
3. ✅ Add form validation
4. ✅ Update submission logic
5. ✅ Add loading states and error handling

### Phase 4: Testing
1. ✅ Unit tests for service methods
2. ✅ Integration tests for API endpoints
3. ✅ E2E tests for form submission
4. ✅ Test financial record creation

## Benefits

1. **Streamlined Workflow**: Create entities directly from purchase orders
2. **Data Consistency**: Automatic linking between POs, entities, and financial records
3. **Reduced Steps**: No need to create inventory/assets/batches separately
4. **Better Tracking**: Clear audit trail from purchase to entity creation
5. **Financial Accuracy**: Automatic financial record creation ensures all purchases are tracked

## Considerations

1. **Validation**: Ensure all required fields are provided for entity creation
2. **Error Handling**: What happens if entity creation fails but PO is received?
3. **Rollback**: Should we rollback PO receipt if entity creation fails?
4. **Permissions**: Same permissions as creating entities directly
5. **UI Complexity**: Form will be more complex with inline entity creation

## Alternative Approach (Simpler)

Instead of inline forms, use a two-step process:
1. Receive PO (marks as RECEIVED)
2. For each item without an entity, show "Create Entity" button
3. Opens modal with full entity creation form
4. On save, links entity to PO item and creates financial record

This is simpler but requires more clicks.
