"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function InventoryDetails({ item, onClose }: { item: any; onClose: () => void }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Item Info</CardTitle></CardHeader>
        <CardContent>
          <p><strong>Name:</strong> {item.itemName}</p>
          <p><strong>Code:</strong> {item.itemCode}</p>
          <p><strong>Description:</strong> {item.description}</p>
          <p><strong>Unit:</strong> {item.unitOfMeasure}</p>
          <p><strong>Stock:</strong> {item.currentQuantity}</p>
          <p><strong>Reorder Level:</strong> {item.reorderLevel}</p>
          <p><strong>Unit Cost:</strong> ₦{item.unitCost}</p>
          <p><strong>Selling Price:</strong> ₦{item.sellingPrice}</p>
          <p><strong>Location:</strong> {item.location}</p>
          <p><strong>Expiry Date:</strong> {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : "-"}</p>
        </CardContent>
      </Card>
    </div>
  )
}
