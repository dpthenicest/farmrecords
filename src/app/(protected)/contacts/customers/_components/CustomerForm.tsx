"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useCustomer, useCreateCustomer, useUpdateCustomer } from "@/hooks/useCustomers"

interface CustomerFormProps {
  customerId?: number
  onClose: () => void
  onSaved: () => void
}

export function CustomerForm({ customerId, onClose, onSaved }: CustomerFormProps) {
  const { customer, loading: loadingCustomer } = useCustomer(customerId)
  const { createCustomer, loading: creating } = useCreateCustomer()
  const { updateCustomer, loading: updating } = useUpdateCustomer()

  const [form, setForm] = useState({
    customerName: "",
    customerCode: "",
    businessName: "",
    customerType: "INDIVIDUAL",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    creditLimit: 0,
    paymentTermsDays: 0,
    paymentMethodPreference: "cash",
  })

  useEffect(() => {
    if (customer) setForm(customer)
  }, [customer])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (customerId) await updateCustomer(customerId, form)
      else await createCustomer(form)
      onSaved()
      onClose()
    } catch (err: any) { alert(err.message) }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input name="customerName" placeholder="Customer Name" required value={form.customerName} onChange={handleChange} />
      <Input name="customerCode" placeholder="Customer Code" required value={form.customerCode} onChange={handleChange} />
      <Input name="businessName" placeholder="Business Name" value={form.businessName} onChange={handleChange} />
      <Select value={form.customerType} onValueChange={(val) => setForm({ ...form, customerType: val })}>
        <SelectTrigger>Customer Type</SelectTrigger>
        <SelectContent>
          {["INDIVIDUAL", "RESTAURANT", "MARKET", "PROCESSOR"].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
        </SelectContent>
      </Select>
      <Input name="contactPerson" placeholder="Contact Person" value={form.contactPerson} onChange={handleChange} />
      <Input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <Input type="tel" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />
      <Textarea name="address" placeholder="Address" value={form.address} onChange={handleChange} />
      <Input type="number" name="creditLimit" placeholder="Credit Limit (₦)" value={form.creditLimit} onChange={handleChange} />
      <Input type="number" name="paymentTermsDays" placeholder="Payment Terms (days)" value={form.paymentTermsDays} onChange={handleChange} />
      <Select value={form.paymentMethodPreference} onValueChange={(val) => setForm({ ...form, paymentMethodPreference: val })}>
        <SelectTrigger>Payment Method</SelectTrigger>
        <SelectContent>
          {["cash", "bank_transfer", "check"].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
        </SelectContent>
      </Select>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={creating || updating}>{customerId ? "Update Customer" : "Create Customer"}</Button>
      </div>
    </form>
  )
}
