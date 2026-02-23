"use client"

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TablePagination } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Edit, Trash2, Send, CheckCircle, Loader2 } from "lucide-react"

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
  actionLoading = {},
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
  
  if (!invoices?.length) {
    return <div className="text-gray-500 text-center py-6">No invoices found</div>
  }

  const formatCurrency = (amount: number | string) => {
    const numAmount = Number(amount) || 0
    return `₦${numAmount.toLocaleString()}`
  }

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
              <TableCell>{inv.customer?.customerName}</TableCell>
              <TableCell>{new Date(inv.invoiceDate).toLocaleDateString()}</TableCell>
              <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
              <TableCell>{formatCurrency(inv.totalAmount)}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-xs ${STATUS_COLORS[inv.status.toLowerCase()]}`}>
                  {inv.status}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(inv)}
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(inv)}
                    title="Edit"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {inv.status === 'DRAFT' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSend(inv)}
                      disabled={actionLoading.sending}
                      title="Send"
                    >
                      {actionLoading.sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  {(inv.status === 'SENT' || inv.status === 'OVERDUE') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onMarkPaid(inv)}
                      disabled={actionLoading.markingPaid}
                      title="Mark as Paid"
                    >
                      {actionLoading.markingPaid ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                  {inv.status !== 'PAID' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(inv)}
                      disabled={actionLoading.deleting}
                      title="Delete"
                    >
                      {actionLoading.deleting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
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
