"use client"

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TablePagination,
} from "@/components/ui/table"
import { ActionMenu } from "@/components/ui/action-menu"
import { Loader2 } from "lucide-react"

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  received: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
}

export function PurchaseOrderTable({
  purchaseOrders,
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
  onSend,
  onReceive,
}: any) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600 text-center py-6">Error: {error.message}</div>
  }

  if (!purchaseOrders?.length) {
    return <div className="text-gray-500 text-center py-6">No purchase orders found</div>
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PO #</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Expected Delivery</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {purchaseOrders.map((po: any) => (
            <TableRow key={po.id}>
              <TableCell>{po.poNumber}</TableCell>
              <TableCell>{po.supplier?.name || "N/A"}</TableCell>
              <TableCell>{new Date(po.orderDate).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(po.expectedDeliveryDate).toLocaleDateString()}</TableCell>
              <TableCell>₦{po.total?.toFixed(2)}</TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded text-xs ${
                    STATUS_COLORS[po.status?.toLowerCase()] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  {po.status}
                </span>
              </TableCell>
              <TableCell>
                <ActionMenu
                  onView={() => onView(po)}
                  onEdit={() => onEdit(po)}
                  onDelete={() => onDelete(po)}
                  onSend={() => onSend(po)}
                  onReceive={() => onReceive(po)}
                  showView
                  showEdit
                  showDelete
                  showSend
                  showReceive
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        page={page}
        totalPages={totalPages}
        limit={limit}
        onPageChange={onPageChange}
        onLimitChange={(newLimit: number) => {
          onLimitChange(newLimit)
          onPageChange(1) // reset to page 1
        }}
      />
    </div>
  )
}
