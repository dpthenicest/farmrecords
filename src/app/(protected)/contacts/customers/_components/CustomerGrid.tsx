// _components/CustomerGrid.tsx
"use client"

import * as React from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Customer } from "@/types" // optional if you have type definitions

interface CustomerGridProps {
  customers: Customer[]
  loading: boolean
  error: Error | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onViewCustomer: (id: number) => void
  onEditCustomer: (id: number) => void
  onShowPayments: (id: number) => void
  onShowInvoices: (id: number) => void
}

export function CustomerGrid({
  customers,
  loading,
  error,
  page,
  totalPages,
  onPageChange,
  onViewCustomer,
  onEditCustomer,
  onShowPayments,
  onShowInvoices,
}: CustomerGridProps) {
  if (loading) return <p>Loading customers...</p>
  if (error) return <p className="text-red-600">{error.message}</p>
  if (!customers.length) return <p>No customers found</p>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {customers.map((c) => (
          <Card key={c.id} className="cursor-pointer hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>{c.customerName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Type: {c.customerType}</p>
              <p>Contact: {c.contactPerson}</p>
              <p>Phone: {c.phone}</p>
              <p>Credit Limit: ₦{c.creditLimit}</p>
              <p>Status: {c.status}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => onViewCustomer(c.id)}>View</Button>
                <Button size="sm" variant="secondary" onClick={() => onEditCustomer(c.id)}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => onShowPayments(c.id)}>Payments</Button>
                <Button size="sm" variant="outline" onClick={() => onShowInvoices(c.id)}>Invoices</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={p === page ? "default" : "outline"}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
