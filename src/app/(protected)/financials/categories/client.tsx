"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"
import { useSalesExpenseCategories } from "@/hooks/useSalesExpenseCategories"

import { CategoryTabs } from "./_components/CategoryTab"
import { CategoryList } from "./_components/CategoryList"
import { CategoryForm } from "./_components/CategoryForm"

export default function SalesExpenseCategoriesClient() {
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)
  const [type, setType] = React.useState<"SALES" | "EXPENSE">("SALES")

  const { categories, totalPages, loading, error, refetch } =
    useSalesExpenseCategories({ page, limit, type })

  const [showForm, setShowForm] = React.useState(false)
  const [selectedCategory, setSelectedCategory] = React.useState<any>(null)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Sales & Expense Categories</h1>
        <Button onClick={() => setShowForm(true)}>+ Add Category</Button>
      </div>

      {/* Tabs */}
      <CategoryTabs value={type} onChange={setType} />

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {type === "SALES" ? "Sales Categories" : "Expense Categories"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CategoryList
            categories={categories}
            loading={loading}
            error={error}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            onEdit={(cat) => {
              setSelectedCategory(cat)
              setShowForm(true)
            }}
            onDelete={(cat) => console.log("delete", cat)}
          />
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        open={showForm}
        onOpenChange={setShowForm}
        title={selectedCategory ? "Edit Category" : "Add Category"}
      >
        <CategoryForm
          category={selectedCategory}
          onClose={() => {
            setSelectedCategory(null)
            setShowForm(false)
          }}
          onSaved={refetch}
        />
      </Modal>
    </div>
  )
}
