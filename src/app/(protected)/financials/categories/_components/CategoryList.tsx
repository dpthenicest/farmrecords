"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TablePagination } from "@/components/ui/table"
import { Edit, Trash2, Loader2 } from "lucide-react"

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
  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    )
  }
  
  if (error) {
    return <div className="text-red-600 text-center py-6">Error: {error.message}</div>
  }
  
  if (!categories?.length) {
    return <div className="text-gray-500 text-center py-6">No categories found</div>
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat: any) => (
          <Card
            key={cat.id}
            className="p-4 border rounded-lg flex flex-col justify-between"
          >
            <div>
              <h3 className="font-semibold text-lg">{cat.categoryName}</h3>
              <p className="text-sm text-gray-500 mb-2">{cat.description || "No description"}</p>
              <span className={`inline-block px-2 py-1 rounded text-xs ${
                cat.categoryType === 'SALES' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
              }`}>
                {cat.categoryType}
              </span>
            </div>
            <div className="flex items-center justify-end gap-1 mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(cat)}
                title="Edit"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(cat)}
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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
