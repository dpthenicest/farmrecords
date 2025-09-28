"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"

interface AnimalBatchFiltersProps {
  species?: string
  breed?: string
  batchStatus?: string
  startDate?: string
  endDate?: string
  batchCode?: string
  location?: string
  onApplyFilters: (filters: {
    species?: string
    breed?: string
    batchStatus?: string
    startDate?: string
    endDate?: string
    batchCode?: string
    location?: string
  }) => void
}

const SPECIES = ["all", "fish", "chicken", "goat"]
const STATUS = ["all", "active", "growing", "producing", "mature"]

export function AnimalBatchFilters({
  species: initialSpecies = "all",
  breed: initialBreed = "",
  batchStatus: initialStatus = "all",
  startDate: initialStartDate = "",
  endDate: initialEndDate = "",
  batchCode: initialBatchCode = "",
  location: initialLocation = "",
  onApplyFilters,
}: AnimalBatchFiltersProps) {

  const [species, setSpecies] = useState(initialSpecies)
  const [status, setStatus] = useState(initialStatus)
  const [breed, setBreed] = useState(initialBreed)
  const [batchCode, setBatchCode] = useState(initialBatchCode)
  const [location, setLocation] = useState(initialLocation)

  const [start, setStart] = useState<Date | undefined>(initialStartDate ? new Date(initialStartDate) : undefined)
  const [end, setEnd] = useState<Date | undefined>(initialEndDate ? new Date(initialEndDate) : undefined)

  const handleApply = () => {
    onApplyFilters({
      species: species !== "all" ? species : undefined,
      batchStatus: status !== "all" ? status : undefined,
      breed: breed || undefined,
      batchCode: batchCode || undefined,
      location: location || undefined,
      startDate: start?.toISOString().split("T")[0],
      endDate: end?.toISOString().split("T")[0],
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 border rounded-lg">

      {/* Species */}
      <Select value={species} onValueChange={setSpecies}>
        <SelectTrigger className="w-[120px]">Species</SelectTrigger>
        <SelectContent>
          {SPECIES.map(s => <SelectItem key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-[120px]">Status</SelectTrigger>
        <SelectContent>
          {STATUS.map(s => <SelectItem key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</SelectItem>)}
        </SelectContent>
      </Select>

      {/* Breed */}
      <Input
        placeholder="Breed"
        value={breed}
        onChange={(e) => setBreed(e.target.value)}
        className="w-[150px]"
      />

      {/* Batch Code */}
      <Input
        placeholder="Batch Code"
        value={batchCode}
        onChange={(e) => setBatchCode(e.target.value)}
        className="w-[150px]"
      />

      {/* Location */}
      <Input
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="w-[150px]"
      />

      {/* Start Date */}
      <DatePicker value={start} onChange={setStart} placeholder="Start Date" />

      {/* End Date */}
      <DatePicker value={end} onChange={setEnd} placeholder="End Date" />

      {/* Apply Filters */}
      <Button variant="secondary" onClick={handleApply}>Apply Filters</Button>
    </div>
  )
}
