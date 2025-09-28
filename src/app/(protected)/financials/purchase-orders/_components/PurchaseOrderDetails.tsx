"use client"

import * as React from "react"

interface PurchaseOrderDetailsProps {
  purchaseOrder: any
  onClose: () => void
}

export function PurchaseOrderDetails({ purchaseOrder, onClose }: PurchaseOrderDetailsProps) {
  if (!purchaseOrder) return null

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Purchase Order #{purchaseOrder.poNumber}</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p><strong>Supplier:</strong> {purchaseOrder.supplier?.name || "N/A"}</p>
          <p><strong>Status:</strong> {purchaseOrder.status}</p>
        </div>
        <div>
          <p><strong>Order Date:</strong> {new Date(purchaseOrder.orderDate).toLocaleDateString()}</p>
          <p><strong>Expected Delivery:</strong> {new Date(purchaseOrder.expectedDeliveryDate).toLocaleDateString()}</p>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mt-4">Items</h3>
        <ul className="list-disc pl-6">
          {purchaseOrder.items?.map((item: any, idx: number) => (
            <li key={idx}>
              {item.name} - {item.quantity} x ${item.price}
            </li>
          )) || <p>No items added.</p>}
        </ul>
      </div>

      <div className="font-bold">Total: ${purchaseOrder.total?.toFixed(2)}</div>
    </div>
  )
}
