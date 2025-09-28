"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker" // ✅ import your new DatePicker

const STATUSES = ["all", "draft", "sent", "paid", "overdue"]

export function InvoiceFilters({
  search,
  onSearch,
  status,
  onStatusChange,
  startDate,
  endDate,
  onDateChange,
  onApplyFilters, // 🔑 NEW PROP
}: {
  search: string
  onSearch: (val: string) => void
  status: string
  onStatusChange: (val: string) => void
  startDate: string
  endDate: string
  onDateChange: (range: { start: string; end: string }) => void
  onApplyFilters: () => void // 🔑 NEW PROP TYPE
}) {
  const [customerQuery, setCustomerQuery] = useState(search)
  const [pendingStatus, setPendingStatus] = useState(status)

  const [pendingStart, setPendingStart] = useState<Date | undefined>(
    startDate ? new Date(startDate) : undefined
  )
  const [pendingEnd, setPendingEnd] = useState<Date | undefined>(
    endDate ? new Date(endDate) : undefined
  )

  // 🔑 MODIFIED: handleApplyFilters now syncs local state to parent pending state
  const handleApplyFilters = () => {
    // 1. Sync local fields (query, status, dates) back to parent's PENDING state
    onSearch(customerQuery)
    onStatusChange(pendingStatus)
    onDateChange({
      start: pendingStart ? pendingStart.toISOString().split("T")[0] : "",
      end: pendingEnd ? pendingEnd.toISOString().split("T")[0] : "",
    })

    // 2. Trigger the final application function in the parent (InvoicesClient)
    onApplyFilters();
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 border rounded-lg">

      {/* 1. Status Select */}
      <Select value={pendingStatus} onValueChange={setPendingStatus}>
        <SelectTrigger className="w-[150px]">
          {pendingStatus[0].toUpperCase() + pendingStatus.slice(1)}
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 2. Date Range Group (Start Date) - using custom DatePicker */}
      <DatePicker value={pendingStart} onChange={setPendingStart} />

      {/* 3. Date Range Group (End Date) - using custom DatePicker */}
      <DatePicker value={pendingEnd} onChange={setPendingEnd} />

      {/* 4. Customer Search Input */}
      <Input
        placeholder="Search by customer..."
        value={customerQuery}
        onChange={(e) => setCustomerQuery(e.target.value)}
        className="max-w-xs flex-grow"
      />

      {/* 5. Apply Button */}
      <Button variant="secondary" onClick={handleApplyFilters}>
        Apply Filters
      </Button>
    </div>
  )
}
