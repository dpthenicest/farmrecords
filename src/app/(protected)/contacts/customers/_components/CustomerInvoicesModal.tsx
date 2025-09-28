// _components/CustomerInvoicesModal.tsx
"use client"

import { Modal } from "@/components/ui/modal"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

interface CustomerInvoicesModalProps {
  open: boolean
  onClose: () => void
  invoices: any[]
  loading: boolean
}

export function CustomerInvoicesModal({ open, onClose, invoices, loading }: CustomerInvoicesModalProps) {
  return (
    <Modal open={open} onOpenChange={onClose} title="Invoices">
      {loading ? <p>Loading...</p> : invoices.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>{inv.invoiceNumber}</TableCell>
                <TableCell>{new Date(inv.date).toLocaleDateString()}</TableCell>
                <TableCell>₦{inv.total}</TableCell>
                <TableCell>{inv.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : <p>No invoices found</p>}
    </Modal>
  )
}
