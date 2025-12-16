"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCreateAnimalRecord, useUpdateAnimalRecord, useAnimalRecord } from "@/hooks/useAnimalRecords"
import { useAnimals } from "@/hooks/useAnimals"
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
  const { animals } = useAnimals({ limit: 100 })
  const { animalBatches } = useAnimalBatches({ limit: 100 })

  const [formData, setFormData] = useState({
    recordType: "FEEDING",
    recordDate: new Date().toISOString().split('T')[0],
    animalId: "",
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

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [associationType, setAssociationType] = useState<"animal" | "batch">("animal")

  const { createRecord, loading: creating } = useCreateAnimalRecord()
  const { updateRecord, loading: updating } = useUpdateAnimalRecord()

  useEffect(() => {
    if (record) {
      setFormData({
        recordType: record.recordType || "FEEDING",
        recordDate: record.recordDate ? new Date(record.recordDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        animalId: record.animalId ? record.animalId.toString() : "",
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
      setAssociationType(record.animalId ? "animal" : "batch")
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

    if (!formData.recordDate) {
      newErrors.recordDate = "Record date is required"
    }

    if (associationType === "animal" && !formData.animalId) {
      newErrors.animalId = "Animal selection is required"
    }

    if (associationType === "batch" && !formData.batchId) {
      newErrors.batchId = "Batch selection is required"
    }

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
        recordDate: new Date(formData.recordDate),
        animalId: associationType === "animal" && formData.animalId ? Number(formData.animalId) : null,
        batchId: associationType === "batch" && formData.batchId ? Number(formData.batchId) : null,
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
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>{recordId ? "Edit Animal Record" : "Add New Animal Record"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="recordType">Record Type *</Label>
              <Select
                value={formData.recordType}
                onValueChange={(value) => handleChange("recordType", value)}
              >
                {RECORD_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Select>
              {errors.recordType && <p className="text-red-500 text-sm">{errors.recordType}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="recordDate">Record Date *</Label>
              <Input
                id="recordDate"
                type="date"
                value={formData.recordDate}
                onChange={(e) => handleChange("recordDate", e.target.value)}
                className={errors.recordDate ? "border-red-500" : ""}
              />
              {errors.recordDate && <p className="text-red-500 text-sm">{errors.recordDate}</p>}
            </div>
          </div>

          {/* Animal/Batch Association */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Association Type *</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="associationType"
                    value="animal"
                    checked={associationType === "animal"}
                    onChange={(e) => {
                      setAssociationType("animal")
                      handleChange("batchId", "")
                    }}
                  />
                  <span>Individual Animal</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="associationType"
                    value="batch"
                    checked={associationType === "batch"}
                    onChange={(e) => {
                      setAssociationType("batch")
                      handleChange("animalId", "")
                    }}
                  />
                  <span>Animal Batch</span>
                </label>
              </div>
            </div>

            {associationType === "animal" ? (
              <div className="space-y-2">
                <Label htmlFor="animalId">Select Animal *</Label>
                <Select
                  value={formData.animalId}
                  onValueChange={(value) => handleChange("animalId", value)}
                >
                  <option value="">Select an animal</option>
                  {animals?.map((animal) => (
                    <option key={animal.id} value={animal.id.toString()}>
                      {animal.animalTag} - {animal.species} ({animal.breed || "Unknown breed"})
                    </option>
                  ))}
                </Select>
                {errors.animalId && <p className="text-red-500 text-sm">{errors.animalId}</p>}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="batchId">Select Batch *</Label>
                <Select
                  value={formData.batchId}
                  onValueChange={(value) => handleChange("batchId", value)}
                >
                  <option value="">Select a batch</option>
                  {animalBatches?.map((batch) => (
                    <option key={batch.id} value={batch.id.toString()}>
                      {batch.batchCode} - {batch.species} ({batch.currentQuantity} animals)
                    </option>
                  ))}
                </Select>
                {errors.batchId && <p className="text-red-500 text-sm">{errors.batchId}</p>}
              </div>
            )}
          </div>

          {/* Measurements */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                className={errors.weight ? "border-red-500" : ""}
              />
              {errors.weight && <p className="text-red-500 text-sm">{errors.weight}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°C)</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.temperature}
                onChange={(e) => handleChange("temperature", e.target.value)}
                className={errors.temperature ? "border-red-500" : ""}
              />
              {errors.temperature && <p className="text-red-500 text-sm">{errors.temperature}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedConsumption">Feed Consumption (kg)</Label>
              <Input
                id="feedConsumption"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.feedConsumption}
                onChange={(e) => handleChange("feedConsumption", e.target.value)}
                className={errors.feedConsumption ? "border-red-500" : ""}
              />
              {errors.feedConsumption && <p className="text-red-500 text-sm">{errors.feedConsumption}</p>}
            </div>
          </div>

          {/* Health and Production */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="healthStatus">Health Status</Label>
              <Select
                value={formData.healthStatus}
                onValueChange={(value) => handleChange("healthStatus", value)}
              >
                <option value="">Select status</option>
                {HEALTH_STATUSES.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicationCost">Medication Cost ($)</Label>
              <Input
                id="medicationCost"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.medicationCost}
                onChange={(e) => handleChange("medicationCost", e.target.value)}
                className={errors.medicationCost ? "border-red-500" : ""}
              />
              {errors.medicationCost && <p className="text-red-500 text-sm">{errors.medicationCost}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="productionOutput">Production Output</Label>
              <Input
                id="productionOutput"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.productionOutput}
                onChange={(e) => handleChange("productionOutput", e.target.value)}
                className={errors.productionOutput ? "border-red-500" : ""}
              />
              {errors.productionOutput && <p className="text-red-500 text-sm">{errors.productionOutput}</p>}
            </div>
          </div>

          {/* Mortality Count (only show for mortality records) */}
          {formData.recordType === "MORTALITY" && (
            <div className="space-y-2">
              <Label htmlFor="mortalityCount">Mortality Count</Label>
              <Input
                id="mortalityCount"
                type="number"
                min="0"
                placeholder="0"
                value={formData.mortalityCount}
                onChange={(e) => handleChange("mortalityCount", e.target.value)}
                className={errors.mortalityCount ? "border-red-500" : ""}
              />
              {errors.mortalityCount && <p className="text-red-500 text-sm">{errors.mortalityCount}</p>}
            </div>
          )}

          {/* Observations and Notes */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="observations">Observations</Label>
              <Textarea
                id="observations"
                placeholder="Record any observations about the animal(s)..."
                value={formData.observations}
                onChange={(e) => handleChange("observations", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes or comments..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : recordId ? "Update Record" : "Create Record"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
