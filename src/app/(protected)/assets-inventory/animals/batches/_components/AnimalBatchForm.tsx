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
    initialQuantity: batch?.initialQuantity || 0,
    batchStartDate: batch?.batchStartDate || "",
    totalCost: batch?.totalCost || 0,
    location: batch?.location || "",
    categoryId: batch?.categoryId || "",
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

    const payload = { ...form, batchStartDate: date.toISOString() }

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
        placeholder="Batch Code"
        value={form.batchCode}
        onChange={handleChange}
        required
      />

      <Select value={form.species} onValueChange={(val) => setForm({ ...form, species: val })}>
        <SelectTrigger>Species</SelectTrigger>
        <SelectContent>
          {SPECIES.map((s) => (
            <SelectItem key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        name="breed"
        placeholder="Breed"
        value={form.breed}
        onChange={handleChange}
      />

      <Input
        type="number"
        name="initialQuantity"
        placeholder="Initial Quantity"
        value={form.initialQuantity}
        onChange={handleChange}
      />

      <div className="space-y-1">
        <label className="text-sm font-medium">Batch Start Date</label>
        <DatePicker value={date} onChange={setDate} />
      </div>

      <Input
        type="number"
        name="totalCost"
        placeholder="Total Investment (₦)"
        value={form.totalCost}
        onChange={handleChange}
      />

      <Input
        name="location"
        placeholder="Location (Pond 1, Coop A, etc.)"
        value={form.location}
        onChange={handleChange}
      />

      <Select
        value={form.categoryId}
        onValueChange={(val) => setForm({ ...form, categoryId: val })}
      >
        <SelectTrigger>Select Category</SelectTrigger>
        <SelectContent>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={creating || updating}>
          {batch?.id ? "Update Batch" : "Create Batch"}
        </Button>
      </div>
    </form>
  )
}
