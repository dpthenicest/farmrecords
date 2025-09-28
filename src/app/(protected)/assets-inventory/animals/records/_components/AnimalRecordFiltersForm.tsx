"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"

interface AnimalRecordFiltersFormProps {
  onApplyFilters: (filters: any) => void
}

export function AnimalRecordFiltersForm({ onApplyFilters }: AnimalRecordFiltersFormProps) {
  const [batchId, setBatchId] = useState<number | "">("")
  const [animalId, setAnimalId] = useState<number | "">("")
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  const handleApply = () => {
    onApplyFilters({
      batchId: batchId || undefined,
      animalId: animalId || undefined,
      startDate: startDate?.toISOString().split("T")[0],
      endDate: endDate?.toISOString().split("T")[0],
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 border rounded-lg">
      <Input placeholder="Batch ID" value={batchId} onChange={(e) => setBatchId(Number(e.target.value))} className="w-[120px]" />
      <Input placeholder="Animal ID" value={animalId} onChange={(e) => setAnimalId(Number(e.target.value))} className="w-[120px]" />
      <DatePicker value={startDate} onChange={setStartDate} placeholder="Start Date" />
      <DatePicker value={endDate} onChange={setEndDate} placeholder="End Date" />
      <Button variant="secondary" onClick={handleApply}>Apply Filters</Button>
    </div>
  )
}
