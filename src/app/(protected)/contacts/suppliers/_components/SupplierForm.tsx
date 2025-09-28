"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useSupplier, useCreateSupplier, useUpdateSupplier } from "@/hooks/useSuppliers"

interface SupplierFormProps {
  supplierId?: number
  onClose: () => void
  onSaved: () => void
}

export function SupplierForm({ supplierId, onClose, onSaved }: SupplierFormProps) {
  const { supplier } = useSupplier(supplierId)
  const { createSupplier, loading: creating } = useCreateSupplier()
  const { updateSupplier, loading: updating } = useUpdateSupplier()

  const [form, setForm] = useState({
    supplierName: "",
    supplierCode: "",
    supplierType: "FEED",
    contactPerson: "",
    email: "",
    phone: "",
    taxId: "",
    rating: 3,
    address: "",
  })

  useEffect(() => { if (supplier) setForm(supplier) }, [supplier])

  const handleChange = (e: any) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (supplierId) await updateSupplier(supplierId, form)
      else await createSupplier(form)
      onSaved()
      onClose()
    } catch (err: any) { alert(err.message) }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input name="supplierName" placeholder="Supplier Name" required value={form.supplierName} onChange={handleChange} />
      <Input name="supplierCode" placeholder="Supplier Code" required value={form.supplierCode} onChange={handleChange} />
      <Select value={form.supplierType} onValueChange={(val) => setForm({ ...form, supplierType: val })}>
        <SelectTrigger>Supplier Type</SelectTrigger>
        <SelectContent>
          {["FEED","VETERINARY","EQUIPMENT","SERVICES","FINGERLINGS"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
        </SelectContent>
      </Select>
      <Input name="contactPerson" placeholder="Contact Person" value={form.contactPerson} onChange={handleChange} />
      <Input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <Input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
      <Input name="taxId" placeholder="Tax ID" value={form.taxId} onChange={handleChange} />
      <Select value={String(form.rating)} onValueChange={(val) => setForm({ ...form, rating: Number(val) })}>
        <SelectTrigger>Rating</SelectTrigger>
        <SelectContent>
          {[1,2,3,4,5].map(r => <SelectItem key={r} value={String(r)}>{r} Star{r>1?'s':''}</SelectItem>)}
        </SelectContent>
      </Select>
      <Textarea name="address" placeholder="Address" value={form.address} onChange={handleChange} />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={creating || updating}>{supplierId ? "Update Supplier" : "Create Supplier"}</Button>
      </div>
    </form>
  )
}
