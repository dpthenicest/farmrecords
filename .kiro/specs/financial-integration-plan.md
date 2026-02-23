# Financial Integration Implementation Plan

## Overview
Integrate financial records with invoices, purchase orders, and assets to create a seamless financial tracking system.

## Completed Steps

### 1. Schema Updates ✅
- Added `assetId` field to `InvoiceItem` model
- Added `assetId` and `animalBatchId` fields to `PurchaseOrderItem` model
- Added relationships from Asset and AnimalBatch to invoice/PO items
- Database schema synchronized

## Implementation Tasks

### 2. Service Layer Updates

#### A. Financial Record Service
- [x] Disable manual creation via API (keep service methods for internal use)
- [ ] Auto-create financial records when invoices are created/paid
- [ ] Auto-create financial records when purchase orders are received
- [ ] Link financial records to assets when applicable

#### B. Invoice Service
- [ ] Update `createInvoice` to auto-create financial record
- [ ] Update `markPaid` to create payment financial record
- [ ] Support assetId in invoice items
- [ ] Handle asset sales (reduce asset quantity or mark as sold)
- [ ] Update inventory movements for asset sales

#### C. Purchase Order Service
- [ ] Update `createPurchaseOrder` to support asset/animal batch creation
- [ ] Update `receivePurchaseOrder` to auto-create financial record
- [ ] Support assetId and animalBatchId in PO items
- [ ] Auto-create assets from PO items when received
- [ ] Auto-create/update animal batches from PO items when received

#### D. Asset Service
- [ ] Add method to create asset from purchase order
- [ ] Add method to sell asset via invoice
- [ ] Track asset lifecycle (purchased → active → sold)

#### E. Animal Batch Service
- [ ] Add method to create batch from purchase order
- [ ] Add method to sell batch via invoice
- [ ] Update quantity when sold

### 3. API Layer Updates

#### A. Financial Records API
- [ ] Disable POST endpoint (return error message)
- [ ] Keep GET endpoints for viewing records
- [ ] Add endpoint to view records by source (invoice/PO/asset)

#### B. Invoice API
- [ ] Update POST to accept assetId in items
- [ ] Update PUT to handle asset items
- [ ] Ensure financial record creation on invoice creation
- [ ] Ensure payment record creation on mark paid

#### C. Purchase Order API
- [ ] Update POST to accept assetId and animalBatchId in items
- [ ] Update PUT to handle asset/batch items
- [ ] Add option to auto-create assets/batches on receive
- [ ] Ensure financial record creation on receive

### 4. Form Updates

#### A. Invoice Form
- [ ] Add item type selector (Inventory/Asset/Animal Batch)
- [ ] Add asset selector when type is Asset
- [ ] Add animal batch selector when type is Animal Batch
- [ ] Show appropriate fields based on item type
- [ ] Simplify UX for quick asset sales

#### B. Purchase Order Form
- [ ] Add item type selector (Inventory/Asset/Animal Batch)
- [ ] Add option to create new asset from PO item
- [ ] Add option to create new animal batch from PO item
- [ ] Show appropriate fields based on item type
- [ ] Simplify UX for quick purchases

#### C. Asset Form
- [ ] Add "Create from Purchase Order" option
- [ ] Add "Sell via Invoice" quick action
- [ ] Link to related financial records

#### D. Animal Batch Form
- [ ] Add "Create from Purchase Order" option
- [ ] Add "Sell via Invoice" quick action
- [ ] Link to related financial records

### 5. UI/UX Enhancements

#### A. Simplified Workflows
- [ ] Quick asset sale from asset page
- [ ] Quick batch sale from animal batch page
- [ ] Quick asset purchase from PO creation
- [ ] Quick batch purchase from PO creation

#### B. Financial Record Display
- [ ] Show linked invoices/POs on financial record view
- [ ] Show linked assets/batches on financial record view
- [ ] Add filters for record source type

#### C. Asset/Batch Display
- [ ] Show purchase history (linked POs)
- [ ] Show sale history (linked invoices)
- [ ] Show financial impact

### 6. Business Logic

#### A. Validation Rules
- [ ] Prevent manual financial record creation via API
- [ ] Validate asset availability before sale
- [ ] Validate batch quantity before sale
- [ ] Ensure proper category assignment

#### B. Automatic Calculations
- [ ] Calculate asset depreciation
- [ ] Calculate batch cost per unit
- [ ] Update inventory values
- [ ] Track profit/loss on asset sales

#### C. Status Management
- [ ] Update asset status on sale
- [ ] Update batch status on sale
- [ ] Update financial record status
- [ ] Track payment status

## Implementation Order

1. ✅ Update schema and run migrations
2. Update service layer (Financial, Invoice, PO, Asset, AnimalBatch)
3. Update API endpoints
4. Update forms and UI components
5. Add validation and business logic
6. Test complete workflows
7. Update documentation

## Testing Checklist

- [ ] Create invoice with inventory item
- [ ] Create invoice with asset item
- [ ] Create invoice with animal batch item
- [ ] Verify financial record auto-creation
- [ ] Create PO with inventory item
- [ ] Create PO with asset creation
- [ ] Create PO with animal batch creation
- [ ] Receive PO and verify asset/batch creation
- [ ] Verify financial record auto-creation on PO receive
- [ ] Verify manual financial record creation is blocked
- [ ] Test asset sale workflow
- [ ] Test batch sale workflow
- [ ] Test asset purchase workflow
- [ ] Test batch purchase workflow
