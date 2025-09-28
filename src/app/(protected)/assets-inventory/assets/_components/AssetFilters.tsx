"use client"

import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

const TYPES = ["all", "infrastructure", "equipment", "vehicles"]

function formatLabel(type?: string) {
  if (!type) return "Select Type"
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export function AssetFilters({
  assetType,
  onTypeChange,
  onApplyFilters,
}: {
  assetType?: string
  onTypeChange: (val: string) => void
  onApplyFilters: () => void
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 border rounded-lg">
      <Select value={assetType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-[200px]">
          {formatLabel(assetType)}
        </SelectTrigger>
        <SelectContent>
          {TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {formatLabel(t)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button variant="secondary" onClick={onApplyFilters}>
        Apply Filters
      </Button>
    </div>
  )
}
