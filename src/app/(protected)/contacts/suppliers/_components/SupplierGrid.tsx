"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function SupplierGrid({ suppliers, loading, error, page, totalPages, onPageChange, onViewSupplier, onEditSupplier, onShowOrders, onShowPayments }: any) {
  if (loading) return <p>Loading suppliers...</p>
  if (error) return <p className="text-red-600">{error.message}</p>
  if (!suppliers.length) return <p>No suppliers found</p>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {suppliers.map((s:any) => (
          <Card key={s.id} className="cursor-pointer hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>{s.supplierName}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Type: {s.supplierType}</p>
              <p>Contact: {s.contactPerson}</p>
              <p>Phone: {s.phone}</p>
              <p>Rating: {s.rating} ★</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Button size="sm" variant="outline" onClick={() => onViewSupplier(s.id)}>View</Button>
                <Button size="sm" variant="secondary" onClick={() => onEditSupplier(s.id)}>Edit</Button>
                <Button size="sm" variant="outline" onClick={() => onShowOrders(s.id)}>Orders</Button>
                <Button size="sm" variant="outline" onClick={() => onShowPayments(s.id)}>Payments</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Button key={p} size="sm" variant={p===page?"default":"outline"} onClick={()=>onPageChange(p)}>{p}</Button>
          ))}
        </div>
      )}
    </div>
  )
}
