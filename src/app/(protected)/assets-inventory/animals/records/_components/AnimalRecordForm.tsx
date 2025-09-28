"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"
import { useCreateAnimalRecord, useUpdateAnimalRecord, useAnimalRecord } from "@/hooks/useAnimalRecords"

interface AnimalRecordFormProps {
  recordId?: number
  onClose: () => void
  onSaved: () => void
}

const RECORD_TYPES = ["FEEDING","WEIGHING","HEALTH_CHECK","PRODUCTION","MORTALITY"]

export function AnimalRecordForm({ recordId, onClose, onSaved }: AnimalRecordFormProps) {
  const { record } = useAnimalRecord(recordId)
  const [form, setForm] = useState<any>({
    recordType: record?.recordType || "FEEDING",
    recordDate: record?.recordDate ? new Date(record.recordDate) : new Date(),
    batchId: record?.batchId || "",
    feedConsumption: record?.feedConsumption || "",
    productionOutput: record?.productionOutput || "",
    observations: record?.observations || "",
  })

  const { createRecord, loading: creating } = useCreateAnimalRecord()
  const { updateRecord, loading: updating } = useUpdateAnimalRecord()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...form,
      recordDate: form.recordDate?.toISOString().split("T")[0]
    }
    try {
      if (recordId) await updateRecord(recordId, payload)
      else await createRecord(payload)
      onSaved()
      onClose()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select value={form.recordType} onValueChange={(v) => setForm({ ...form, recordType: v })}>
        <SelectTrigger>Record Type</SelectTrigger>
        <SelectContent>
          {RECORD_TYPES.map(r => <SelectItem key={r} value={r}>{r.replace("_"," ")}</SelectItem>)}
        </SelectContent>
      </Select>

      <DatePicker value={form.recordDate} onChange={(d) => setForm({ ...form, recordDate: d })} />

      <Input name="batchId" type="number" placeholder="Batch ID" value={form.batchId} onChange={(e) => setForm({ ...form, batchId:Number(e.target.value) })} />

      <Input name="feedConsumption" type="number" placeholder="Feed Used (kg)" value={form.feedConsumption} onChange={(e) => setForm({ ...form, feedConsumption:e.target.value })} />

      <Input name="productionOutput" type="number" placeholder="Production Output" value={form.productionOutput} onChange={(e) => setForm({ ...form, productionOutput:e.target.value })} />

      <Input name="observations" placeholder="Observations" value={form.observations} onChange={(e) => setForm({ ...form, observations:e.target.value })} />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={creating || updating}>{recordId ? "Update" : "Create"}</Button>
      </div>
    </form>
  )
}
