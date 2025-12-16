"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export function InventoryForm({
  item,
  onClose,
  onSaved,
}: {
  item?: any
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = React.useState({
    itemName: item?.itemName || "",
    itemCode: item?.itemCode || "",
    description: item?.description || "",
    unitOfMeasure: item?.unitOfMeasure || "",
    currentQuantity: item?.currentQuantity || 0,
    reorderLevel: item?.reorderLevel || 0,
    unitCost: item?.unitCost || 0,
    sellingPrice: item?.sellingPrice || 0,
    location: item?.location || "",
    expiryDate: item?.expiryDate || "",
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const url = item ? `/api/inventory/${item.id}` : "/api/inventory"
      const method = item ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ...form,
          currentQuantity: Number(form.currentQuantity),
          reorderLevel: Number(form.reorderLevel),
          unitCost: Number(form.unitCost),
          sellingPrice: Number(form.sellingPrice),
          expiryDate: form.expiryDate || null,
        }),
      })

      if (response.ok) {
        onSaved()
        onClose()
      } else {
        const errorData = await response.json()
        setError(errorData.error?.message || errorData.message || "Failed to save inventory item")
      }
    } catch (err: any) {
      setError(err.message || "Failed to save inventory item")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <Input name="itemName" placeholder="Item Name" value={form.itemName} onChange={handleChange} required />
      <Input name="itemCode" placeholder="Item Code" value={form.itemCode} onChange={handleChange} required />
      <Textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
      <Input name="unitOfMeasure" placeholder="Unit (kg, pieces)" value={form.unitOfMeasure} onChange={handleChange} required />
      <Input type="number" step="0.01" name="currentQuantity" placeholder="Current Quantity" value={form.currentQuantity} onChange={handleChange} />
      <Input type="number" step="0.01" name="reorderLevel" placeholder="Reorder Level" value={form.reorderLevel} onChange={handleChange} />
      <Input type="number" step="0.01" name="unitCost" placeholder="Unit Cost (₦)" value={form.unitCost} onChange={handleChange} />
      <Input type="number" step="0.01" name="sellingPrice" placeholder="Selling Price (₦)" value={form.sellingPrice} onChange={handleChange} />
      <Input name="location" placeholder="Storage Location" value={form.location} onChange={handleChange} />
      <Input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : (item ? "Update" : "Add")}
        </Button>
      </div>
    </form>
  )
}
