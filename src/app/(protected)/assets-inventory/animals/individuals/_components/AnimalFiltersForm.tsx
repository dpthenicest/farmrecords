"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"

const SPECIES = ["all", "fish", "chicken", "goat"]
const HEALTH_STATUS = ["all", "healthy", "sick", "recovering"]

export function AnimalFiltersForm({ onApplyFilters }: { onApplyFilters: (filters: any) => void }) {
  const [species, setSpecies] = useState("all")
  const [batch, setBatch] = useState("")
  const [healthStatus, setHealthStatus] = useState("all")
  const [start, setStart] = useState<Date | undefined>()
  const [end, setEnd] = useState<Date | undefined>()

  const handleApply = () => {
    onApplyFilters({
      species: species !== "all" ? species : undefined,
      batch: batch || undefined,
      healthStatus: healthStatus !== "all" ? healthStatus : undefined,
      startDate: start?.toISOString().split("T")[0],
      endDate: end?.toISOString().split("T")[0],
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 border rounded-lg">
      <Select value={species} onValueChange={setSpecies}>
        <SelectTrigger className="w-[120px]">Species</SelectTrigger>
        <SelectContent>
          {SPECIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>

      <Input placeholder="Batch" value={batch} onChange={e => setBatch(e.target.value)} className="w-[150px]" />

      <Select value={healthStatus} onValueChange={setHealthStatus}>
        <SelectTrigger className="w-[120px]">Health</SelectTrigger>
        <SelectContent>
          {HEALTH_STATUS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
        </SelectContent>
      </Select>

      <DatePicker value={start} onChange={setStart} placeholder="Start Date" />
      <DatePicker value={end} onChange={setEnd} placeholder="End Date" />

      <Button variant="secondary" onClick={handleApply}>Apply Filters</Button>
    </div>
  )
}
