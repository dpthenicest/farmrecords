// _components/CustomerTable.tsx
"use client"

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TablePagination } from "@/components/ui/table"
import { ActionMenu } from "@/components/ui/action-menu"
import { Card, CardContent } from "@/components/ui/card"

export function CustomerTable({
  customers,
  page,
  totalPages,
  limit,
  loading,
  error,
  onPageChange,
  onLimitChange,
  onViewCustomer,
  onEditCustomer,
  onShowPayments,
  onShowInvoices,
  onDeleteCustomer,
}: any) {
  if (loading) return <p>Loading customers...</p>
  if (error) return <p className="text-red-600">{error.message}</p>
  if (!customers.length) return <p>No customers found</p>

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
              <TableHead>Credit Limit</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((c: any) => (
              <TableRow key={c.id}>
                <TableCell>{c.customerName}</TableCell>
                <TableCell>{c.customerType}</TableCell>
                <TableCell>{c.contactPerson}</TableCell>
                <TableCell>{c.phone}</TableCell>
                <TableCell>₦{c.creditLimit}</TableCell>
                <TableCell>{c.status}</TableCell>
                <TableCell>
                  <ActionMenu
                    onView={() => onViewCustomer(c.id)}
                    onEdit={() => onEditCustomer(c.id)}
                    onDelete={() => onDeleteCustomer(c.id)}
                    onCustom1={() => onShowPayments(c.id)}
                    onCustom2={() => onShowInvoices(c.id)}
                    custom1Label="Payments"
                    custom2Label="Invoices"
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
          onLimitChange={(l: number) => { onLimitChange(l); onPageChange(1) }}
        />
      </CardContent>
    </Card>
  )
}
