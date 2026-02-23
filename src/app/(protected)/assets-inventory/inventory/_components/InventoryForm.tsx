"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { useSalesExpenseCategories } from "@/hooks/useSalesExpenseCategories"

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
    currentQuantity: item?.currentQuantity ? String(item.currentQuantity) : "",
    reorderLevel: item?.reorderLevel ? String(item.reorderLevel) : "",
    unitCost: item?.unitCost ? String(item.unitCost) : "",
    sellingPrice: item?.sellingPrice ? String(item.sellingPrice) : "",
    location: item?.location || "",
    categoryId: item?.categoryId ? String(item.categoryId) : "",
  })

  const [expiryDate, setExpiryDate] = React.useState<Date | undefined>(
    item?.expiryDate ? new Date(item.expiryDate) : undefined
  )

  // Fetch categories for the dropdown
  const { categories, loading: categoriesLoading, error: categoriesError } = useSalesExpenseCategories({ 
    limit: 100,
    isActive: true 
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
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
          currentQuantity: Number(form.currentQuantity) || 0,
          reorderLevel: Number(form.reorderLevel) || 0,
          unitCost: Number(form.unitCost) || 0,
          sellingPrice: Number(form.sellingPrice) || 0,
          categoryId: form.categoryId ? Number(form.categoryId) : null,
          expiryDate: expiryDate ? expiryDate.toISOString() : null,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="itemName" className="text-sm font-medium text-gray-700">
          Item Name *
        </label>
        <Input 
          id="itemName"
          name="itemName" 
          placeholder="Enter item name" 
          value={form.itemName} 
          onChange={handleChange} 
          required 
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="itemCode" className="text-sm font-medium text-gray-700">
          Item Code *
        </label>
        <Input 
          id="itemCode"
          name="itemCode" 
          placeholder="Enter unique item code" 
          value={form.itemCode} 
          onChange={handleChange} 
          required 
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-gray-700">
          Description
        </label>
        <Textarea 
          id="description"
          name="description" 
          placeholder="Enter item description (optional)" 
          value={form.description} 
          onChange={handleChange} 
        />
      </div>
      
      {/* Category Selection */}
      <div className="space-y-2">
        <label htmlFor="categoryId" className="text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="categoryId"
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          disabled={categoriesLoading}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">
            {categoriesLoading ? "Loading categories..." : 
             categoriesError ? "Error loading categories" :
             "Select category (optional)..."}
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.categoryName} ({category.categoryType})
            </option>
          ))}
        </select>
        {categoriesError && (
          <div className="text-xs text-red-600">
            {categoriesError.message}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <label htmlFor="unitOfMeasure" className="text-sm font-medium text-gray-700">
          Unit of Measure *
        </label>
        <Input 
          id="unitOfMeasure"
          name="unitOfMeasure" 
          placeholder="e.g., 5 kg, 10 pieces, 15 liters" 
          value={form.unitOfMeasure} 
          onChange={handleChange} 
          required 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="currentQuantity" className="text-sm font-medium text-gray-700">
            Current Quantity
          </label>
          <Input 
            id="currentQuantity"
            type="number" 
            step="0.01" 
            name="currentQuantity" 
            placeholder="0.00" 
            value={form.currentQuantity} 
            onChange={handleChange} 
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="reorderLevel" className="text-sm font-medium text-gray-700">
            Reorder Level
          </label>
          <Input 
            id="reorderLevel"
            type="number" 
            step="0.01" 
            name="reorderLevel" 
            placeholder="0.00" 
            value={form.reorderLevel} 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="unitCost" className="text-sm font-medium text-gray-700">
            Unit Cost (₦)
          </label>
          <Input 
            id="unitCost"
            type="number" 
            step="0.01" 
            name="unitCost" 
            placeholder="0.00" 
            value={form.unitCost} 
            onChange={handleChange} 
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="sellingPrice" className="text-sm font-medium text-gray-700">
            Selling Price (₦)
          </label>
          <Input 
            id="sellingPrice"
            type="number" 
            step="0.01" 
            name="sellingPrice" 
            placeholder="0.00" 
            value={form.sellingPrice} 
            onChange={handleChange} 
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="location" className="text-sm font-medium text-gray-700">
          Storage Location
        </label>
        <Input 
          id="location"
          name="location" 
          placeholder="e.g., Warehouse A, Section 1" 
          value={form.location} 
          onChange={handleChange} 
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Expiry Date</label>
        <DatePicker value={expiryDate} onChange={setExpiryDate} />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : (item ? "Update Item" : "Add Item")}
        </Button>
      </div>
    </form>
  )
}
