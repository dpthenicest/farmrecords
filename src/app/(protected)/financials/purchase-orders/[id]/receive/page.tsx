"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useSalesExpenseCategories } from "@/hooks/useSalesExpenseCategories"

interface POItem {
  id: number
  inventoryId?: number
  assetId?: number
  animalBatchId?: number
  itemDescription: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface PurchaseOrder {
  id: number
  poNumber: string
  supplier: { id: number; supplierName: string }
  orderDate: string
  expectedDeliveryDate: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  status: string
  items: POItem[]
}

export default function ReceivePurchaseOrderPage() {
  const params = useParams()
  const router = useRouter()
  const poId = Number(params.id)

  const [po, setPO] = React.useState<PurchaseOrder | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [receiving, setReceiving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Entity creation state
  const [creatingEntityFor, setCreatingEntityFor] = React.useState<{
    itemId: number
    type: "inventory" | "asset" | "batch"
  } | null>(null)
  const [createdEntities, setCreatedEntities] = React.useState<Map<number, any>>(new Map())

  // Category for financial record
  const [categoryId, setCategoryId] = React.useState<string>("")
  const { categories: expenseCategories, loading: categoriesLoading } = useSalesExpenseCategories({ 
    categoryType: "EXPENSE", 
    isActive: true, 
    limit: 100 
  })

  // Fetch PO details
  React.useEffect(() => {
    async function fetchPO() {
      try {
        const res = await fetch(`/api/purchase-orders/${poId}`, {
          credentials: "include"
        })
        if (!res.ok) throw new Error("Failed to fetch purchase order")
        const json = await res.json()
        setPO(json.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchPO()
  }, [poId])

  const handleEntityCreated = async (itemId: number, entityType: string, entityData: any) => {
    // Store the created entity data
    const newCreatedEntities = new Map(createdEntities)
    newCreatedEntities.set(itemId, {
      type: entityType,
      data: entityData
    })
    setCreatedEntities(newCreatedEntities)
    setCreatingEntityFor(null)
  }

  const handleReceivePO = async () => {
    if (!categoryId) {
      alert("Please select an expense category for financial record creation")
      return
    }

    setReceiving(true)
    setError(null)

    try {
      // Prepare entity creation data
      const items = Array.from(createdEntities.entries()).map(([itemId, entity]) => {
        const poItem = po?.items.find(i => i.id === itemId)
        if (!poItem) return null

        const baseData = {
          itemId,
          createInventory: entity.type === "inventory",
          createAsset: entity.type === "asset",
          createBatch: entity.type === "batch"
        }

        if (entity.type === "inventory") {
          return {
            ...baseData,
            inventoryData: {
              ...entity.data,
              // These will be set from PO item
              currentQuantity: poItem.quantity,
              unitCost: poItem.unitPrice
            }
          }
        } else if (entity.type === "asset") {
          return {
            ...baseData,
            assetData: {
              ...entity.data,
              purchaseCost: poItem.unitPrice,
              purchaseDate: po?.orderDate
            }
          }
        } else if (entity.type === "batch") {
          return {
            ...baseData,
            batchData: {
              ...entity.data,
              initialQuantity: poItem.quantity,
              totalCost: poItem.totalPrice,
              batchStartDate: po?.orderDate
            }
          }
        }

        return null
      }).filter(Boolean)

      // Call receive API
      const res = await fetch(`/api/purchase-orders/${poId}/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          categoryId: Number(categoryId),
          items
        })
      })

      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || "Failed to receive purchase order")
      }

      alert("Purchase order received successfully!")
      router.push("/financials/purchase-orders")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setReceiving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading purchase order...</div>
      </div>
    )
  }

  if (error && !po) {
    return (
      <div className="p-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    )
  }

  if (!po) {
    return (
      <div className="p-8">
        <div className="text-center">Purchase order not found</div>
      </div>
    )
  }

  if (po.status === "RECEIVED") {
    return (
      <div className="p-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Purchase Order Already Received</h2>
          <p className="text-gray-600 mb-4">
            This purchase order has already been received.
          </p>
          <Button onClick={() => router.push("/financials/purchase-orders")}>
            Back to Purchase Orders
          </Button>
        </Card>
      </div>
    )
  }

  const itemsNeedingEntities = po.items.filter(
    item => !item.inventoryId && !item.assetId && !item.animalBatchId
  )

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Receive Purchase Order</h1>
        <p className="text-gray-600">PO Number: {po.poNumber}</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          {error}
        </div>
      )}

      {/* PO Summary */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Purchase Order Details</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm text-gray-600">Supplier:</span>
            <div className="font-medium">{po.supplier.supplierName}</div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Order Date:</span>
            <div className="font-medium">{new Date(po.orderDate).toLocaleDateString()}</div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Expected Delivery:</span>
            <div className="font-medium">{new Date(po.expectedDeliveryDate).toLocaleDateString()}</div>
          </div>
          <div>
            <span className="text-sm text-gray-600">Total Amount:</span>
            <div className="font-medium text-lg">₦{Number(po.totalAmount).toLocaleString()}</div>
          </div>
        </div>
      </Card>

      {/* Category Selection */}
      <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
        <h2 className="text-lg font-semibold mb-2 text-blue-900">Expense Category *</h2>
        <p className="text-sm text-blue-700 mb-4">
          Select the expense category for financial record creation
        </p>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
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
      </Card>

      {/* Items List */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Purchase Order Items</h2>
        <div className="space-y-4">
          {po.items.map((item) => {
            const hasEntity = item.inventoryId || item.assetId || item.animalBatchId
            const entityCreated = createdEntities.has(item.id)

            return (
              <div key={item.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-medium">{item.itemDescription}</h3>
                    <div className="text-sm text-gray-600 mt-1">
                      Quantity: {item.quantity} × ₦{Number(item.unitPrice).toLocaleString()} = 
                      <span className="font-medium ml-1">₦{Number(item.totalPrice).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {hasEntity && (
                      <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded text-sm">
                        ✓ Linked to existing {item.inventoryId ? "inventory" : item.assetId ? "asset" : "batch"}
                      </span>
                    )}
                    {!hasEntity && entityCreated && (
                      <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                        ✓ Entity created
                      </span>
                    )}
                    {!hasEntity && !entityCreated && (
                      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-sm">
                        ⚠ No entity linked
                      </span>
                    )}
                  </div>
                </div>

                {!hasEntity && !entityCreated && (
                  <div className="mt-3 pt-3 border-t">
                    <p className="text-sm text-gray-600 mb-3">
                      Create an entity for this purchase:
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCreatingEntityFor({ itemId: item.id, type: "inventory" })}
                      >
                        Create Inventory
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCreatingEntityFor({ itemId: item.id, type: "asset" })}
                      >
                        Create Asset
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCreatingEntityFor({ itemId: item.id, type: "batch" })}
                      >
                        Create Animal Batch
                      </Button>
                    </div>
                  </div>
                )}

                {entityCreated && (
                  <div className="mt-3 pt-3 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        {createdEntities.get(item.id)?.type === "inventory" && "Inventory item will be created"}
                        {createdEntities.get(item.id)?.type === "asset" && "Asset will be created"}
                        {createdEntities.get(item.id)?.type === "batch" && "Animal batch will be created"}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const newMap = new Map(createdEntities)
                          newMap.delete(item.id)
                          setCreatedEntities(newMap)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>

      {/* Summary */}
      {itemsNeedingEntities.length > 0 && (
        <Card className="p-6 mb-6 bg-yellow-50 border-yellow-200">
          <h3 className="font-semibold text-yellow-900 mb-2">⚠ Action Required</h3>
          <p className="text-sm text-yellow-700">
            {itemsNeedingEntities.length} item(s) don't have entities linked. 
            You can create entities for them now, or receive the PO without creating entities.
          </p>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={() => router.push("/financials/purchase-orders")}
          disabled={receiving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleReceivePO}
          disabled={receiving || !categoryId}
        >
          {receiving ? "Receiving..." : "Receive Purchase Order"}
        </Button>
      </div>

      {/* Entity Creation Dialogs */}
      {creatingEntityFor && (
        <Dialog open={!!creatingEntityFor} onOpenChange={() => setCreatingEntityFor(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Create {creatingEntityFor.type === "inventory" ? "Inventory Item" : 
                        creatingEntityFor.type === "asset" ? "Asset" : "Animal Batch"}
              </DialogTitle>
            </DialogHeader>
            
            {creatingEntityFor.type === "inventory" && (
              <InventoryCreationForm
                itemId={creatingEntityFor.itemId}
                poItem={po.items.find(i => i.id === creatingEntityFor.itemId)!}
                onSave={(data) => handleEntityCreated(creatingEntityFor.itemId, "inventory", data)}
                onCancel={() => setCreatingEntityFor(null)}
              />
            )}
            
            {creatingEntityFor.type === "asset" && (
              <AssetCreationForm
                itemId={creatingEntityFor.itemId}
                poItem={po.items.find(i => i.id === creatingEntityFor.itemId)!}
                onSave={(data) => handleEntityCreated(creatingEntityFor.itemId, "asset", data)}
                onCancel={() => setCreatingEntityFor(null)}
              />
            )}
            
            {creatingEntityFor.type === "batch" && (
              <BatchCreationForm
                itemId={creatingEntityFor.itemId}
                poItem={po.items.find(i => i.id === creatingEntityFor.itemId)!}
                onSave={(data) => handleEntityCreated(creatingEntityFor.itemId, "batch", data)}
                onCancel={() => setCreatingEntityFor(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

// Simplified inline forms that capture data without saving

function InventoryCreationForm({ 
  poItem, 
  onSave, 
  onCancel 
}: { 
  poItem: POItem
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [form, setForm] = React.useState({
    itemName: poItem.itemDescription,
    itemCode: "",
    description: "",
    unitOfMeasure: "",
    reorderLevel: "0",
    sellingPrice: String(Number(poItem.unitPrice) * 1.3), // 30% markup default
    location: "",
    categoryId: "",
  })

  const { categories, loading: categoriesLoading } = useSalesExpenseCategories({ 
    limit: 100,
    isActive: true 
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.itemName || !form.itemCode || !form.unitOfMeasure) {
      alert("Please fill in all required fields")
      return
    }
    onSave({
      itemName: form.itemName,
      itemCode: form.itemCode,
      description: form.description || null,
      unitOfMeasure: form.unitOfMeasure,
      reorderLevel: Number(form.reorderLevel) || 0,
      sellingPrice: Number(form.sellingPrice) || 0,
      location: form.location || null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
        <strong>From PO:</strong> Quantity: {poItem.quantity}, Unit Cost: ₦{Number(poItem.unitPrice).toLocaleString()}
      </div>

      <div>
        <label className="text-sm font-medium">Item Name *</label>
        <Input
          value={form.itemName}
          onChange={(e) => setForm({ ...form, itemName: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Item Code *</label>
        <Input
          value={form.itemCode}
          onChange={(e) => setForm({ ...form, itemCode: e.target.value })}
          placeholder="e.g., INV-001"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded border p-2 min-h-[60px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Unit of Measure *</label>
          <Input
            value={form.unitOfMeasure}
            onChange={(e) => setForm({ ...form, unitOfMeasure: e.target.value })}
            placeholder="e.g., kg, pieces"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Reorder Level</label>
          <Input
            type="number"
            value={form.reorderLevel}
            onChange={(e) => setForm({ ...form, reorderLevel: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Selling Price (₦)</label>
          <Input
            type="number"
            step="0.01"
            value={form.sellingPrice}
            onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Location</label>
          <Input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            placeholder="e.g., Warehouse A"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Category</label>
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          disabled={categoriesLoading}
          className="w-full rounded border p-2"
        >
          <option value="">Select category (optional)</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.categoryName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Inventory Data
        </Button>
      </div>
    </form>
  )
}

function AssetCreationForm({ 
  poItem, 
  onSave, 
  onCancel 
}: { 
  poItem: POItem
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [form, setForm] = React.useState({
    assetName: poItem.itemDescription,
    assetCode: "",
    assetType: "",
    description: "",
    salvageValue: String(Number(poItem.unitPrice) * 0.1), // 10% of purchase cost
    usefulLifeYears: "5",
    depreciationRate: "20",
    conditionStatus: "GOOD",
    location: "",
    categoryId: "",
  })

  const { categories, loading: categoriesLoading } = useSalesExpenseCategories({ 
    limit: 100,
    isActive: true 
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.assetName || !form.assetCode || !form.assetType) {
      alert("Please fill in all required fields")
      return
    }
    onSave({
      assetName: form.assetName,
      assetCode: form.assetCode,
      assetType: form.assetType,
      description: form.description || null,
      salvageValue: Number(form.salvageValue) || 0,
      usefulLifeYears: Number(form.usefulLifeYears) || 5,
      depreciationRate: Number(form.depreciationRate) || 20,
      conditionStatus: form.conditionStatus,
      location: form.location || null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
        <strong>From PO:</strong> Purchase Cost: ₦{Number(poItem.unitPrice).toLocaleString()}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Asset Name *</label>
          <Input
            value={form.assetName}
            onChange={(e) => setForm({ ...form, assetName: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Asset Code *</label>
          <Input
            value={form.assetCode}
            onChange={(e) => setForm({ ...form, assetCode: e.target.value })}
            placeholder="e.g., AST-001"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Asset Type *</label>
        <select
          value={form.assetType}
          onChange={(e) => setForm({ ...form, assetType: e.target.value })}
          className="w-full rounded border p-2"
          required
        >
          <option value="">Select type</option>
          <option value="INFRASTRUCTURE">Infrastructure</option>
          <option value="EQUIPMENT">Equipment</option>
          <option value="VEHICLES">Vehicles</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded border p-2 min-h-[60px]"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">Salvage Value (₦)</label>
          <Input
            type="number"
            step="0.01"
            value={form.salvageValue}
            onChange={(e) => setForm({ ...form, salvageValue: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Useful Life (Years)</label>
          <Input
            type="number"
            value={form.usefulLifeYears}
            onChange={(e) => setForm({ ...form, usefulLifeYears: e.target.value })}
          />
        </div>
        <div>
          <label className="text-sm font-medium">Depreciation Rate (%)</label>
          <Input
            type="number"
            step="0.01"
            value={form.depreciationRate}
            onChange={(e) => setForm({ ...form, depreciationRate: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Condition Status</label>
          <select
            value={form.conditionStatus}
            onChange={(e) => setForm({ ...form, conditionStatus: e.target.value })}
            className="w-full rounded border p-2"
          >
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Poor</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Location</label>
          <Input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Category</label>
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          disabled={categoriesLoading}
          className="w-full rounded border p-2"
        >
          <option value="">Select category (optional)</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.categoryName}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Asset Data
        </Button>
      </div>
    </form>
  )
}

function BatchCreationForm({ 
  poItem, 
  onSave, 
  onCancel 
}: { 
  poItem: POItem
  onSave: (data: any) => void
  onCancel: () => void
}) {
  const [form, setForm] = React.useState({
    batchCode: "",
    species: "",
    breed: "",
    averageWeight: "",
    location: "",
    categoryId: "",
    notes: "",
  })

  const { categories, loading: categoriesLoading } = useSalesExpenseCategories({ 
    limit: 100,
    isActive: true 
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.batchCode || !form.species) {
      alert("Please fill in all required fields")
      return
    }
    onSave({
      batchCode: form.batchCode,
      species: form.species,
      breed: form.breed || null,
      averageWeight: form.averageWeight ? Number(form.averageWeight) : null,
      location: form.location || null,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      notes: form.notes || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 p-3 rounded text-sm text-blue-700">
        <strong>From PO:</strong> Quantity: {poItem.quantity}, Total Cost: ₦{Number(poItem.totalPrice).toLocaleString()}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Batch Code *</label>
          <Input
            value={form.batchCode}
            onChange={(e) => setForm({ ...form, batchCode: e.target.value })}
            placeholder="e.g., BATCH-001"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Species *</label>
          <select
            value={form.species}
            onChange={(e) => setForm({ ...form, species: e.target.value })}
            className="w-full rounded border p-2"
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Breed</label>
          <Input
            value={form.breed}
            onChange={(e) => setForm({ ...form, breed: e.target.value })}
            placeholder="e.g., Broiler, Tilapia"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Average Weight (kg)</label>
          <Input
            type="number"
            step="0.01"
            value={form.averageWeight}
            onChange={(e) => setForm({ ...form, averageWeight: e.target.value })}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Location</label>
        <Input
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          placeholder="e.g., Pond 1, Coop A"
        />
      </div>

      <div>
        <label className="text-sm font-medium">Category</label>
        <select
          value={form.categoryId}
          onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          disabled={categoriesLoading}
          className="w-full rounded border p-2"
        >
          <option value="">Select category (optional)</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.categoryName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium">Notes</label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full rounded border p-2 min-h-[60px]"
          placeholder="Additional notes about this batch..."
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Batch Data
        </Button>
      </div>
    </form>
  )
}
