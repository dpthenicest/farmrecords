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
    tag: "",
    species: "",
    batch: "",
    weight: "",
    healthStatus: "healthy",
    lastCheck: ""
  })

  const [lastCheckDate, setLastCheckDate] = useState<Date | undefined>()

  useEffect(() => {
    if (animal) {
      setForm({
        tag: animal.tag,
        species: animal.species,
        batch: animal.batch,
        weight: animal.weight,
        healthStatus: animal.healthStatus,
        lastCheck: animal.lastCheck
      })
      setLastCheckDate(animal.lastCheck ? new Date(animal.lastCheck) : undefined)
    }
  }, [animal])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, lastCheck: lastCheckDate?.toISOString() }
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
      <Input name="tag" placeholder="Tag" value={form.tag} onChange={handleChange} required />
      
      <Select value={form.species} onValueChange={val => setForm({ ...form, species: val })}>
        <SelectTrigger>Species</SelectTrigger>
        <SelectContent>
          {SPECIES.map(s => <SelectItem key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</SelectItem>)}
        </SelectContent>
      </Select>

      <Input name="batch" placeholder="Batch" value={form.batch} onChange={handleChange} />
      <Input name="weight" type="number" placeholder="Weight" value={form.weight} onChange={handleChange} />

      <Select value={form.healthStatus} onValueChange={val => setForm({ ...form, healthStatus: val })}>
        <SelectTrigger>Health Status</SelectTrigger>
        <SelectContent>
          <SelectItem value="healthy">Healthy</SelectItem>
          <SelectItem value="sick">Sick</SelectItem>
          <SelectItem value="recovering">Recovering</SelectItem>
        </SelectContent>
      </Select>

      <div className="space-y-1">
        <label className="text-sm font-medium">Last Check</label>
        <DatePicker value={lastCheckDate} onChange={setLastCheckDate} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={creating || updating}>{animalId ? "Update" : "Create"}</Button>
      </div>
    </form>
  )
}
