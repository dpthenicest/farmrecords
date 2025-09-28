"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"

interface PurchaseOrderFormProps {
  purchaseOrder?: any
  onClose: () => void
  onSaved: () => void
}

export function PurchaseOrderForm({
  purchaseOrder,
  onClose,
  onSaved,
}: PurchaseOrderFormProps) {
  // 🆕 Centralized form state for text fields
  const [form, setForm] = React.useState({
    poNumber: purchaseOrder?.poNumber || "",
    supplierId: purchaseOrder?.supplierId || "",
    status: purchaseOrder?.status || "draft",
  })

  // 🆕 DatePickers use Date objects
  const [orderDate, setOrderDate] = React.useState<Date | undefined>(
    purchaseOrder?.orderDate ? new Date(purchaseOrder.orderDate) : undefined
  )
  const [expectedDeliveryDate, setExpectedDeliveryDate] = React.useState<Date | undefined>(
    purchaseOrder?.expectedDeliveryDate ? new Date(purchaseOrder.expectedDeliveryDate) : undefined
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    // Basic validation for required dates
    if (!orderDate || !expectedDeliveryDate) {
      alert("Order Date and Expected Delivery Date are required.")
      return
    }

    // 🔨 Final data structure
    const finalData = {
      ...form,
      orderDate: orderDate.toISOString(),
      expectedDeliveryDate: expectedDeliveryDate.toISOString(),
    }

    // TODO: Replace with create/update API call
    console.log("submit purchase order", finalData)

    onSaved()
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* PO Number */}
      <Input
        name="poNumber"
        placeholder="PO Number"
        value={form.poNumber}
        onChange={handleChange}
        required
      />

      {/* Order Date */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Order Date</label>
        <DatePicker value={orderDate} onChange={setOrderDate} />
      </div>

      {/* Expected Delivery Date */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Expected Delivery Date</label>
        <DatePicker
          value={expectedDeliveryDate}
          onChange={setExpectedDeliveryDate}
        />
      </div>

      {/* Supplier */}
      <Input
        name="supplierId"
        placeholder="Supplier ID"
        value={form.supplierId}
        onChange={handleChange}
      />

      {/* Status */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Status</label>
        <Select
          value={form.status}
          onValueChange={(val) => setForm({ ...form, status: val })}
        >
          <SelectTrigger className="w-full">
            Select status
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="received">Received</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{purchaseOrder ? "Update" : "Create"}</Button>
      </div>
    </form>
  )
}
