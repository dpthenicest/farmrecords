"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useSalesExpenseCategories } from "@/hooks/useSalesExpenseCategories"

interface InventoryFiltersProps {
  search: string
  onSearch: (value: string) => void
  category: string
  onCategoryChange: (value: string) => void
  lowStock: boolean
  onLowStockChange: (checked: boolean) => void
  onApplyFilters: () => void
}

export function InventoryFilters({
  search,
  onSearch,
  onCategoryChange,
  lowStock,
  onLowStockChange,
  onApplyFilters,
}: InventoryFiltersProps) {
  const [categoryType, setCategoryType] = React.useState<"SALES" | "EXPENSE" | "all-types">("all-types")
  const [specificCategory, setSpecificCategory] = React.useState("all-categories")

  // Fetch categories based on selected type
  const { categories, loading } = useSalesExpenseCategories({
    categoryType: categoryType === "all-types" ? undefined : categoryType,
    limit: 100, // Get all categories for the dropdown
  })

  // Reset specific category when type changes
  React.useEffect(() => {
    setSpecificCategory("all-categories")
  }, [categoryType])

  // Update parent category when specific category changes
  React.useEffect(() => {
    onCategoryChange(specificCategory === "all-categories" ? "" : specificCategory)
  }, [specificCategory, onCategoryChange])

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 border rounded-lg">
      {/* Category Type Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Category Type</label>
        <Select value={categoryType} onValueChange={(value: string) => setCategoryType(value as "SALES" | "EXPENSE" | "all-types")}>
          <SelectTrigger className="w-[150px]">
            {categoryType === "all-types" ? "All Types" : categoryType}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-types">All Types</SelectItem>
            <SelectItem value="SALES">Sales</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Specific Category Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Category</label>
        <Select 
          value={specificCategory} 
          onValueChange={setSpecificCategory}
          disabled={categoryType === "all-types"}
        >
          <SelectTrigger className="w-[180px]">
            {specificCategory === "all-categories" 
              ? (categoryType === "all-types" ? "Select Type First" : "All Categories")
              : specificCategory
            }
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-categories">All Categories</SelectItem>
            {loading ? (
              <SelectItem value="loading" disabled>Loading...</SelectItem>
            ) : (
              categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.categoryName}>
                  {cat.categoryName}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Low Stock Checkbox */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Stock Status</label>
        <label className="flex items-center gap-2 h-9">
          <Checkbox checked={lowStock} onCheckedChange={onLowStockChange} />
          <span className="text-sm">Low Stock Only</span>
        </label>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-1 flex-grow">
        <label className="text-xs font-medium text-muted-foreground">Search</label>
        <Input
          placeholder="Search by name or code..."
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Apply Button */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground invisible">Action</label>
        <Button variant="outline" onClick={onApplyFilters} className="h-9">
          Apply Filters
        </Button>
      </div>

      {/* Clear Filters Button */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground invisible">Clear</label>
        <Button 
          variant="outline" 
          onClick={() => {
            setCategoryType("all-types")
            setSpecificCategory("all-categories")
            onSearch("")
            onLowStockChange(false)
            onApplyFilters()
          }} 
          className="h-9"
        >
          Clear
        </Button>
      </div>
    </div>
  )
}
