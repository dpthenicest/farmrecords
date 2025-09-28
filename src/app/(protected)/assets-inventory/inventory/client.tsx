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

  const handleApplyFilters = () => {
    setAppliedFilters({
      search: pendingSearch,
      category: pendingCategory,
      lowStock: pendingLowStock,
    })
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <Button onClick={() => setShowForm(true)}>+ Add Item</Button>
      </div>

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
            onAdjust={(item) => console.log("adjust", item)}
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
