"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"

const STATUSES = ["all", "draft", "sent", "received", "partial", "cancelled"]

interface PurchaseOrderFiltersProps {
  search: string
  onSearch: (val: string) => void
  status: string
  onStatusChange: (val: string) => void
  startDate: string
  endDate: string
  onDateChange: (range: { start: string; end: string }) => void
  onApplyFilters: () => void
}

export function PurchaseOrderFilters({
  search,
  onSearch,
  status,
  onStatusChange,
  startDate,
  endDate,
  onDateChange,
  onApplyFilters,
}: PurchaseOrderFiltersProps) {
  // 🔑 Local "pending" state (not applied until user clicks Apply)
  const [pendingSearch, setPendingSearch] = useState(search)
  const [pendingStatus, setPendingStatus] = useState(status)
  const [pendingStart, setPendingStart] = useState<Date | undefined>(
    startDate ? new Date(startDate) : undefined
  )
  const [pendingEnd, setPendingEnd] = useState<Date | undefined>(
    endDate ? new Date(endDate) : undefined
  )

  const handleApplyFilters = () => {
    onSearch(pendingSearch)
    onStatusChange(pendingStatus)
    onDateChange({
      start: pendingStart ? pendingStart.toISOString().split("T")[0] : "",
      end: pendingEnd ? pendingEnd.toISOString().split("T")[0] : "",
    })
    onApplyFilters()
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 border rounded-lg">
      {/* Status Select */}
      <Select value={pendingStatus} onValueChange={setPendingStatus}>
        <SelectTrigger className="w-[150px]">
          {pendingStatus
            ? pendingStatus[0].toUpperCase() + pendingStatus.slice(1)
            : "All"}
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s[0].toUpperCase() + s.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Start Date */}
      <DatePicker value={pendingStart} onChange={setPendingStart} />

      {/* End Date */}
      <DatePicker value={pendingEnd} onChange={setPendingEnd} />

      {/* Search Input */}
      <Input
        placeholder="Search by PO number..."
        value={pendingSearch}
        onChange={(e) => setPendingSearch(e.target.value)}
        className="max-w-xs flex-grow"
      />

      {/* Apply Button */}
      <Button variant="secondary" onClick={handleApplyFilters}>
        Apply Filters
      </Button>
    </div>
  )
}
