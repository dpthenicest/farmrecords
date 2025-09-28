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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    console.log("submit inventory", form)
    onSaved()
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input name="itemName" placeholder="Item Name" value={form.itemName} onChange={handleChange} required />
      <Input name="itemCode" placeholder="Item Code" value={form.itemCode} onChange={handleChange} required />
      <Textarea name="description" placeholder="Description" value={form.description} onChange={handleChange} />
      <Input name="unitOfMeasure" placeholder="Unit (kg, pieces)" value={form.unitOfMeasure} onChange={handleChange} required />
      <Input type="number" name="currentQuantity" placeholder="Current Quantity" value={form.currentQuantity} onChange={handleChange} />
      <Input type="number" name="reorderLevel" placeholder="Reorder Level" value={form.reorderLevel} onChange={handleChange} />
      <Input type="number" name="unitCost" placeholder="Unit Cost (₦)" value={form.unitCost} onChange={handleChange} />
      <Input type="number" name="sellingPrice" placeholder="Selling Price (₦)" value={form.sellingPrice} onChange={handleChange} />
      <Input name="location" placeholder="Storage Location" value={form.location} onChange={handleChange} />
      <Input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit">{item ? "Update" : "Add"}</Button>
      </div>
    </form>
  )
}
