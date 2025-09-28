"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function InvoiceDetails({ invoice, onClose }: { invoice: any; onClose: () => void }) {
  return (
    <div className="space-y-4">
      {/* Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{invoice.customer?.name}</p>
          <p>{invoice.customer?.email}</p>
        </CardContent>
      </Card>

      {/* Items */}
      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {invoice.items?.map((item: any) => (
              <li key={item.id} className="flex justify-between">
                <span>{item.itemDescription}</span>
                <span>
                  {item.quantity} × ₦{item.unitPrice} = ₦{item.totalPrice}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payments</CardTitle>
        </CardHeader>
        <CardContent>
          {invoice.financialRecords?.length ? (
            <ul className="space-y-1">
              {invoice.financialRecords.map((p: any) => (
                <li key={p.id}>{p.amount} on {new Date(p.createdAt).toLocaleDateString()}</li>
              ))}
            </ul>
          ) : (
            <p>No payments recorded.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
