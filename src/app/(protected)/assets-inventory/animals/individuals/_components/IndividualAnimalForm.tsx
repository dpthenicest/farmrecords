"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useCreateAnimal, useUpdateAnimal, useAnimal } from "@/hooks/useAnimals"

interface IndividualAnimalFormProps {
  animalId?: number
  onClose: () => void
  onSaved: () => void
}

const SPECIES = ["fish", "chicken", "goat"]

export function IndividualAnimalForm({ animalId, onClose, onSaved }: IndividualAnimalFormProps) {
  const { animal, loading: loadingAnimal } = useAnimal(animalId)
  const { createAnimal, loading: creating } = useCreateAnimal()
  const { updateAnimal, loading: updating } = useUpdateAnimal()

  const [form, setForm] = useState({
    animalTag: "",
    species: "",
    breed: "",
    gender: "",
    purchaseWeight: "",
    currentWeight: "",
    purchaseCost: "",
    healthStatus: "healthy",
    notes: ""
  })

  const [birthDate, setBirthDate] = useState<Date | undefined>()
  const [lastHealthCheck, setLastHealthCheck] = useState<Date | undefined>()

  useEffect(() => {
    if (animal) {
      setForm({
        animalTag: animal.animalTag || "",
        species: animal.species || "",
        breed: animal.breed || "",
        gender: animal.gender || "",
        purchaseWeight: animal.purchaseWeight ? String(animal.purchaseWeight) : "",
        currentWeight: animal.currentWeight ? String(animal.currentWeight) : "",
        purchaseCost: animal.purchaseCost ? String(animal.purchaseCost) : "",
        healthStatus: animal.healthStatus || "healthy",
        notes: animal.notes || ""
      })
      setBirthDate(animal.birthDate ? new Date(animal.birthDate) : undefined)
      setLastHealthCheck(animal.lastHealthCheck ? new Date(animal.lastHealthCheck) : undefined)
    }
  }, [animal])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!form.animalTag || !form.species) {
      alert("Animal Tag and Species are required")
      return
    }

    const payload = {
      animalTag: form.animalTag,
      species: form.species,
      breed: form.breed || undefined,
      gender: form.gender || undefined,
      birthDate: birthDate?.toISOString(),
      purchaseWeight: form.purchaseWeight ? Number(form.purchaseWeight) : undefined,
      currentWeight: form.currentWeight ? Number(form.currentWeight) : undefined,
      purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : undefined,
      healthStatus: form.healthStatus || undefined,
      lastHealthCheck: lastHealthCheck?.toISOString(),
      notes: form.notes || undefined
    }

    try {
      if (animalId) {
        await updateAnimal(animalId, payload)
      } else {
        await createAnimal(payload)
      }
      onSaved()
      onClose()
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loadingAnimal) return <p>Loading...</p>

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input 
        name="animalTag" 
        placeholder="Animal Tag (e.g., A001, F001)" 
        value={form.animalTag} 
        onChange={handleChange} 
        required 
      />
      
      <Select value={form.species} onValueChange={val => setForm({ ...form, species: val })}>
        <SelectTrigger>Species *</SelectTrigger>
        <SelectContent>
          {SPECIES.map(s => <SelectItem key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</SelectItem>)}
        </SelectContent>
      </Select>

      <Input 
        name="breed" 
        placeholder="Breed (optional)" 
        value={form.breed} 
        onChange={handleChange} 
      />

      <Select value={form.gender || "NONE"} onValueChange={val => setForm({ ...form, gender: val === "NONE" ? "" : val })}>
        <SelectTrigger>Gender</SelectTrigger>
        <SelectContent>
          <SelectItem value="NONE">Select Gender</SelectItem>
          <SelectItem value="MALE">Male</SelectItem>
          <SelectItem value="FEMALE">Female</SelectItem>
        </SelectContent>
      </Select>

      <div className="space-y-1">
        <label className="text-sm font-medium">Birth Date</label>
        <DatePicker value={birthDate} onChange={setBirthDate} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input 
            name="purchaseWeight" 
            type="number" 
            step="0.01"
            placeholder="Purchase Weight (kg)" 
            value={form.purchaseWeight} 
            onChange={handleChange} 
          />
        </div>
        <div>
          <Input 
            name="currentWeight" 
            type="number" 
            step="0.01"
            placeholder="Current Weight (kg)" 
            value={form.currentWeight} 
            onChange={handleChange} 
          />
        </div>
      </div>

      <Input 
        name="purchaseCost" 
        type="number" 
        step="0.01"
        placeholder="Purchase Cost (₦)" 
        value={form.purchaseCost} 
        onChange={handleChange} 
      />

      <Select value={form.healthStatus || "NONE"} onValueChange={val => setForm({ ...form, healthStatus: val === "NONE" ? "" : val })}>
        <SelectTrigger>Health Status</SelectTrigger>
        <SelectContent>
          <SelectItem value="NONE">Select Status</SelectItem>
          <SelectItem value="HEALTHY">Healthy</SelectItem>
          <SelectItem value="SICK">Sick</SelectItem>
          <SelectItem value="RECOVERING">Recovering</SelectItem>
          <SelectItem value="QUARANTINE">Quarantine</SelectItem>
        </SelectContent>
      </Select>

      <div className="space-y-1">
        <label className="text-sm font-medium">Last Health Check</label>
        <DatePicker value={lastHealthCheck} onChange={setLastHealthCheck} />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Notes</label>
        <textarea
          name="notes"
          placeholder="Additional notes about this animal..."
          value={form.notes}
          onChange={handleChange}
          className="w-full rounded border p-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-green-600"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={creating || updating}>
          {animalId ? "Update Animal" : "Create Animal"}
        </Button>
      </div>
    </form>
  )
}
