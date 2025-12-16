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
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Category</label>
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-[150px]">
            {category === "all" ? "All Categories" : category}
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="feed">Animal Feed</SelectItem>
            <SelectItem value="medicine">Medicine</SelectItem>
            <SelectItem value="equipment">Equipment</SelectItem>
            <SelectItem value="supplies">Supplies</SelectItem>
            <SelectItem value="seeds">Seeds</SelectItem>
            <SelectItem value="fertilizer">Fertilizer</SelectItem>
            <SelectItem value="fuel">Fuel</SelectItem>
            <SelectItem value="other">Other</SelectItem>
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
        <Button variant="default" onClick={onApplyFilters} className="h-9">
          Apply Filters
        </Button>
      </div>
    </div>
  )
}
