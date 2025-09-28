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
            const isExpiring = item.expiryDate && new Date(item.expiryDate) < new Date(Date.now() + 7 * 86400000)

            return (
              <TableRow
                key={item.id}
                className={
                  isLowStock ? "bg-red-50" : isExpiring ? "bg-orange-50" : ""
                }
              >
                <TableCell>{item.itemName}</TableCell>
                <TableCell>{item.itemCode}</TableCell>
                <TableCell>{item.currentQuantity}</TableCell>
                <TableCell>{item.reorderLevel}</TableCell>
                <TableCell>₦{item.unitCost}</TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>
                  {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell>{isLowStock ? "Low Stock" : "Available"}</TableCell>
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
