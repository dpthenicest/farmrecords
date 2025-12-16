"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useCreateAnimal, useUpdateAnimal } from "@/hooks/useAnimals"
import { useAnimalBatches } from "@/hooks/useAnimalBatches"

interface AnimalFormProps {
  animal?: any
  onClose: () => void
  onSaved: () => void
}

export function AnimalForm({ animal, onClose, onSaved }: AnimalFormProps) {
  const { createAnimal, loading: createLoading } = useCreateAnimal()
  const { updateAnimal, loading: updateLoading } = useUpdateAnimal()
  const { animalBatches } = useAnimalBatches({ limit: 100 })

  const [formData, setFormData] = useState({
    animalTag: "",
    species: "",
    breed: "",
    gender: "",
    birthDate: "",
    purchaseWeight: "",
    currentWeight: "",
    purchaseCost: "",
    healthStatus: "HEALTHY",
    batchId: "",
    notes: "",
    isActive: true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (animal) {
      setFormData({
        animalTag: animal.animalTag || "",
        species: animal.species || "",
        breed: animal.breed || "",
        gender: animal.gender || "",
        birthDate: animal.birthDate ? new Date(animal.birthDate).toISOString().split('T')[0] : "",
        purchaseWeight: animal.purchaseWeight ? Number(animal.purchaseWeight).toString() : "",
        currentWeight: animal.currentWeight ? Number(animal.currentWeight).toString() : "",
        purchaseCost: animal.purchaseCost ? Number(animal.purchaseCost).toString() : "",
        healthStatus: animal.healthStatus || "HEALTHY",
        batchId: animal.batchId ? animal.batchId.toString() : "",
        notes: animal.notes || "",
        isActive: animal.isActive !== false,
      })
    }
  }, [animal])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.animalTag.trim()) {
      newErrors.animalTag = "Animal tag is required"
    }

    if (!formData.species.trim()) {
      newErrors.species = "Species is required"
    }

    if (formData.purchaseWeight && isNaN(Number(formData.purchaseWeight))) {
      newErrors.purchaseWeight = "Purchase weight must be a valid number"
    }

    if (formData.currentWeight && isNaN(Number(formData.currentWeight))) {
      newErrors.currentWeight = "Current weight must be a valid number"
    }

    if (formData.purchaseCost && isNaN(Number(formData.purchaseCost))) {
      newErrors.purchaseCost = "Purchase cost must be a valid number"
    }

    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate)
      const today = new Date()
      if (birthDate > today) {
        newErrors.birthDate = "Birth date cannot be in the future"
      }
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
        animalTag: formData.animalTag.trim(),
        species: formData.species.trim(),
        breed: formData.breed.trim() || null,
        gender: formData.gender || null,
        birthDate: formData.birthDate ? new Date(formData.birthDate) : null,
        purchaseWeight: formData.purchaseWeight ? Number(formData.purchaseWeight) : null,
        currentWeight: formData.currentWeight ? Number(formData.currentWeight) : null,
        purchaseCost: formData.purchaseCost ? Number(formData.purchaseCost) : null,
        healthStatus: formData.healthStatus,
        batchId: formData.batchId ? Number(formData.batchId) : null,
        notes: formData.notes.trim() || null,
        isActive: formData.isActive,
      }

      if (animal) {
        await updateAnimal(animal.id, submitData)
      } else {
        await createAnimal(submitData)
      }

      onSaved()
      onClose()
    } catch (error: any) {
      console.error("Failed to save animal:", error)
      if (error.message.includes("validation") || error.message.includes("required")) {
        setErrors({ general: error.message })
      } else {
        setErrors({ general: "Failed to save animal. Please try again." })
      }
    }
  }

  const loading = createLoading || updateLoading

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{animal ? "Edit Animal" : "Add New Animal"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="animalTag">Animal Tag *</Label>
              <Input
                id="animalTag"
                placeholder="e.g., COW001, PIG123"
                value={formData.animalTag}
                onChange={(e) => handleChange("animalTag", e.target.value)}
                className={errors.animalTag ? "border-red-500" : ""}
              />
              {errors.animalTag && <p className="text-red-500 text-sm">{errors.animalTag}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="species">Species *</Label>
              <Input
                id="species"
                placeholder="e.g., Cattle, Poultry, Swine"
                value={formData.species}
                onChange={(e) => handleChange("species", e.target.value)}
                className={errors.species ? "border-red-500" : ""}
              />
              {errors.species && <p className="text-red-500 text-sm">{errors.species}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Breed</Label>
              <Input
                id="breed"
                placeholder="e.g., Holstein, Angus, Yorkshire"
                value={formData.breed}
                onChange={(e) => handleChange("breed", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleChange("gender", value)}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Birth Date</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleChange("birthDate", e.target.value)}
                className={errors.birthDate ? "border-red-500" : ""}
              />
              {errors.birthDate && <p className="text-red-500 text-sm">{errors.birthDate}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="healthStatus">Health Status</Label>
              <Select
                value={formData.healthStatus}
                onValueChange={(value) => handleChange("healthStatus", value)}
              >
                <option value="HEALTHY">Healthy</option>
                <option value="SICK">Sick</option>
                <option value="RECOVERING">Recovering</option>
                <option value="QUARANTINE">Quarantine</option>
                <option value="DECEASED">Deceased</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseWeight">Purchase Weight (kg)</Label>
              <Input
                id="purchaseWeight"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.purchaseWeight}
                onChange={(e) => handleChange("purchaseWeight", e.target.value)}
                className={errors.purchaseWeight ? "border-red-500" : ""}
              />
              {errors.purchaseWeight && <p className="text-red-500 text-sm">{errors.purchaseWeight}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentWeight">Current Weight (kg)</Label>
              <Input
                id="currentWeight"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={formData.currentWeight}
                onChange={(e) => handleChange("currentWeight", e.target.value)}
                className={errors.currentWeight ? "border-red-500" : ""}
              />
              {errors.currentWeight && <p className="text-red-500 text-sm">{errors.currentWeight}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchaseCost">Purchase Cost ($)</Label>
              <Input
                id="purchaseCost"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.purchaseCost}
                onChange={(e) => handleChange("purchaseCost", e.target.value)}
                className={errors.purchaseCost ? "border-red-500" : ""}
              />
              {errors.purchaseCost && <p className="text-red-500 text-sm">{errors.purchaseCost}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchId">Batch (Optional)</Label>
              <Select
                value={formData.batchId}
                onValueChange={(value) => handleChange("batchId", value)}
              >
                <option value="">No Batch</option>
                {animalBatches?.map((batch) => (
                  <option key={batch.id} value={batch.id.toString()}>
                    {batch.batchCode} - {batch.species}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the animal..."
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleChange("isActive", e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : animal ? "Update Animal" : "Create Animal"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}