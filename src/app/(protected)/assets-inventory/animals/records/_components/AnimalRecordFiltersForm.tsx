"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useAnimals } from "@/hooks/useAnimals"
import { useAnimalBatches } from "@/hooks/useAnimalBatches"

interface AnimalRecordFiltersFormProps {
  onApplyFilters: (filters: any) => void
}

const HEALTH_STATUSES = [
  { value: "", label: "All Health Statuses" },
  { value: "HEALTHY", label: "Healthy" },
  { value: "SICK", label: "Sick" },
  { value: "RECOVERING", label: "Recovering" },
  { value: "QUARANTINE", label: "Quarantine" },
  { value: "DECEASED", label: "Deceased" }
]

export function AnimalRecordFiltersForm({ onApplyFilters }: AnimalRecordFiltersFormProps) {
  const [batchId, setBatchId] = useState<string>("")
  const [animalId, setAnimalId] = useState<string>("")
  const [healthStatus, setHealthStatus] = useState<string>("")
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  const { animals } = useAnimals({ limit: 100 })
  const { animalBatches } = useAnimalBatches({ limit: 100 })

  const handleApply = () => {
    onApplyFilters({
      batchId: batchId ? Number(batchId) : undefined,
      animalId: animalId ? Number(animalId) : undefined,
      healthStatus: healthStatus || undefined,
      startDate: startDate?.toISOString().split("T")[0],
      endDate: endDate?.toISOString().split("T")[0],
    })
  }

  const handleClear = () => {
    setBatchId("")
    setAnimalId("")
    setHealthStatus("")
    setStartDate(undefined)
    setEndDate(undefined)
    onApplyFilters({})
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 border rounded-lg">
      <div className="flex flex-wrap items-center gap-3">
        {/* Animal Selection */}
        <div className="min-w-[200px]">
          <Select
            value={animalId}
            onValueChange={setAnimalId}
          >
            <option value="">All Animals</option>
            {animals?.map((animal) => (
              <option key={animal.id} value={animal.id.toString()}>
                🐄 {animal.animalTag} - {animal.species}
              </option>
            ))}
          </Select>
        </div>

        {/* Batch Selection */}
        <div className="min-w-[200px]">
          <Select
            value={batchId}
            onValueChange={setBatchId}
          >
            <option value="">All Batches</option>
            {animalBatches?.map((batch) => (
              <option key={batch.id} value={batch.id.toString()}>
                📦 {batch.batchCode} - {batch.species}
              </option>
            ))}
          </Select>
        </div>

        {/* Health Status */}
        <div className="min-w-[180px]">
          <Select
            value={healthStatus}
            onValueChange={setHealthStatus}
          >
            {HEALTH_STATUSES.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Date Range */}
        <DatePicker 
          value={startDate} 
          onChange={setStartDate} 
          placeholder="Start Date" 
        />
        <DatePicker 
          value={endDate} 
          onChange={setEndDate} 
          placeholder="End Date" 
        />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleApply}>
            Apply Filters
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(animalId || batchId || healthStatus || startDate || endDate) && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {animalId && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              Animal: {animals?.find(a => a.id.toString() === animalId)?.animalTag}
            </span>
          )}
          {batchId && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              Batch: {animalBatches?.find(b => b.id.toString() === batchId)?.batchCode}
            </span>
          )}
          {healthStatus && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
              Health: {healthStatus}
            </span>
          )}
          {startDate && (
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
              From: {startDate.toLocaleDateString()}
            </span>
          )}
          {endDate && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
              To: {endDate.toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
