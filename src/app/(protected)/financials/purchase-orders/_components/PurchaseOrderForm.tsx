"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { useSuppliers } from "@/hooks/useSuppliers"
import { useInventory } from "@/hooks/useInventory"
import { useAssets } from "@/hooks/useAssets"
import { useAnimalBatches } from "@/hooks/useAnimalBatches"
import { useSalesExpenseCategories } from "@/hooks/useSalesExpenseCategories"
import { useCreatePurchaseOrder, useUpdatePurchaseOrder } from "@/hooks/usePurchaseOrders"

interface PurchaseOrderItem {
  id?: number
  inventoryId?: number
  assetId?: number
  animalBatchId?: number
  itemDescription: string
  quantity: number
  unitPrice: number
  totalPrice: number
  // Entity creation mode
  mode?: 'existing' | 'new'
  entityType?: 'inventory' | 'asset' | 'batch'
  // Entity creation data
  newEntityData?: {
    // Inventory fields
    itemName?: string
    itemCode?: string
    description?: string
    unitOfMeasure?: string
    reorderLevel?: number
    sellingPrice?: number
    location?: string
    categoryId?: number
    // Asset fields
    assetName?: string
    assetCode?: string
    assetType?: string
    salvageValue?: number
    usefulLifeYears?: number
    depreciationRate?: number
    conditionStatus?: string
    warrantyInfo?: string
    insuranceInfo?: string
    // Batch fields
    batchCode?: string
    species?: string
    breed?: string
    averageWeight?: number
    notes?: string
  }
}

interface PurchaseOrderFormProps {
  purchaseOrder?: any
  onClose: () => void
  onSaved: () => void
}

