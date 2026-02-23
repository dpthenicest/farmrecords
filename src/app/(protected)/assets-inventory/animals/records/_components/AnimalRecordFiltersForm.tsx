"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { useAnimalBatches } from "@/hooks/useAnimalBatches"

interface AnimalRecordFiltersFormProps {
  onApplyFilters: (filters: any) => void
}

const RECORD_TYPES = [
  { value: "", label: "All Record Types" },
  { value: "FEEDING", label: "Feeding" },
  { value: "WEIGHING", label: "Weighing" },
  { value: "HEALTH_CHECK", label: "Health Check" },
  { value: "VACCINATION", label: "Vaccination" },
  { value: "PRODUCTION", label: "Production" },
  { value: "MORTALITY", label: "Mortality" },
  { value: "BREEDING", label: "Breeding" },
  { value: "GENERAL", label: "General" }
]

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
  const [recordType, setRecordType] = useState<string>("")
  const [healthStatus, setHealthStatus] = useState<string>("")
  const [startDate, setStartDate] = useState<Date | undefined>()
  const [endDate, setEndDate] = useState<Date | undefined>()

  const { batches } = useAnimalBatches({ limit: 100 })

  const handleApply = () => {
    onApplyFilters({
      batchId: batchId ? Number(batchId) : undefined,
      recordType: recordType || undefined,
      healthStatus: healthStatus || undefined,
      startDate: startDate?.toISOString().split("T")[0],
      endDate: endDate?.toISOString().split("T")[0],
    })
  }

  const handleClear = () => {
    setBatchId("")
    setRecordType("")
    setHealthStatus("")
    setStartDate(undefined)
    setEndDate(undefined)
    onApplyFilters({})
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 border rounded-lg">
      <div className="flex flex-wrap items-center gap-3">
        {/* Batch Selection */}
        <div className="min-w-[200px]">
          <select
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            <option value="">All Batches</option>
            {batches?.map((batch) => (
              <option key={batch.id} value={batch.id.toString()}>
                📦 {batch.batchCode} - {batch.species}
              </option>
            ))}
          </select>
        </div>

        {/* Record Type */}
        <div className="min-w-[180px]">
          <select
            value={recordType}
            onChange={(e) => setRecordType(e.target.value)}
            className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            {RECORD_TYPES.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Health Status */}
        <div className="min-w-[180px]">
          <select
            value={healthStatus}
            onChange={(e) => setHealthStatus(e.target.value)}
            className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600"
          >
            {HEALTH_STATUSES.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="min-w-[150px]">
          <DatePicker 
            value={startDate} 
            onChange={setStartDate}
          />
        </div>
        <div className="min-w-[150px]">
          <DatePicker 
            value={endDate} 
            onChange={setEndDate}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="secondary" onClick={handleApply} size="sm">
            Apply Filters
          </Button>
          <Button variant="secondary" onClick={handleClear} size="sm">
            Clear
          </Button>
        </div>
      </div>

      {/* Active Filters Display */}
      {(batchId || recordType || healthStatus || startDate || endDate) && (
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          <span className="text-sm text-gray-600">Active filters:</span>
          {batchId && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
              Batch: {batches?.find(b => b.id.toString() === batchId)?.batchCode}
            </span>
          )}
          {recordType && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
              Type: {RECORD_TYPES.find(t => t.value === recordType)?.label}
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
