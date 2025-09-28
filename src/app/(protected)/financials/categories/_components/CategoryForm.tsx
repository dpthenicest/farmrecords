"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useCreateSalesExpenseCategory, useUpdateSalesExpenseCategory } from "@/hooks/useSalesExpenseCategories"

export function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category?: any
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = React.useState({
    name: category?.name || "",
    type: category?.type || "SALES",
    description: category?.description || "",
    color: category?.color || "#cccccc",
  })

  const { createCategory, loading: creating } = useCreateSalesExpenseCategory()
  const { updateCategory, loading: updating } = useUpdateSalesExpenseCategory()

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (category) {
        await updateCategory(category.id, form)
      } else {
        await createCategory(form)
      }
      onSaved()
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="name"
        placeholder="Category Name"
        value={form.name}
        onChange={handleChange}
        required
      />

      <select
        name="type"
        value={form.type}
        onChange={(e) => setForm({ ...form, type: e.target.value })}
        className="w-full border rounded p-2"
      >
        <option value="SALES">Sales</option>
        <option value="EXPENSE">Expense</option>
      </select>

      <Textarea
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Color</label>
        <input
          type="color"
          name="color"
          value={form.color}
          onChange={handleChange}
          className="w-12 h-8 border rounded"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={creating || updating}>
          {category ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  )
}
