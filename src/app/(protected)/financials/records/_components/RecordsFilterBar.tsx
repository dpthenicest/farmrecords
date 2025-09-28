"use client"

import { useState, useEffect } from "react"
import { DatePicker } from "@/components/ui/date-picker"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select" 

interface FilterBarProps {
  filters: {
    transactionType?: "INCOME" | "EXPENSE" | "TRANSFER" | "ALL" | "" // Added "ALL" for clarity
    categoryId?: number
    startDate?: string
    endDate?: string
  }
  setFilters: (filters: any) => void
}

// FIX: Changed value: "" to a sentinel value like "ALL" to satisfy Radix SelectItem requirement.
const TRANSACTION_TYPES = [
  { value: "ALL", label: "All Types" }, 
  { value: "INCOME", label: "Income" },
  { value: "EXPENSE", label: "Expense" },
  { value: "TRANSFER", label: "Transfer" },
]

export function RecordsFilterBar({ filters, setFilters }: FilterBarProps) {
  // Local state to store temporary filter changes
  const [localFilters, setLocalFilters] = useState(filters)

  // Keep local state in sync when parent filters change
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const applyFilters = () => {
    // When applying filters, convert "ALL" back to undefined/empty string for the API/parent state if needed.
    const finalFilters = {
        ...localFilters,
        transactionType: localFilters.transactionType === "ALL" ? undefined : localFilters.transactionType
    }
    setFilters(finalFilters)
  }

  // Helper to determine the Select's current value (displaying "ALL" when it's undefined in the filters prop)
  const currentTransactionType = localFilters.transactionType || "ALL";

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 border rounded-lg">
      
      {/* 1. Transaction Type Select - FIX APPLIED HERE */}
      <Select
        // Use the helper value
        value={currentTransactionType} 
        onValueChange={(value) =>
          setLocalFilters((prev) => ({
            ...prev,
            // Keep the selected value, the conversion happens in applyFilters
            transactionType: value, 
          }))
        }
      >
        <SelectTrigger className="w-[150px]">
          {/* Display the current label based on the selected value */}
          {TRANSACTION_TYPES.find(t => t.value === currentTransactionType)?.label || "All Types"}
        </SelectTrigger>
        <SelectContent>
          {TRANSACTION_TYPES.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 2. Category Select - FIX APPLIED HERE (Category item value changed to "ALL_CATEGORIES") */}
      <Select
        // Use "ALL_CATEGORIES" as the sentinel value for the placeholder state
        value={localFilters.categoryId?.toString() ?? "ALL_CATEGORIES"}
        onValueChange={(value) =>
          setLocalFilters((prev) => ({
            ...prev,
            // Convert back to number, or undefined if "ALL_CATEGORIES" is selected
            categoryId: value === "ALL_CATEGORIES" ? undefined : Number(value), 
          }))
        }
      >
        <SelectTrigger className="w-[150px]">
          {/* This will need to display the selected category name */}
          {localFilters.categoryId ? `Category: ${localFilters.categoryId}` : "All Categories"} 
        </SelectTrigger>
        <SelectContent>
          {/* Changed value="" to value="ALL_CATEGORIES" */}
          <SelectItem value="ALL_CATEGORIES">All Categories</SelectItem>
          {/* TODO: populate from API and map to SelectItem */}
          {/* Example placeholder: */}
          <SelectItem value="1">Category A</SelectItem>
          <SelectItem value="2">Category B</SelectItem>
        </SelectContent>
      </Select>

      {/* DatePickers and Button remain the same */}
      <DatePicker
        value={localFilters.startDate ? new Date(localFilters.startDate) : undefined}
        onChange={(date) =>
          setLocalFilters((prev) => ({
            ...prev,
            startDate: date ? date.toISOString().split("T")[0] : undefined,
          }))
        }
      />
      <DatePicker
        value={localFilters.endDate ? new Date(localFilters.endDate) : undefined}
        onChange={(date) =>
          setLocalFilters((prev) => ({
            ...prev,
            endDate: date ? date.toISOString().split("T")[0] : undefined,
          }))
        }
      />
      <Button variant="secondary" onClick={applyFilters}>
        Apply Filters
      </Button>
    </div>
  )
}