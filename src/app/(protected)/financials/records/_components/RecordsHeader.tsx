// app/financials/records/_components/RecordsHeader.tsx
"use client"

import { Button } from "@/components/ui/button"

export function RecordsHeader({ onAddTransaction }: { onAddTransaction: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">Financial Records</h1>
      <div className="flex gap-2">
        <Button variant="outline">Export to Excel</Button>
        {/* <Button onClick={onAddTransaction}>Add Transaction</Button> */}
      </div>
    </div>
  )
}
