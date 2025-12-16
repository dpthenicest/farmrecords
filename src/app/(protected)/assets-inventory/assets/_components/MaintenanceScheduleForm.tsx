"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"

interface MaintenanceScheduleFormProps {
  assetId: number
  onClose: () => void
  onScheduled: () => void
}

interface Supplier {
  id: number
  supplierName: string
}

export function MaintenanceScheduleForm({ assetId, onClose, onScheduled }: MaintenanceScheduleFormProps) {
  const [form, setForm] = useState({
    maintenanceType: "",
    scheduledDate: new Date(),
    cost: "",
    supplierId: "",
    description: "",
    notes: ""
  })
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    // Fetch suppliers for the dropdown
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("/api/suppliers", {
          credentials: "include"
        })
        if (response.ok) {
          const result = await response.json()
          setSuppliers(result.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch suppliers:", error)
      }
    }

    fetchSuppliers()
  }, [])

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const validateForm = () => {
    const newErrors: string[] = []

    if (!form.maintenanceType.trim()) {
      newErrors.push("Maintenance type is required")
    }

    if (!form.scheduledDate) {
      newErrors.push("Scheduled date is required")
    }

    if (!form.cost || isNaN(Number(form.cost)) || Number(form.cost) < 0) {
      newErrors.push("Valid cost is required")
    }

    if (!form.description.trim()) {
      newErrors.push("Description is required")
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setErrors([])

    try {
      const response = await fetch("/api/maintenance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          assetId,
          maintenanceType: form.maintenanceType,
          scheduledDate: form.scheduledDate.toISOString(),
          cost: Number(form.cost),
          supplierId: form.supplierId ? Number(form.supplierId) : null,
          description: form.description,
          notes: form.notes || null,
          status: "SCHEDULED"
        })
      })

      if (response.ok) {
        onScheduled()
        onClose()
      } else {
        const result = await response.json()
        setErrors([result.error || "Failed to schedule maintenance"])
      }
    } catch (error) {
      console.error("Error scheduling maintenance:", error)
      setErrors(["Failed to schedule maintenance"])
    } finally {
      setLoading(false)
    }
  }

  const maintenanceTypes = [
    { value: "MAINTENANCE", label: "Routine Maintenance" },
    { value: "REPAIR", label: "Repair" },
    { value: "CLEANING", label: "Cleaning" },
    { value: "INSPECTION", label: "Inspection" }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <ul className="text-sm text-red-600 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <Label htmlFor="maintenanceType">Maintenance Type *</Label>
        <Select
          value={form.maintenanceType}
          onValueChange={(value) => handleChange("maintenanceType", value)}
          required
        >
          <option value="">Select maintenance type</option>
          {maintenanceTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="scheduledDate">Scheduled Date *</Label>
        <DatePicker
          date={form.scheduledDate}
          onDateChange={(date) => handleChange("scheduledDate", date)}
          required
        />
      </div>

      <div>
        <Label htmlFor="cost">Estimated Cost *</Label>
        <Input
          id="cost"
          type="number"
          step="0.01"
          min="0"
          value={form.cost}
          onChange={(e) => handleChange("cost", e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <Label htmlFor="supplierId">Supplier (Optional)</Label>
        <Select
          value={form.supplierId}
          onValueChange={(value) => handleChange("supplierId", value)}
        >
          <option value="">Select supplier</option>
          {suppliers.map((supplier) => (
            <option key={supplier.id} value={supplier.id.toString()}>
              {supplier.supplierName}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="Describe the maintenance work to be performed"
          rows={3}
          required
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Additional notes or instructions"
          rows={2}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Scheduling..." : "Schedule Maintenance"}
        </Button>
      </div>
    </form>
  )
}