"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useCreateSalesExpenseCategory, useUpdateSalesExpenseCategory } from "@/hooks/useSalesExpenseCategories"

export function CategoryForm({
  category,
  defaultType = "SALES",
  onClose,
  onSaved,
}: {
  category?: any
  defaultType?: "SALES" | "EXPENSE"
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = React.useState({
    categoryName: category?.categoryName || "",
    categoryType: category?.categoryType || defaultType,
    description: category?.description || "",
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label htmlFor="categoryName" className="text-sm font-medium text-gray-700">
          Category Name *
        </label>
        <Input
          id="categoryName"
          name="categoryName"
          placeholder="Enter category name"
          value={form.categoryName}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="categoryType" className="text-sm font-medium text-gray-700">
          Category Type *
        </label>
        <select
          id="categoryType"
          name="categoryType"
          value={form.categoryType}
          onChange={(e) => setForm({ ...form, categoryType: e.target.value })}
          className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
        >
          <option value="SALES">Sales Category</option>
          <option value="EXPENSE">Expense Category</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          placeholder="Enter category description (optional)"
          value={form.description}
          onChange={handleChange}
          className="w-full rounded border border-gray-300 p-3 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent resize-vertical"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={creating || updating}>
          {creating || updating ? "Saving..." : (category ? "Update Category" : "Create Category")}
        </Button>
      </div>
    </form>
  )
}