export function PurchaseOrderForm({
  purchaseOrder,
  onClose,
  onSaved,
}: PurchaseOrderFormProps) {
  const [form, setForm] = React.useState({
    supplierId: purchaseOrder?.supplierId ? String(purchaseOrder.supplierId) : "",
    status: purchaseOrder?.status || "DRAFT",
    notes: purchaseOrder?.notes || "",
    categoryId: "", // For financial record category
  })

  const [taxRate, setTaxRate] = React.useState<number>(
    purchaseOrder?.taxAmount && purchaseOrder?.subtotal 
      ? (Number(purchaseOrder.taxAmount) / Number(purchaseOrder.subtotal)) * 100 
      : 8 // Default 8% VAT
  )

  const [orderDate, setOrderDate] = React.useState<Date | undefined>(
    purchaseOrder?.orderDate ? new Date(purchaseOrder.orderDate) : new Date()
  )
  const [expectedDeliveryDate, setExpectedDeliveryDate] = React.useState<Date | undefined>(
    purchaseOrder?.expectedDeliveryDate ? new Date(purchaseOrder.expectedDeliveryDate) : 
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days from now
  )
  const [actualDeliveryDate, setActualDeliveryDate] = React.useState<Date | undefined>(
    purchaseOrder?.actualDeliveryDate ? new Date(purchaseOrder.actualDeliveryDate) : undefined
  )

  const [items, setItems] = React.useState<PurchaseOrderItem[]>(
    purchaseOrder?.items?.map((item: any) => ({
      id: item.id,
      inventoryId: item.inventoryId,
      assetId: item.assetId,
      animalBatchId: item.animalBatchId,
      itemDescription: item.itemDescription,
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      totalPrice: Number(item.totalPrice) || 0,
      mode: 'existing',
      entityType: item.inventoryId ? 'inventory' : item.assetId ? 'asset' : item.animalBatchId ? 'batch' : undefined,
    })) || [{
      itemDescription: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      mode: 'new',
      entityType: 'inventory',
      newEntityData: {}
    }]
  )

  const [supplierSearch, setSupplierSearch] = React.useState(
    purchaseOrder?.supplier?.supplierName || ""
  )
  const [showSupplierDropdown, setShowSupplierDropdown] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Hooks
  const { suppliers: allSuppliers } = useSuppliers({ limit: 100 })
  const { items: inventoryItems, loading: inventoryLoading, error: inventoryError } = useInventory({ limit: 100 })
  const { assets, loading: assetsLoading, error: assetsError } = useAssets({ limit: 100 })
  const { batches, loading: batchesLoading, error: batchesError } = useAnimalBatches({ limit: 100 })
  const { categories: expenseCategories, loading: categoriesLoading } = useSalesExpenseCategories({ 
    categoryType: "EXPENSE", 
    isActive: true, 
    limit: 100 
  })
  const { createOrder, loading: creating } = useCreatePurchaseOrder()
  const { updateOrder, loading: updating } = useUpdatePurchaseOrder()

  // Filter suppliers based on search
  const suppliers = React.useMemo(() => {
    if (!supplierSearch.trim()) return allSuppliers
    return allSuppliers.filter(supplier => 
      supplier.supplierName.toLowerCase().includes(supplierSearch.toLowerCase()) ||
      supplier.supplierCode.toLowerCase().includes(supplierSearch.toLowerCase())
    )
  }, [allSuppliers, supplierSearch])

  const selectedSupplier = suppliers.find(s => s.id === Number(form.supplierId))

  // Handle click outside to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSupplierDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleSupplierSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setSupplierSearch(e.target.value)
    setShowSupplierDropdown(true)
  }

  function selectSupplier(supplier: any) {
    setForm({ ...form, supplierId: String(supplier.id) })
    setSupplierSearch(supplier.supplierName)
    setShowSupplierDropdown(false)
  }

  function addItem() {
    setItems([...items, {
      itemDescription: "",
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      mode: 'new',
      entityType: 'inventory',
      newEntityData: {}
    }])
  }

  function removeItem(index: number) {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  function updateItem(index: number, field: keyof PurchaseOrderItem, value: any) {
    const newItems = [...items]
    
    if (field === 'quantity' || field === 'unitPrice') {
      const numericValue = Number(value) || 0
      newItems[index] = { ...newItems[index], [field]: numericValue }
      
      const quantity = field === 'quantity' ? numericValue : newItems[index].quantity
      const unitPrice = field === 'unitPrice' ? numericValue : newItems[index].unitPrice
      newItems[index].totalPrice = quantity * unitPrice
    } else {
      newItems[index] = { ...newItems[index], [field]: value }
    }
    
    setItems(newItems)
  }

  function updateItemMode(index: number, mode: 'existing' | 'new') {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      mode,
      inventoryId: undefined,
      assetId: undefined,
      animalBatchId: undefined,
      entityType: mode === 'new' ? 'inventory' : undefined,
      newEntityData: mode === 'new' ? { conditionStatus: 'GOOD' } : undefined
    }
    setItems(newItems)
  }

  function updateItemEntityType(index: number, entityType: 'inventory' | 'asset' | 'batch') {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      entityType,
      inventoryId: undefined,
      assetId: undefined,
      animalBatchId: undefined,
      newEntityData: { conditionStatus: 'GOOD' }
    }
    setItems(newItems)
  }

  function updateNewEntityData(index: number, field: string, value: any) {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      newEntityData: {
        ...newItems[index].newEntityData,
        [field]: value
      }
    }
    setItems(newItems)
  }

  function selectInventoryItem(index: number, inventoryId: number) {
    const inventoryItem = inventoryItems.find(item => item.id === inventoryId)
    if (inventoryItem) {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        inventoryId: inventoryId,
        assetId: undefined,
        animalBatchId: undefined,
        itemDescription: inventoryItem.itemName,
        unitPrice: Number(inventoryItem.unitCost) || 0,
      }
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice
      setItems(newItems)
    }
  }

  function selectAsset(index: number, assetId: number) {
    const asset = assets.find(a => a.id === assetId)
    if (asset) {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        assetId: assetId,
        inventoryId: undefined,
        animalBatchId: undefined,
        itemDescription: `${asset.assetName} (${asset.assetCode})`,
        unitPrice: Number(asset.purchaseCost) || 0,
      }
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice
      setItems(newItems)
    }
  }

  function selectAnimalBatch(index: number, batchId: number) {
    const batch = batches.find(b => b.id === batchId)
    if (batch) {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        animalBatchId: batchId,
        inventoryId: undefined,
        assetId: undefined,
        itemDescription: `${batch.species} - ${batch.breed} (${batch.batchCode})`,
        unitPrice: 0, // User needs to enter price for new batch
      }
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice
      setItems(newItems)
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const totalAmount = subtotal + taxAmount

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!form.supplierId) {
      alert("Please select a supplier")
      return
    }

    if (!orderDate || !expectedDeliveryDate) {
      alert("Order Date and Expected Delivery Date are required")
      return
    }

    if (items.length === 0 || items.some(item => !item.itemDescription || item.quantity <= 0 || item.unitPrice < 0)) {
      alert("Please add at least one valid item with positive quantity and non-negative unit price")
      return
    }

    // Validate new entity data
    const hasNewEntities = items.some(item => item.mode === 'new')
    if (hasNewEntities && !form.categoryId) {
      alert("Please select an expense category for financial record creation")
      return
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      if (item.mode === 'new') {
        if (item.entityType === 'inventory') {
          if (!item.newEntityData?.itemName || !item.newEntityData?.itemCode || !item.newEntityData?.unitOfMeasure) {
            alert(`Item ${i + 1}: Please fill in required inventory fields (Item Name, Item Code, Unit of Measure)`)
            return
          }
        } else if (item.entityType === 'asset') {
          if (!item.newEntityData?.assetName || !item.newEntityData?.assetCode || !item.newEntityData?.assetType) {
            alert(`Item ${i + 1}: Please fill in required asset fields (Asset Name, Asset Code, Asset Type)`)
            return
          }
        } else if (item.entityType === 'batch') {
          if (!item.newEntityData?.batchCode || !item.newEntityData?.species) {
            alert(`Item ${i + 1}: Please fill in required batch fields (Batch Code, Species)`)
            return
          }
        }
      }
    }

    const poData = {
      supplierId: Number(form.supplierId),
      orderDate: orderDate.toISOString(),
      expectedDeliveryDate: expectedDeliveryDate.toISOString(),
      actualDeliveryDate: actualDeliveryDate?.toISOString(),
      status: form.status,
      notes: form.notes || undefined,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      taxRate: Number(taxRate) || 0,
      items: items.map(item => {
        const baseItem = {
          itemDescription: item.itemDescription,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
        }

        // If linking to existing entity
        if (item.mode === 'existing') {
          return {
            ...baseItem,
            inventoryId: item.inventoryId || undefined,
            assetId: item.assetId || undefined,
            animalBatchId: item.animalBatchId || undefined,
          }
        }

        // If creating new entity - include entity creation data
        if (item.mode === 'new' && item.entityType && item.newEntityData) {
          return {
            ...baseItem,
            createEntity: true,
            entityType: item.entityType,
            entityData: item.newEntityData
          }
        }

        return baseItem
      })
    }

    try {
      if (purchaseOrder) {
        await updateOrder(purchaseOrder.id, poData)
      } else {
        await createOrder(poData)
      }
      onSaved()
      onClose()
    } catch (error) {
      console.error("Failed to save purchase order:", error)
      alert("Failed to save purchase order. Please try again.")
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Supplier Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Supplier *</label>
          <div className="relative" ref={dropdownRef}>
            <Input
              placeholder="Search suppliers or click to see all..."
              value={supplierSearch}
              onChange={handleSupplierSearch}
              onFocus={() => setShowSupplierDropdown(true)}
            />
            {showSupplierDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {suppliers.length > 0 ? (
                  suppliers.map((supplier) => (
                    <div
                      key={supplier.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectSupplier(supplier)}
                    >
                      <div className="font-medium">{supplier.supplierName}</div>
                      <div className="text-sm text-gray-500">{supplier.supplierCode} • {supplier.supplierType}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-center text-gray-500">
                    {allSuppliers.length === 0 ? "No suppliers available" : "No suppliers match your search"}
                  </div>
                )}
              </div>
            )}
          </div>
          {selectedSupplier && (
            <div className="text-sm text-gray-600">
              Selected: {selectedSupplier.supplierName} ({selectedSupplier.supplierCode})
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Order Date *</label>
            <DatePicker value={orderDate} onChange={setOrderDate} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Expected Delivery *</label>
            <DatePicker value={expectedDeliveryDate} onChange={setExpectedDeliveryDate} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Actual Delivery</label>
            <DatePicker value={actualDeliveryDate} onChange={setActualDeliveryDate} />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="DRAFT">Draft</option>
            <option value="SENT">Sent</option>
            <option value="RECEIVED">Received</option>
            <option value="PARTIAL">Partial</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Expense Category - For Financial Record Creation */}
        {(form.status === 'RECEIVED' || items.some(item => item.mode === 'new')) && (
          <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="text-sm font-medium text-blue-900">
              Expense Category {items.some(item => item.mode === 'new') ? '*' : ''} (For financial record)
            </label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required={items.some(item => item.mode === 'new')}
              disabled={categoriesLoading}
              className="w-full rounded border border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
            >
              <option value="">
                {categoriesLoading ? "Loading categories..." : "Select expense category..."}
              </option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
            <p className="text-xs text-blue-700">
              {items.some(item => item.mode === 'new') 
                ? "Financial records will be automatically created for new entities when this purchase order is saved."
                : "A financial record will be automatically created when this purchase order is marked as received."}
            </p>
          </div>
        )}

        {/* Purchase Order Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Purchase Order Items *</label>
            <Button type="button" onClick={addItem} variant="secondary" size="sm">
              Add Item
            </Button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Item {index + 1}</span>
                {items.length > 1 && (
                  <Button
                    type="button"
                    onClick={() => removeItem(index)}
                    variant="secondary"
                    size="sm"
                  >
                    Remove
                  </Button>
                )}
              </div>

              {/* Mode Selection: Link Existing vs Create New */}
              <div className="flex gap-2 p-3 bg-gray-50 rounded">
                <button
                  type="button"
                  onClick={() => updateItemMode(index, 'existing')}
                  className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                    item.mode === 'existing'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Link to Existing
                </button>
                <button
                  type="button"
                  onClick={() => updateItemMode(index, 'new')}
                  className={`flex-1 py-2 px-4 rounded text-sm font-medium transition-colors ${
                    item.mode === 'new'
                      ? 'bg-green-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Create New
                </button>
              </div>

              {/* Entity Type Selection (for Create New mode) */}
              {item.mode === 'new' && (
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => updateItemEntityType(index, 'inventory')}
                    className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
                      item.entityType === 'inventory'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    📦 Inventory
                  </button>
                  <button
                    type="button"
                    onClick={() => updateItemEntityType(index, 'asset')}
                    className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
                      item.entityType === 'asset'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    🏗️ Asset
                  </button>
                  <button
                    type="button"
                    onClick={() => updateItemEntityType(index, 'batch')}
                    className={`py-2 px-3 rounded text-sm font-medium transition-colors ${
                      item.entityType === 'batch'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    🐔 Animal Batch
                  </button>
                </div>
              )}

              {/* Link to Existing Entity */}
              {item.mode === 'existing' && (
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-600">From Inventory</label>
                    <select
                      value={item.inventoryId || ""}
                      onChange={(e) => selectInventoryItem(index, Number(e.target.value))}
                      disabled={inventoryLoading}
                      className="w-full rounded border border-gray-300 p-2 text-sm"
                    >
                      <option value="">Select inventory...</option>
                      {inventoryItems.map((invItem) => (
                        <option key={invItem.id} value={invItem.id}>
                          {invItem.itemName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">From Assets</label>
                    <select
                      value={item.assetId || ""}
                      onChange={(e) => selectAsset(index, Number(e.target.value))}
                      disabled={assetsLoading}
                      className="w-full rounded border border-gray-300 p-2 text-sm"
                    >
                      <option value="">Select asset...</option>
                      {assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.assetName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">From Animal Batch</label>
                    <select
                      value={item.animalBatchId || ""}
                      onChange={(e) => selectAnimalBatch(index, Number(e.target.value))}
                      disabled={batchesLoading}
                      className="w-full rounded border border-gray-300 p-2 text-sm"
                    >
                      <option value="">Select batch...</option>
                      {batches.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.species} - {batch.breed}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Create New Inventory Fields */}
              {item.mode === 'new' && item.entityType === 'inventory' && (
                <div className="space-y-3 p-4 bg-purple-50 rounded border border-purple-200">
                  <h4 className="text-sm font-semibold text-purple-900">New Inventory Item Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-700">Item Name *</label>
                      <Input
                        value={item.newEntityData?.itemName || ""}
                        onChange={(e) => updateNewEntityData(index, 'itemName', e.target.value)}
                        placeholder="e.g., Premium Chicken Feed"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-700">Item Code *</label>
                      <Input
                        value={item.newEntityData?.itemCode || ""}
                        onChange={(e) => updateNewEntityData(index, 'itemCode', e.target.value)}
                        placeholder="e.g., INV-001"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-700">Unit of Measure *</label>
                      <Input
                        value={item.newEntityData?.unitOfMeasure || ""}
                        onChange={(e) => updateNewEntityData(index, 'unitOfMeasure', e.target.value)}
                        placeholder="e.g., kg, pieces"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-700">Reorder Level</label>
                      <Input
                        type="number"
                        value={item.newEntityData?.reorderLevel || ""}
                        onChange={(e) => updateNewEntityData(index, 'reorderLevel', Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-700">Selling Price (₦)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.newEntityData?.sellingPrice || ""}
                        onChange={(e) => updateNewEntityData(index, 'sellingPrice', Number(e.target.value))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-700">Location</label>
                    <Input
                      value={item.newEntityData?.location || ""}
                      onChange={(e) => updateNewEntityData(index, 'location', e.target.value)}
                      placeholder="e.g., Warehouse A"
                    />
                  </div>
                </div>
              )}

              {/* Create New Asset Fields */}
              {item.mode === 'new' && item.entityType === 'asset' && (
                <div className="space-y-3 p-4 bg-purple-50 rounded border border-purple-200">
                  <h4 className="text-sm font-semibold text-purple-900">New Asset Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-700">Asset Name *</label>
                      <Input
                        value={item.newEntityData?.assetName || ""}
                        onChange={(e) => updateNewEntityData(index, 'assetName', e.target.value)}
                        placeholder="e.g., Tractor"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-700">Asset Code *</label>
                      <Input
                        value={item.newEntityData?.assetCode || ""}
                        onChange={(e) => updateNewEntityData(index, 'assetCode', e.target.value)}
                        placeholder="e.g., AST-001"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-700">Asset Type *</label>
                      <select
                        value={item.newEntityData?.assetType || ""}
                        onChange={(e) => updateNewEntityData(index, 'assetType', e.target.value)}
                        className="w-full rounded border p-2 text-sm"
                        required
                      >
                        <option value="">Select type</option>
                        <option value="INFRASTRUCTURE">Infrastructure</option>
                        <option value="EQUIPMENT">Equipment</option>
                        <option value="VEHICLES">Vehicles</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-700">Condition Status *</label>
                      <select
                        value={item.newEntityData?.conditionStatus || "GOOD"}
                        onChange={(e) => updateNewEntityData(index, 'conditionStatus', e.target.value)}
                        className="w-full rounded border p-2 text-sm"
                        required
                      >
                        <option value="EXCELLENT">Excellent</option>
                        <option value="GOOD">Good</option>
                        <option value="FAIR">Fair</option>
                        <option value="POOR">Poor</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-700">Salvage Value (₦)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.newEntityData?.salvageValue || ""}
                        onChange={(e) => updateNewEntityData(index, 'salvageValue', Number(e.target.value))}
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-700">Useful Life (Years)</label>
                      <Input
                        type="number"
                        value={item.newEntityData?.usefulLifeYears || ""}
                        onChange={(e) => updateNewEntityData(index, 'usefulLifeYears', Number(e.target.value))}
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-700">Depreciation Rate (%)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.newEntityData?.depreciationRate || ""}
                        onChange={(e) => updateNewEntityData(index, 'depreciationRate', Number(e.target.value))}
                        placeholder="20"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-700">Location</label>
                    <Input
                      value={item.newEntityData?.location || ""}
                      onChange={(e) => updateNewEntityData(index, 'location', e.target.value)}
                      placeholder="e.g., Farm Section A"
                    />
                  </div>
                </div>
              )}

              {/* Create New Animal Batch Fields */}
              {item.mode === 'new' && item.entityType === 'batch' && (
                <div className="space-y-3 p-4 bg-purple-50 rounded border border-purple-200">
                  <h4 className="text-sm font-semibold text-purple-900">New Animal Batch Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-700">Batch Code *</label>
                      <Input
                        value={item.newEntityData?.batchCode || ""}
                        onChange={(e) => updateNewEntityData(index, 'batchCode', e.target.value)}
                        placeholder="e.g., BATCH-2024-001"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-700">Species *</label>
                      <select
                        value={item.newEntityData?.species || ""}
                        onChange={(e) => updateNewEntityData(index, 'species', e.target.value)}
                        className="w-full rounded border p-2 text-sm"
                        required
                      >
                        <option value="">Select species</option>
                        <option value="chicken">Chicken</option>
                        <option value="fish">Fish</option>
                        <option value="goat">Goat</option>
                        <option value="cattle">Cattle</option>
                        <option value="pig">Pig</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-gray-700">Breed</label>
                      <Input
                        value={item.newEntityData?.breed || ""}
                        onChange={(e) => updateNewEntityData(index, 'breed', e.target.value)}
                        placeholder="e.g., Broiler, Tilapia"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-700">Average Weight (kg)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.newEntityData?.averageWeight || ""}
                        onChange={(e) => updateNewEntityData(index, 'averageWeight', Number(e.target.value))}
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-gray-700">Location</label>
                    <Input
                      value={item.newEntityData?.location || ""}
                      onChange={(e) => updateNewEntityData(index, 'location', e.target.value)}
                      placeholder="e.g., Pond 1, Coop A"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-700">Notes</label>
                    <textarea
                      value={item.newEntityData?.notes || ""}
                      onChange={(e) => updateNewEntityData(index, 'notes', e.target.value)}
                      className="w-full rounded border p-2 text-sm min-h-[60px]"
                      placeholder="Additional notes..."
                    />
                  </div>
                </div>
              )}

              {/* Common Item Fields: Description, Quantity, Unit Price */}
              <div className="grid grid-cols-4 gap-3 pt-3 border-t">
                <div className="col-span-2">
                  <label className="text-xs text-gray-600">Description *</label>
                  <Input
                    placeholder="Item description"
                    value={item.itemDescription}
                    onChange={(e) => updateItem(index, 'itemDescription', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Quantity *</label>
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={item.quantity || ""}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Unit Price (₦) *</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice || ""}
                    onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {item.quantity.toLocaleString()} × ₦{item.unitPrice.toLocaleString()} = 
                </div>
                <div className="text-lg font-semibold text-green-600">
                  ₦{item.totalPrice.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tax Configuration */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tax Rate (Optional)</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={taxRate || ""}
              onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
              className="w-24"
            />
            <span className="text-sm text-gray-600">%</span>
          </div>
        </div>

        {/* Purchase Order Totals */}
        <div className="bg-gray-50 p-6 rounded-lg space-y-3">
          <div className="text-lg font-semibold text-gray-800 mb-4">Purchase Order Summary</div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Subtotal:</span>
            <span className="font-medium">₦{subtotal.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Tax ({taxRate}%):</span>
            <span className="font-medium">₦{taxAmount.toLocaleString()}</span>
          </div>
          
          <div className="border-t border-gray-300 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">₦{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <textarea
            name="notes"
            placeholder="Additional notes..."
            value={form.notes}
            onChange={handleChange}
            className="w-full rounded border p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? "Saving..." : (purchaseOrder ? "Update Purchase Order" : "Create Purchase Order")}
          </Button>
        </div>
      </form>
    </div>
  )
}
