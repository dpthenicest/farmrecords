"use client"

import { Card } from "@/components/ui/card"
import { ActionMenu } from "@/components/ui/action-menu"
import { TablePagination } from "@/components/ui/table"

export function CategoryList({
  categories,
  loading,
  error,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}: any) {
  if (loading) return <div>Loading categories...</div>
  if (error) return <div className="text-red-600">Error: {error.message}</div>
  if (!categories?.length) return <div>No categories found</div>

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat: any) => (
          <Card
            key={cat.id}
            className="p-4 border rounded-lg flex flex-col justify-between"
          >
            <div>
              <h3 className="font-semibold text-lg">{cat.name}</h3>
              <p className="text-sm text-gray-500">{cat.description}</p>
            </div>
            <div className="flex items-center justify-between mt-4">
              <span
                className="inline-block w-4 h-4 rounded-full"
                style={{ backgroundColor: cat.color || "#ccc" }}
              />
              <ActionMenu
                showEdit
                showDelete
                onEdit={() => onEdit(cat)}
                onDelete={() => onDelete(cat)}
              />
            </div>
          </Card>
        ))}
      </div>

      <TablePagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        limit={10}
        onLimitChange={() => {}}
      />
    </div>
  )
}
