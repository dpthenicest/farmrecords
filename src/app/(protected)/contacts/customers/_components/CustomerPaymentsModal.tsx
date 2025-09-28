// _components/CustomerPaymentsModal.tsx
"use client"

import { Modal } from "@/components/ui/modal"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

interface CustomerPaymentsModalProps {
  open: boolean
  onClose: () => void
  payments: any[]
  loading: boolean
}

export function CustomerPaymentsModal({ open, onClose, payments, loading }: CustomerPaymentsModalProps) {
  return (
    <Modal open={open} onOpenChange={onClose} title="Payment History">
      {loading ? <p>Loading...</p> : payments.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Reference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                <TableCell>₦{p.amount}</TableCell>
                <TableCell>{p.method}</TableCell>
                <TableCell>{p.reference}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : <p>No payments found</p>}
    </Modal>
  )
}
