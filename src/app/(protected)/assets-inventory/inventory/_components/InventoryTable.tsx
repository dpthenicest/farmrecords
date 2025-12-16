"use client"

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TablePagination } from "@/components/ui/table"
import { ActionMenu } from "@/components/ui/action-menu"

export function InventoryTable({
  items,
  totalPages,
  page,
  limit,
  loading,
  error,
  onPageChange,
  onLimitChange,
  onView,
  onEdit,
  onDelete,
  onAdjust,
}: any) {
  if (loading) return <div>Loading inventory...</div>
  if (error) return <div className="text-red-600">Error: {error.message}</div>
  if (!items?.length) return <div>No items found</div>

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Reorder Level</TableHead>
            <TableHead>Unit Cost</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item: any) => {
            const isLowStock = item.currentQuantity <= item.reorderLevel
            const isOutOfStock = item.currentQuantity <= 0
            const isExpiring = item.expiryDate && new Date(item.expiryDate) < new Date(Date.now() + 7 * 86400000)

            const getRowClassName = () => {
              if (isOutOfStock) return "bg-red-100 border-red-200"
              if (isLowStock) return "bg-orange-50 border-orange-200"
              if (isExpiring) return "bg-yellow-50 border-yellow-200"
              return ""
            }

            const getStockStatus = () => {
              if (isOutOfStock) return { text: "Out of Stock", className: "bg-red-100 text-red-800" }
              if (isLowStock) return { text: "Low Stock", className: "bg-orange-100 text-orange-800" }
              return { text: "In Stock", className: "bg-green-100 text-green-800" }
            }

            const stockStatus = getStockStatus()

            return (
              <TableRow key={item.id} className={getRowClassName()}>
                <TableCell className="font-medium">{item.itemName}</TableCell>
                <TableCell className="font-mono text-sm">{item.itemCode}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={isLowStock ? "text-red-600 font-medium" : ""}">
                      {item.currentQuantity}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.unitOfMeasure}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{item.reorderLevel} {item.unitOfMeasure}</span>
                </TableCell>
                <TableCell>₦{Number(item.unitCost).toLocaleString()}</TableCell>
                <TableCell className="text-sm">{item.location || "-"}</TableCell>
                <TableCell className="text-sm">
                  {item.expiryDate ? (
                    <span className={isExpiring ? "text-orange-600 font-medium" : ""}>
                      {new Date(item.expiryDate).toLocaleDateString()}
                    </span>
                  ) : "-"}
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.className}`}>
                    {stockStatus.text}
                  </span>
                </TableCell>
                <TableCell>
                  <ActionMenu
                    onView={() => onView(item)}
                    onEdit={() => onEdit(item)}
                    onDelete={() => onDelete(item)}
                    onAdjust={() => onAdjust(item)}
                    showView
                    showEdit
                    showDelete
                    showAdjust
                  />
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>

      <TablePagination
        page={page}
        totalPages={totalPages}
        limit={limit}
        onPageChange={onPageChange}
        onLimitChange={(newLimit: number) => {
          onLimitChange(newLimit)
          onPageChange(1)
        }}
      />
    </div>
  )
}
