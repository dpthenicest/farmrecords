"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"

const SUPPLIER_TYPES = ["ALL", "FEED", "VETERINARY", "EQUIPMENT", "SERVICES", "FINGERLINGS"]

export function SupplierFilters({ onApplyFilters }: { onApplyFilters: (filters: any) => void }) {
  const [type, setType] = useState("ALL")
  const [name, setName] = useState("")
  const [code, setCode] = useState("")

  const handleApply = () => {
    onApplyFilters({
      supplierType: type !== "ALL" ? type : undefined,
      supplierName: name || undefined,
      supplierCode: code || undefined,
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 border rounded-lg">
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-[140px]">Supplier Type</SelectTrigger>
        <SelectContent>
          {SUPPLIER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
        </SelectContent>
      </Select>

      <Input placeholder="Supplier Name" value={name} onChange={(e) => setName(e.target.value)} className="w-[180px]" />
      <Input placeholder="Supplier Code" value={code} onChange={(e) => setCode(e.target.value)} className="w-[180px]" />

      <Button variant="secondary" onClick={handleApply}>Apply Filters</Button>
    </div>
  )
}
