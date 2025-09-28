"use client"

import { Modal } from "@/components/ui/modal"
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table"

export function SupplierPurchaseOrdersModal({ open, onClose, orders, loading }: any) {
  return (
    <Modal open={open} onOpenChange={onClose} title="Purchase Orders">
      {loading ? <p>Loading...</p> : orders.length ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((o:any) => (
              <TableRow key={o.id}>
                <TableCell>{o.orderNumber}</TableCell>
                <TableCell>{new Date(o.date).toLocaleDateString()}</TableCell>
                <TableCell>₦{o.total}</TableCell>
                <TableCell>{o.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : <p>No orders found</p>}
    </Modal>
  )
}
