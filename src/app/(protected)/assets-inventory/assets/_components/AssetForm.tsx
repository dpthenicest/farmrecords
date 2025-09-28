"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface AssetFormProps {
  asset?: any
  onClose: () => void
  onSaved: () => void
}

export function AssetForm({ asset, onClose, onSaved }: AssetFormProps) {
  const [form, setForm] = useState({
    name: asset?.name || "",
    category: asset?.category || "",
    location: asset?.location || "",
    value: asset?.value || "",
    description: asset?.description || "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // TODO: integrate API (create/update asset)
      console.log("Saving asset", form)
      onSaved()
      onClose()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Name</Label>
        <Input value={form.name} onChange={(e) => handleChange("name", e.target.value)} required />
      </div>
      <div>
        <Label>Category</Label>
        <Input value={form.category} onChange={(e) => handleChange("category", e.target.value)} />
      </div>
      <div>
        <Label>Location</Label>
        <Input value={form.location} onChange={(e) => handleChange("location", e.target.value)} />
      </div>
      <div>
        <Label>Value</Label>
        <Input
          type="number"
          value={form.value}
          onChange={(e) => handleChange("value", e.target.value)}
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  )
}
