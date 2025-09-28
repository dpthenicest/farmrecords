"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// 🆕 Import DatePicker
import { DatePicker } from "@/components/ui/date-picker" 

export function InvoiceForm({
  invoice,
  onClose,
  onSaved,
}: {
  invoice?: any
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = React.useState({
    // Use optional chaining and default to empty string for standard inputs
    invoiceNumber: invoice?.invoiceNumber || "",
    notes: invoice?.notes || "",
  })
  
  // 🆕 State for DatePicker using Date objects
  const [invoiceDate, setInvoiceDate] = React.useState<Date | undefined>(
    invoice?.invoiceDate ? new Date(invoice.invoiceDate) : undefined
  )
  const [dueDate, setDueDate] = React.useState<Date | undefined>(
    invoice?.dueDate ? new Date(invoice.dueDate) : undefined
  )

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // Validation check for required dates
    if (!invoiceDate || !dueDate) {
        alert("Invoice Date and Due Date are required.");
        return;
    }

    // 🔨 Final data structure
    const finalData = {
        ...form,
        // Convert Date objects to ISO strings for API payload
        invoiceDate: invoiceDate.toISOString(), 
        dueDate: dueDate.toISOString(),
        // Add customerId, etc., here when implemented
    }

    // TODO: call create/update API
    console.log("submit", finalData)
    onSaved()
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Invoice Number (Input) */}
      <Input
        name="invoiceNumber"
        placeholder="Invoice #"
        value={form.invoiceNumber}
        onChange={handleChange}
        required
      />
      
      {/* Invoice Date (DatePicker) */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Invoice Date</label>
        <DatePicker
            value={invoiceDate}
            onChange={setInvoiceDate}
        />
      </div>

      {/* Due Date (DatePicker) */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Due Date</label>
        <DatePicker
            value={dueDate}
            onChange={setDueDate}
        />
      </div>

      {/* Notes (Textarea) */}
      <textarea
        name="notes"
        placeholder="Notes"
        value={form.notes}
        onChange={handleChange}
        className="w-full rounded border p-2 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-green-600"
      />
      
      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit">{invoice ? "Update" : "Create"}</Button>
      </div>
    </form>
  )
}