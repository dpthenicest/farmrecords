"use client"

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TablePagination } from "@/components/ui/table"
import { ActionMenu } from "@/components/ui/action-menu"

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  sent: "bg-blue-100 text-blue-700",
  paid: "bg-green-100 text-green-700",
  overdue: "bg-red-100 text-red-700",
}

export function InvoiceTable({
  invoices,
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
  onMarkPaid,
}: any) {
  if (loading) return <div>Loading invoices...</div>
  if (error) return <div className="text-red-600">Error: {error.message}</div>
  if (!invoices?.length) return <div>No invoices found</div>

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice #</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((inv: any) => (
            <TableRow key={inv.id}>
              <TableCell>{inv.invoiceNumber}</TableCell>
              <TableCell>{inv.customer?.name}</TableCell>
              <TableCell>{new Date(inv.invoiceDate).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
              <TableCell>₦{inv.totalAmount}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[inv.status.toLowerCase()]}`}>
                  {inv.status}
                </span>
              </TableCell>
              <TableCell>
                <ActionMenu
                  onView={() => onView(inv)}
                  onEdit={() => onEdit(inv)}
                  onDelete={() => onDelete(inv)}
                  onSend={() => onSend(inv)}
                  onMarkPaid={() => onMarkPaid(inv)}
                  showView
                  showEdit
                  showDelete
                  showSend
                  showMarkPaid
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
