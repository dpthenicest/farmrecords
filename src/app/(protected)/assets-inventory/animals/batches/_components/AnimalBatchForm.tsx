"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useCreateAnimalBatch, useUpdateAnimalBatch } from "@/hooks/useAnimalBatches"

interface AnimalBatchFormProps {
  batch?: any
  onClose: () => void
  onSaved: () => void
}

const SPECIES = ["fish", "chicken", "goat"]

export function AnimalBatchForm({ batch, onClose, onSaved }: AnimalBatchFormProps) {
  const [form, setForm] = useState({
    batchCode: batch?.batchCode || "",
    species: batch?.species || "",
    breed: batch?.breed || "",
    initialQuantity: batch?.initialQuantity || "",
    totalCost: batch?.totalCost || "",
    averageWeight: batch?.averageWeight || "",
    location: batch?.location || "",
    batchStatus: batch?.batchStatus || "ACTIVE",
    categoryId: batch?.categoryId || "",
    notes: batch?.notes || ""
  })

  const [date, setDate] = useState<Date | undefined>(
    batch?.batchStartDate ? new Date(batch.batchStartDate) : undefined
  )

  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])

  const { createBatch, loading: creating } = useCreateAnimalBatch()
  const { updateBatch, loading: updating } = useUpdateAnimalBatch()

  // Fetch categories
  useEffect(() => {
    fetch("/api/categories") // replace with your categories endpoint
      .then(res => res.json())
      .then(json => setCategories(json.data || []))
      .catch(console.error)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.batchCode || !form.species || !date) {
      alert("Batch Code, Species, and Start Date are required.")
      return
    }

    if (!form.initialQuantity || Number(form.initialQuantity) <= 0) {
      alert("Initial Quantity must be greater than 0.")
      return
    }

    const payload = {
      batchCode: form.batchCode,
      species: form.species,
      breed: form.breed || undefined,
      initialQuantity: Number(form.initialQuantity),
      currentQuantity: Number(form.initialQuantity), // Initially same as initial
      batchStartDate: date.toISOString(),
      totalCost: form.totalCost ? Number(form.totalCost) : 0,
      averageWeight: form.averageWeight ? Number(form.averageWeight) : undefined,
      batchStatus: form.batchStatus,
      location: form.location || undefined,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      notes: form.notes || undefined
    }

    try {
      if (batch?.id) {
        await updateBatch(batch.id, payload)
      } else {
        await createBatch(payload)
      }
      onSaved()
      onClose()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        name="batchCode"
        placeholder="Batch Code (e.g., B001, FISH2024-01)"
        value={form.batchCode}
        onChange={handleChange}
        required
      />

      <Select value={form.species} onValueChange={(val) => setForm({ ...form, species: val })}>
        <SelectTrigger>Species *</SelectTrigger>
        <SelectContent>
          {SPECIES.map((s) => (
            <SelectItem key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        name="breed"
        placeholder="Breed (optional)"
        value={form.breed}
        onChange={handleChange}
      />

      <Input
        type="number"
        name="initialQuantity"
        placeholder="Initial Quantity *"
        value={form.initialQuantity}
        onChange={handleChange}
        required
        min="1"
      />

      <div className="space-y-1">
        <label className="text-sm font-medium">Batch Start Date *</label>
        <DatePicker value={date} onChange={setDate} />
      </div>

      <Input
        type="number"
        step="0.01"
        name="totalCost"
        placeholder="Total Investment Cost (₦)"
        value={form.totalCost}
        onChange={handleChange}
      />

      <Input
        type="number"
        step="0.01"
        name="averageWeight"
        placeholder="Average Weight (kg)"
        value={form.averageWeight}
        onChange={handleChange}
      />

      <Select
        value={form.batchStatus}
        onValueChange={(val) => setForm({ ...form, batchStatus: val })}
      >
        <SelectTrigger>Batch Status</SelectTrigger>
        <SelectContent>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="GROWING">Growing</SelectItem>
          <SelectItem value="PRODUCING">Producing</SelectItem>
          <SelectItem value="MATURE">Mature</SelectItem>
          <SelectItem value="SOLD">Sold</SelectItem>
          <SelectItem value="COMPLETED">Completed</SelectItem>
        </SelectContent>
      </Select>

      <Input
        name="location"
        placeholder="Location (Pond 1, Coop A, etc.)"
        value={form.location}
        onChange={handleChange}
      />

      <Select
        value={form.categoryId || "NONE"}
        onValueChange={(val) => setForm({ ...form, categoryId: val === "NONE" ? "" : val })}
      >
        <SelectTrigger>Category (Optional)</SelectTrigger>
        <SelectContent>
          <SelectItem value="NONE">No Category</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-1">
        <label className="text-sm font-medium">Notes</label>
        <textarea
          name="notes"
          placeholder="Additional notes about this batch..."
          value={form.notes}
          onChange={handleChange}
          className="w-full rounded border p-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={creating || updating}>
          {batch?.id ? "Update Batch" : "Create Batch"}
        </Button>
      </div>
    </form>
  )
}
