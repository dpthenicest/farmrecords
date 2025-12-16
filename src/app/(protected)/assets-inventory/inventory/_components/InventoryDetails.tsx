"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"

interface InventoryDetailsProps {
  item: any
  onClose: () => void
}

interface InventoryMovement {
  id: number
  movementType: string
  quantity: number
  unitCost: number
  movementDate: string
  referenceType?: string
  referenceId?: number
  notes?: string
}

export function InventoryDetails({ item, onClose }: InventoryDetailsProps) {
  const [movements, setMovements] = useState<InventoryMovement[]>([])
  const [movementsLoading, setMovementsLoading] = useState(false)
  const [movementFilter, setMovementFilter] = useState<string>("all")
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false)
  const [adjustmentForm, setAdjustmentForm] = useState({
    adjustmentType: "INCREASE",
    quantity: "",
    unitCost: "",
    notes: ""
  })
  const [adjustmentLoading, setAdjustmentLoading] = useState(false)

  // Fetch inventory movements
  const fetchMovements = useCallback(async () => {
    if (!item?.id) return
    
    setMovementsLoading(true)
    try {
      const response = await fetch(`/api/inventory-movements/by-inventory/${item.id}`, {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setMovements(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch inventory movements:", error)
    } finally {
      setMovementsLoading(false)
    }
  }, [item?.id])

  useEffect(() => {
    fetchMovements()
  }, [fetchMovements])

  const formatDate = (date: string | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString()
  }

  const formatCurrency = (amount: any) => {
    if (!amount) return "-"
    return `$${Number(amount).toLocaleString()}`
  }

  const getStockStatusColor = (currentQuantity: number, reorderLevel: number) => {
    if (currentQuantity <= 0) {
      return "bg-red-100 text-red-800"
    } else if (currentQuantity <= reorderLevel) {
      return "bg-yellow-100 text-yellow-800"
    } else {
      return "bg-green-100 text-green-800"
    }
  }

  const getStockStatusText = (currentQuantity: number, reorderLevel: number) => {
    if (currentQuantity <= 0) {
      return "Out of Stock"
    } else if (currentQuantity <= reorderLevel) {
      return "Low Stock"
    } else {
      return "In Stock"
    }
  }

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case "PURCHASE":
      case "INCREASE":
        return "bg-green-100 text-green-800"
      case "SALE":
      case "DECREASE":
        return "bg-red-100 text-red-800"
      case "ADJUSTMENT":
        return "bg-blue-100 text-blue-800"
      case "TRANSFER":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAdjustment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    const quantity = Number(adjustmentForm.quantity)
    if (!adjustmentForm.quantity || isNaN(quantity) || quantity <= 0) {
      alert("Please enter a valid positive quantity")
      return
    }

    // Check if decrease would result in negative stock
    if (adjustmentForm.adjustmentType === "DECREASE" && quantity > item.currentQuantity) {
      alert(`Cannot decrease by ${quantity} ${item.unitOfMeasure}. Current stock is only ${item.currentQuantity} ${item.unitOfMeasure}.`)
      return
    }

    // Validate unit cost if provided
    const unitCost = adjustmentForm.unitCost ? Number(adjustmentForm.unitCost) : item.unitCost
    if (adjustmentForm.unitCost && (isNaN(unitCost) || unitCost < 0)) {
      alert("Please enter a valid unit cost")
      return
    }

    setAdjustmentLoading(true)
    try {
      const response = await fetch(`/api/inventory/${item.id}/adjust-quantity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          adjustmentType: adjustmentForm.adjustmentType,
          quantity: quantity,
          unitCost: unitCost,
          notes: adjustmentForm.notes.trim() || null
        })
      })

      if (response.ok) {
        // Close the adjustment modal and refresh data
        setShowAdjustmentModal(false)
        setAdjustmentForm({
          adjustmentType: "INCREASE",
          quantity: "",
          unitCost: "",
          notes: ""
        })
        // Refresh the movements and close the details modal to refresh parent
        await fetchMovements()
        
        // Show success message with details
        const newQuantity = adjustmentForm.adjustmentType === "INCREASE" 
          ? item.currentQuantity + quantity 
          : item.currentQuantity - quantity
        alert(`Inventory adjusted successfully!\nNew stock level: ${newQuantity} ${item.unitOfMeasure}`)
        onClose() // This will trigger a refresh in the parent component
      } else {
        const error = await response.json()
        alert(error.error || error.message || "Failed to adjust inventory")
      }
    } catch (error) {
      console.error("Failed to adjust inventory:", error)
      alert("Failed to adjust inventory. Please try again.")
    } finally {
      setAdjustmentLoading(false)
    }
  }

  if (!item) return null

  const stockStatus = getStockStatusText(item.currentQuantity, item.reorderLevel)
  const isLowStock = item.currentQuantity <= item.reorderLevel

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{item.itemName}</h2>
          <p className="text-muted-foreground">{item.itemCode} - {item.category?.categoryName || "Uncategorized"}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(item.currentQuantity, item.reorderLevel)}`}>
            {stockStatus}
          </span>
          {isLowStock && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              Reorder Alert
            </span>
          )}
        </div>
      </div>

      <hr className="border-gray-200" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Item Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Item Name</label>
                <p className="font-medium">{item.itemName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Item Code</label>
                <p className="font-medium">{item.itemCode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Category</label>
                <p className="font-medium">{item.category?.categoryName || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unit of Measure</label>
                <p className="font-medium">{item.unitOfMeasure}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="font-medium">{item.location || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                <p className="font-medium">{formatDate(item.expiryDate)}</p>
              </div>
            </div>
            {item.description && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="text-sm">{item.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Information */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Stock Information</CardTitle>
              <Button size="sm" onClick={() => setShowAdjustmentModal(true)}>
                Adjust Stock
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Quantity</label>
                <p className="text-2xl font-bold text-blue-600">{item.currentQuantity} {item.unitOfMeasure}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reorder Level</label>
                <p className="text-lg font-medium">{item.reorderLevel} {item.unitOfMeasure}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Unit Cost</label>
                <p className="font-medium">{formatCurrency(item.unitCost)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Selling Price</label>
                <p className="font-medium">{formatCurrency(item.sellingPrice)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Value</label>
                <p className="text-lg font-bold text-green-600">
                  {formatCurrency(Number(item.currentQuantity) * Number(item.unitCost))}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Stock Status</label>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatusColor(item.currentQuantity, item.reorderLevel)}`}>
                  {stockStatus}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low Stock Alert */}
      {isLowStock && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800">⚠️ Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-orange-700">
              This item is running low on stock. Current quantity ({item.currentQuantity} {item.unitOfMeasure}) 
              is at or below the reorder level ({item.reorderLevel} {item.unitOfMeasure}). 
              Consider placing a purchase order to replenish stock.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Movement History */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Movement History</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="movementFilter" className="text-sm">Filter:</Label>
              <select
                id="movementFilter"
                className="text-sm border rounded px-2 py-1"
                value={movementFilter}
                onChange={(e) => setMovementFilter(e.target.value)}
              >
                <option value="all">All Movements</option>
                <option value="PURCHASE">Purchases</option>
                <option value="SALE">Sales</option>
                <option value="ADJUSTMENT">Adjustments</option>
                <option value="INCREASE">Increases</option>
                <option value="DECREASE">Decreases</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {movementsLoading ? (
            <div className="p-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading movement history...</p>
            </div>
          ) : movements.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              <p>No movement history found.</p>
              <p className="text-sm mt-1">Movements will appear here when inventory is adjusted, purchased, or sold.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Movement Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Movements</p>
                  <p className="text-lg font-semibold">{movements.filter(m => movementFilter === "all" || m.movementType === movementFilter).length}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total In</p>
                  <p className="text-lg font-semibold text-green-600">
                    +{movements
                      .filter(m => ["PURCHASE", "INCREASE", "ADJUSTMENT"].includes(m.movementType) && (movementFilter === "all" || m.movementType === movementFilter))
                      .reduce((sum, m) => sum + Number(m.quantity), 0)} {item.unitOfMeasure}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Total Out</p>
                  <p className="text-lg font-semibold text-red-600">
                    -{movements
                      .filter(m => ["SALE", "DECREASE"].includes(m.movementType) && (movementFilter === "all" || m.movementType === movementFilter))
                      .reduce((sum, m) => sum + Number(m.quantity), 0)} {item.unitOfMeasure}
                  </p>
                </div>
              </div>

              {/* Movement Table */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Cost</TableHead>
                      <TableHead>Total Value</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movements
                      .filter(movement => movementFilter === "all" || movement.movementType === movementFilter)
                      .map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell className="font-medium">
                            {formatDate(movement.movementDate)}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMovementTypeColor(movement.movementType)}`}>
                              {movement.movementType}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={movement.movementType === "DECREASE" || movement.movementType === "SALE" ? "text-red-600 font-medium" : "text-green-600 font-medium"}>
                              {movement.movementType === "DECREASE" || movement.movementType === "SALE" ? "-" : "+"}
                              {movement.quantity} {item.unitOfMeasure}
                            </span>
                          </TableCell>
                          <TableCell>₦{formatCurrency(movement.unitCost)}</TableCell>
                          <TableCell className="font-medium">
                            ₦{formatCurrency(Number(movement.quantity) * Number(movement.unitCost))}
                          </TableCell>
                          <TableCell>
                            {movement.referenceType && movement.referenceId 
                              ? (
                                <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                                  {movement.referenceType} #{movement.referenceId}
                                </span>
                              )
                              : <span className="text-muted-foreground">-</span>
                            }
                          </TableCell>
                          <TableCell className="max-w-xs">
                            {movement.notes ? (
                              <span className="text-sm" title={movement.notes}>
                                {movement.notes.length > 30 ? `${movement.notes.substring(0, 30)}...` : movement.notes}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>

              {movements.filter(m => movementFilter === "all" || m.movementType === movementFilter).length === 0 && (
                <div className="text-center p-4 text-muted-foreground">
                  <p>No movements found for the selected filter.</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Record Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle>Record Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Created At</label>
            <p className="font-medium">{formatDate(item.createdAt)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Updated At</label>
            <p className="font-medium">{formatDate(item.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>

      {/* Inventory Adjustment Modal */}
      <Modal
        open={showAdjustmentModal}
        onOpenChange={setShowAdjustmentModal}
        title="Adjust Inventory"
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Inventory Adjustment</CardTitle>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                <strong>{item.itemName}</strong> ({item.itemCode})
              </p>
              <p className="text-sm">
                Current stock: <span className="font-medium text-blue-600">{item.currentQuantity} {item.unitOfMeasure}</span>
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdjustment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adjustmentType">Adjustment Type</Label>
                <select
                  id="adjustmentType"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={adjustmentForm.adjustmentType}
                  onChange={(e) => setAdjustmentForm(prev => ({ ...prev, adjustmentType: e.target.value }))}
                >
                  <option value="INCREASE">Increase Stock (+)</option>
                  <option value="DECREASE">Decrease Stock (-)</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity * ({item.unitOfMeasure})</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="Enter quantity"
                  value={adjustmentForm.quantity}
                  onChange={(e) => setAdjustmentForm(prev => ({ ...prev, quantity: e.target.value }))}
                  required
                />
                {adjustmentForm.adjustmentType === "DECREASE" && adjustmentForm.quantity && Number(adjustmentForm.quantity) > item.currentQuantity && (
                  <p className="text-xs text-red-600">
                    ⚠️ Cannot decrease by more than current stock ({item.currentQuantity} {item.unitOfMeasure})
                  </p>
                )}
              </div>

              {/* Preview of new quantity */}
              {adjustmentForm.quantity && !isNaN(Number(adjustmentForm.quantity)) && Number(adjustmentForm.quantity) > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm font-medium text-blue-800">
                    New stock level will be: {" "}
                    <span className="font-bold">
                      {adjustmentForm.adjustmentType === "INCREASE" 
                        ? item.currentQuantity + Number(adjustmentForm.quantity)
                        : item.currentQuantity - Number(adjustmentForm.quantity)
                      } {item.unitOfMeasure}
                    </span>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost (₦)</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={`Default: ₦${formatCurrency(item.unitCost)}`}
                  value={adjustmentForm.unitCost}
                  onChange={(e) => setAdjustmentForm(prev => ({ ...prev, unitCost: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use current unit cost (₦{formatCurrency(item.unitCost)})
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Reason for adjustment (e.g., damaged goods, stock count correction, etc.)"
                  value={adjustmentForm.notes}
                  onChange={(e) => setAdjustmentForm(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setShowAdjustmentModal(false)
                    setAdjustmentForm({
                      adjustmentType: "INCREASE",
                      quantity: "",
                      unitCost: "",
                      notes: ""
                    })
                  }}
                  disabled={adjustmentLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={adjustmentLoading || !adjustmentForm.quantity || Number(adjustmentForm.quantity) <= 0}
                  className={adjustmentForm.adjustmentType === "DECREASE" ? "bg-red-600 hover:bg-red-700" : ""}
                >
                  {adjustmentLoading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Adjusting...
                    </span>
                  ) : (
                    `${adjustmentForm.adjustmentType === "INCREASE" ? "Increase" : "Decrease"} Inventory`
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </Modal>
    </div>
  )
}
