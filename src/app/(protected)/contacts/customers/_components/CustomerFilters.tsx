"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"

const CUSTOMER_TYPES = ["ALL", "RESTAURANT", "MARKET", "INDIVIDUAL"]

export function CustomerFilters({ onApplyFilters }: { onApplyFilters: (filters: any) => void }) {
  const [type, setType] = useState("ALL")
  const [name, setName] = useState("")
  const [code, setCode] = useState("")

  const handleApply = () => {
    onApplyFilters({
      customerType: type !== "ALL" ? type : undefined,
      customerName: name || undefined,
      customerCode: code || undefined,
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-gray-50 border rounded-lg">
      <Select value={type} onValueChange={setType}>
        <SelectTrigger className="w-[140px]">Customer Type</SelectTrigger>
        <SelectContent>
          {CUSTOMER_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
        </SelectContent>
      </Select>

      <Input placeholder="Customer Name" value={name} onChange={(e) => setName(e.target.value)} className="w-[180px]" />
      <Input placeholder="Customer Code" value={code} onChange={(e) => setCode(e.target.value)} className="w-[180px]" />

      <Button variant="secondary" onClick={handleApply}>Apply Filters</Button>
    </div>
  )
}
