"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useInventory } from "@/hooks/useInventory"
import { InventoryTable } from "./_components/InventoryTable"
import { InventoryFilters } from "./_components/InventoryFilters"
import { InventoryDetails } from "./_components/InventoryDetails"
import { InventoryForm } from "./_components/InventoryForm"
import { Modal } from "@/components/ui/modal"

interface AppliedFilters {
  search: string
  category: string
  lowStock: boolean
}

export default function InventoryClient() {
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)

  const [pendingSearch, setPendingSearch] = React.useState("")
  const [pendingCategory, setPendingCategory] = React.useState<string>("all")
  const [pendingLowStock, setPendingLowStock] = React.useState(false)

  const [appliedFilters, setAppliedFilters] = React.useState<AppliedFilters>({
    search: "",
    category: "all",
    lowStock: false,
  })

  const { items, totalPages, loading, error, refetch } = useInventory({
    page,
    limit,
    category: appliedFilters.category !== "all" ? appliedFilters.category : undefined,
    lowStock: appliedFilters.lowStock,
    search: appliedFilters.search,
  })

  const [showForm, setShowForm] = React.useState(false)
  const [selectedItem, setSelectedItem] = React.useState<any>(null)
  const [lowStockItems, setLowStockItems] = React.useState<any[]>([])
  const [lowStockLoading, setLowStockLoading] = React.useState(false)

  const handleApplyFilters = () => {
    setAppliedFilters({
      search: pendingSearch,
      category: pendingCategory,
      lowStock: pendingLowStock,
    })
    setPage(1)
  }

  // Fetch low stock items for alerts
  const fetchLowStockItems = React.useCallback(async () => {
    setLowStockLoading(true)
    try {
      const response = await fetch("/api/inventory/low-stock", {
        credentials: "include"
      })
      if (response.ok) {
        const data = await response.json()
        setLowStockItems(data.data || [])
      }
    } catch (error) {
      console.error("Failed to fetch low stock items:", error)
    } finally {
      setLowStockLoading(false)
    }
  }, [])

  React.useEffect(() => {
    fetchLowStockItems()
  }, [fetchLowStockItems])

  const handleAdjustStock = (item: any) => {
    setSelectedItem(item)
    // The InventoryDetails component will handle the adjustment modal
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Button onClick={() => setShowForm(true)}>+ Add Item</Button>
      </div>

      {/* Low Stock Alerts */}
      {!lowStockLoading && lowStockItems.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              ⚠️ Low Stock Alerts ({lowStockItems.length})
            </CardTitle>
            <p className="text-sm text-orange-700 mt-1">
              The following items are at or below their reorder levels and need attention.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {lowStockItems.slice(0, 5).map((item: any) => {
                // Handle both snake_case (from raw SQL) and camelCase (from Prisma) field names
                const itemId = item.inventory_id || item.id
                const itemName = item.item_name || item.itemName
                const itemCode = item.item_code || item.itemCode
                const currentQuantity = item.current_quantity || item.currentQuantity
                const reorderLevel = item.reorder_level || item.reorderLevel
                const unitOfMeasure = item.unit_of_measure || item.unitOfMeasure
                
                const isOutOfStock = currentQuantity <= 0
                const alertLevel = isOutOfStock ? "critical" : "warning"
                
                return (
                  <div key={itemId} className={`flex justify-between items-center p-3 rounded border ${
                    isOutOfStock 
                      ? "bg-red-50 border-red-200" 
                      : "bg-white border-orange-200"
                  }`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{itemName}</span>
                        <span className="text-sm text-muted-foreground">
                          ({itemCode})
                        </span>
                        {isOutOfStock && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                            OUT OF STOCK
                          </span>
                        )}
                      </div>
                      <div className="text-sm mt-1">
                        <span className={isOutOfStock ? "text-red-700 font-medium" : "text-orange-700"}>
                          Current: {currentQuantity} {unitOfMeasure}
                        </span>
                        <span className="text-muted-foreground mx-2">•</span>
                        <span className="text-muted-foreground">
                          Reorder at: {reorderLevel} {unitOfMeasure}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedItem({
                          id: itemId,
                          itemName,
                          itemCode,
                          currentQuantity,
                          reorderLevel,
                          unitOfMeasure,
                          ...item // Include all other properties
                        })}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm" 
                        variant={isOutOfStock ? "default" : "outline"}
                        onClick={() => handleAdjustStock({
                          id: itemId,
                          itemName,
                          itemCode,
                          currentQuantity,
                          reorderLevel,
                          unitOfMeasure,
                          ...item // Include all other properties
                        })}
                      >
                        {isOutOfStock ? "Restock Now" : "Adjust Stock"}
                      </Button>
                    </div>
                  </div>
                )
              })}
              {lowStockItems.length > 5 && (
                <div className="text-center pt-3 border-t border-orange-200">
                  <p className="text-sm text-orange-700 mb-2">
                    And {lowStockItems.length - 5} more items need attention...
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setPendingLowStock(true)
                      handleApplyFilters()
                    }}
                  >
                    View All Low Stock Items
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <InventoryFilters
        search={pendingSearch}
        onSearch={setPendingSearch}
        category={pendingCategory}
        onCategoryChange={setPendingCategory}
        lowStock={pendingLowStock}
        onLowStockChange={setPendingLowStock}
        onApplyFilters={handleApplyFilters}
      />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <InventoryTable
            items={items}
            totalPages={totalPages}
            page={page}
            limit={limit}
            loading={loading}
            error={error}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onView={(item) => setSelectedItem(item)}
            onEdit={(item) => {
              setSelectedItem(item)
              setShowForm(true)
            }}
            onDelete={(item) => console.log("delete", item)}
            onAdjust={handleAdjustStock}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        open={!!selectedItem && !showForm}
        onOpenChange={() => setSelectedItem(null)}
        title="Item Details"
      >
        {selectedItem && (
          <InventoryDetails item={selectedItem} onClose={() => setSelectedItem(null)} />
        )}
      </Modal>
      <Modal
        open={showForm}
        onOpenChange={setShowForm}
        title={selectedItem ? "Edit Item" : "Add Item"}
      >
        <InventoryForm
          item={selectedItem}
          onClose={() => {
            setSelectedItem(null)
            setShowForm(false)
          }}
          onSaved={refetch}
        />
      </Modal>
    </div>
  )
}
