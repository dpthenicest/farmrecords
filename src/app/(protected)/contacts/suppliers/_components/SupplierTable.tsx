"use client"

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TablePagination } from "@/components/ui/table"
import { ActionMenu } from "@/components/ui/action-menu"
import { Card, CardContent } from "@/components/ui/card"

export function SupplierTable({ suppliers, page, totalPages, limit, loading, error, onPageChange, onLimitChange, onViewSupplier, onEditSupplier, onShowOrders, onShowPayments, onDeleteSupplier }: any) {
  if (loading) return <p>Loading suppliers...</p>
  if (error) return <p className="text-red-600">{error.message}</p>
  if (!suppliers.length) return <p>No suppliers found</p>

  return (
    <Card>
      <CardContent className="p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((s:any) => (
              <TableRow key={s.id}>
                <TableCell>{s.supplierName}</TableCell>
                <TableCell>{s.supplierType}</TableCell>
                <TableCell>{s.contactPerson}</TableCell>
                <TableCell>{s.phone}</TableCell>
                <TableCell>{s.rating} ★</TableCell>
                <TableCell>
                  <ActionMenu
                    onView={() => onViewSupplier(s.id)}
                    onEdit={() => onEditSupplier(s.id)}
                    onDelete={() => onDeleteSupplier(s.id)}
                    onCustom1={() => onShowOrders(s.id)}
                    onCustom2={() => onShowPayments(s.id)}
                    custom1Label="Orders"
                    custom2Label="Payments"
                    showView
                    showEdit
                    showDelete
                    showCustom1
                    showCustom2
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
          onLimitChange={(l:number) => { onLimitChange(l); onPageChange(1) }}
        />
      </CardContent>
    </Card>
  )
}
