"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

export function InventoryFilters({
  search,
  onSearch,
  category,
  onCategoryChange,
  lowStock,
  onLowStockChange,
  onApplyFilters,
}: any) {
  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 border rounded-lg">
      {/* Category */}
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-[150px]">
          {category === "all" ? "All Categories" : category}
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="food">Food</SelectItem>
          <SelectItem value="drinks">Drinks</SelectItem>
          <SelectItem value="supplies">Supplies</SelectItem>
        </SelectContent>
      </Select>

      {/* Low Stock Checkbox */}
      <label className="flex items-center gap-2">
        <Checkbox checked={lowStock} onCheckedChange={onLowStockChange} />
        Low Stock Only
      </label>

      {/* Search */}
      <Input
        placeholder="Search items..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="max-w-xs flex-grow"
      />

      {/* Apply Button */}
      <Button variant="secondary" onClick={onApplyFilters}>
        Apply Filters
      </Button>
    </div>
  )
}
