"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { useCreateAnimalRecord, useUpdateAnimalRecord, useAnimalRecord } from "@/hooks/useAnimalRecords"
import { useAnimalBatches } from "@/hooks/useAnimalBatches"

interface AnimalRecordFormProps {
  recordId?: number
  onClose: () => void
  onSaved: () => void
}

const RECORD_TYPES = [
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
  { value: "HEALTHY", label: "Healthy" },
  { value: "SICK", label: "Sick" },
  { value: "RECOVERING", label: "Recovering" },
  { value: "QUARANTINE", label: "Quarantine" },
  { value: "DECEASED", label: "Deceased" }
]

export function AnimalRecordForm({ recordId, onClose, onSaved }: AnimalRecordFormProps) {
  const { record } = useAnimalRecord(recordId)
  const { batches } = useAnimalBatches({ limit: 100 })

  const [formData, setFormData] = useState({
    recordType: "FEEDING",
    batchId: "",
    weight: "",
    feedConsumption: "",
    medicationCost: "",
    healthStatus: "",
    observations: "",
    temperature: "",
    mortalityCount: "",
    productionOutput: "",
    notes: ""
  })

  const [recordDate, setRecordDate] = useState<Date | undefined>(new Date())
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { createRecord, loading: creating } = useCreateAnimalRecord()
  const { updateRecord, loading: updating } = useUpdateAnimalRecord()

  useEffect(() => {
    if (record) {
      setFormData({
        recordType: record.recordType || "FEEDING",
        batchId: record.batchId ? record.batchId.toString() : "",
        weight: record.weight ? Number(record.weight).toString() : "",
        feedConsumption: record.feedConsumption ? Number(record.feedConsumption).toString() : "",
        medicationCost: record.medicationCost ? Number(record.medicationCost).toString() : "",
        healthStatus: record.healthStatus || "",
        observations: record.observations || "",
        temperature: record.temperature ? Number(record.temperature).toString() : "",
        mortalityCount: record.mortalityCount ? record.mortalityCount.toString() : "",
        productionOutput: record.productionOutput ? Number(record.productionOutput).toString() : "",
        notes: record.notes || ""
      })
      setRecordDate(record.recordDate ? new Date(record.recordDate) : new Date())
    }
  }, [record])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.recordType) {
      newErrors.recordType = "Record type is required"
    }

    if (!recordDate) {
      newErrors.recordDate = "Record date is required"
    }

    if (!formData.batchId) {
      newErrors.batchId = "Animal batch selection is required"
    }

    // Type-specific validations
    if (formData.recordType === "WEIGHING" && !formData.weight) {
      newErrors.weight = "Weight is required for weighing records"
    }

    if (formData.recordType === "FEEDING" && !formData.feedConsumption) {
      newErrors.feedConsumption = "Feed consumption is required for feeding records"
    }

    if (formData.recordType === "HEALTH_CHECK" && !formData.healthStatus) {
      newErrors.healthStatus = "Health status is required for health check records"
    }

    if (formData.recordType === "PRODUCTION" && !formData.productionOutput) {
      newErrors.productionOutput = "Production output is required for production records"
    }

    if (formData.recordType === "MORTALITY" && !formData.mortalityCount) {
      newErrors.mortalityCount = "Mortality count is required for mortality records"
    }

    // General validations
    if (formData.weight && isNaN(Number(formData.weight))) {
      newErrors.weight = "Weight must be a valid number"
    }

    if (formData.feedConsumption && isNaN(Number(formData.feedConsumption))) {
      newErrors.feedConsumption = "Feed consumption must be a valid number"
    }

    if (formData.medicationCost && isNaN(Number(formData.medicationCost))) {
      newErrors.medicationCost = "Medication cost must be a valid number"
    }

    if (formData.temperature && (isNaN(Number(formData.temperature)) || Number(formData.temperature) < 0 || Number(formData.temperature) > 50)) {
      newErrors.temperature = "Temperature must be a valid number between 0 and 50"
    }

    if (formData.mortalityCount && (isNaN(Number(formData.mortalityCount)) || Number(formData.mortalityCount) < 0)) {
      newErrors.mortalityCount = "Mortality count must be a non-negative number"
    }

    if (formData.productionOutput && isNaN(Number(formData.productionOutput))) {
      newErrors.productionOutput = "Production output must be a valid number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const submitData = {
        recordType: formData.recordType,
        recordDate: recordDate,
        animalId: null,
        batchId: Number(formData.batchId),
        weight: formData.weight ? Number(formData.weight) : null,
        feedConsumption: formData.feedConsumption ? Number(formData.feedConsumption) : null,
        medicationCost: formData.medicationCost ? Number(formData.medicationCost) : null,
        healthStatus: formData.healthStatus || null,
        observations: formData.observations.trim() || null,
        temperature: formData.temperature ? Number(formData.temperature) : null,
        mortalityCount: formData.mortalityCount ? Number(formData.mortalityCount) : 0,
        productionOutput: formData.productionOutput ? Number(formData.productionOutput) : null,
        notes: formData.notes.trim() || null
      }

      if (recordId) {
        await updateRecord(recordId, submitData)
      } else {
        await createRecord(submitData)
      }

      onSaved()
      onClose()
    } catch (error: any) {
      console.error("Failed to save record:", error)
      if (error.message.includes("validation") || error.message.includes("required")) {
        setErrors({ general: error.message })
      } else {
        setErrors({ general: "Failed to save record. Please try again." })
      }
    }
  }

  const loading = creating || updating

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="recordType" className="text-sm font-medium">Record Type *</label>
              <select
                id="recordType"
                value={formData.recordType}
                onChange={(e) => handleChange("recordType", e.target.value)}
                className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                {RECORD_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              {errors.recordType && <p className="text-red-500 text-sm">{errors.recordType}</p>}
            </div>

            <div className="space-y-2">
              <label htmlFor="recordDate" className="text-sm font-medium">Record Date *</label>
              <DatePicker
                value={recordDate}
                onChange={setRecordDate}
              />
              {errors.recordDate && <p className="text-red-500 text-sm">{errors.recordDate}</p>}
            </div>
          </div>

          {/* Animal Batch Selection */}
          <div className="space-y-2">
            <label htmlFor="batchId" className="text-sm font-medium">Select Animal Batch *</label>
            <select
              id="batchId"
              value={formData.batchId}
              onChange={(e) => handleChange("batchId", e.target.value)}
              className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Select a batch</option>
              {batches?.map((batch) => (
                <option key={batch.id} value={batch.id.toString()}>
                  {batch.batchCode} - {batch.species} {batch.breed ? `(${batch.breed})` : ''} - {batch.currentQuantity} animals
                </option>
              ))}
            </select>
            {errors.batchId && <p className="text-red-500 text-sm">{errors.batchId}</p>}
          </div>

          {/* Measurements - Show based on record type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Weight - Show for WEIGHING, HEALTH_CHECK, GENERAL */}
            {(formData.recordType === "WEIGHING" || formData.recordType === "HEALTH_CHECK" || formData.recordType === "GENERAL") && (
              <div className="space-y-2">
                <label htmlFor="weight" className="text-sm font-medium">
                  Weight (kg) {formData.recordType === "WEIGHING" ? "*" : ""}
                </label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  required={formData.recordType === "WEIGHING"}
                />
                {errors.weight && <p className="text-red-500 text-sm">{errors.weight}</p>}
              </div>
            )}

            {/* Temperature - Show for HEALTH_CHECK, VACCINATION */}
            {(formData.recordType === "HEALTH_CHECK" || formData.recordType === "VACCINATION") && (
              <div className="space-y-2">
                <label htmlFor="temperature" className="text-sm font-medium">Temperature (°C)</label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={formData.temperature}
                  onChange={(e) => handleChange("temperature", e.target.value)}
                />
                {errors.temperature && <p className="text-red-500 text-sm">{errors.temperature}</p>}
              </div>
            )}

            {/* Feed Consumption - Show for FEEDING */}
            {formData.recordType === "FEEDING" && (
              <div className="space-y-2">
                <label htmlFor="feedConsumption" className="text-sm font-medium">Feed Consumption (kg) *</label>
                <Input
                  id="feedConsumption"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={formData.feedConsumption}
                  onChange={(e) => handleChange("feedConsumption", e.target.value)}
                  required
                />
                {errors.feedConsumption && <p className="text-red-500 text-sm">{errors.feedConsumption}</p>}
              </div>
            )}
          </div>

          {/* Health and Production - Show based on record type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Health Status - Show for HEALTH_CHECK, VACCINATION, GENERAL */}
            {(formData.recordType === "HEALTH_CHECK" || formData.recordType === "VACCINATION" || formData.recordType === "GENERAL") && (
              <div className="space-y-2">
                <label htmlFor="healthStatus" className="text-sm font-medium">
                  Health Status {formData.recordType === "HEALTH_CHECK" ? "*" : ""}
                </label>
                <select
                  id="healthStatus"
                  value={formData.healthStatus}
                  onChange={(e) => handleChange("healthStatus", e.target.value)}
                  className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
                  required={formData.recordType === "HEALTH_CHECK"}
                >
                  <option value="">Select status</option>
                  {HEALTH_STATUSES.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Medication Cost - Show for HEALTH_CHECK, VACCINATION */}
            {(formData.recordType === "HEALTH_CHECK" || formData.recordType === "VACCINATION") && (
              <div className="space-y-2">
                <label htmlFor="medicationCost" className="text-sm font-medium">Medication Cost (₦)</label>
                <Input
                  id="medicationCost"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={formData.medicationCost}
                  onChange={(e) => handleChange("medicationCost", e.target.value)}
                />
                {errors.medicationCost && <p className="text-red-500 text-sm">{errors.medicationCost}</p>}
              </div>
            )}

            {/* Production Output - Show for PRODUCTION, BREEDING */}
            {(formData.recordType === "PRODUCTION" || formData.recordType === "BREEDING") && (
              <div className="space-y-2">
                <label htmlFor="productionOutput" className="text-sm font-medium">
                  {formData.recordType === "PRODUCTION" ? "Production Output *" : "Breeding Output"}
                </label>
                <Input
                  id="productionOutput"
                  type="number"
                  step="0.1"
                  placeholder="0.0"
                  value={formData.productionOutput}
                  onChange={(e) => handleChange("productionOutput", e.target.value)}
                  required={formData.recordType === "PRODUCTION"}
                />
                {errors.productionOutput && <p className="text-red-500 text-sm">{errors.productionOutput}</p>}
              </div>
            )}
          </div>

          {/* Mortality Count (only show for mortality records) */}
          {formData.recordType === "MORTALITY" && (
            <div className="space-y-2">
              <label htmlFor="mortalityCount" className="text-sm font-medium">Mortality Count *</label>
              <Input
                id="mortalityCount"
                type="number"
                min="0"
                placeholder="0"
                value={formData.mortalityCount}
                onChange={(e) => handleChange("mortalityCount", e.target.value)}
              />
              {errors.mortalityCount && <p className="text-red-500 text-sm">{errors.mortalityCount}</p>}
            </div>
          )}

          {/* Observations and Notes */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="observations" className="text-sm font-medium">Observations</label>
              <textarea
                id="observations"
                placeholder="Record any observations about the batch..."
                value={formData.observations}
                onChange={(e) => handleChange("observations", e.target.value)}
                className="w-full rounded border border-gray-300 p-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">Additional Notes</label>
              <textarea
                id="notes"
                placeholder="Any additional notes or comments..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                className="w-full rounded border border-gray-300 p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-green-600"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : recordId ? "Update Record" : "Create Record"}
            </Button>
          </div>
        </form>
    </div>
  )
}
