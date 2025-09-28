// app/financials/records/client.tsx
"use client"

import { useState } from "react"
import { RecordsHeader } from "./_components/RecordsHeader"
import { RecordsFilterBar } from "./_components/RecordsFilterBar"
import { RecordsTable } from "./_components/RecordsTable"
import { TransactionModal } from "./_components/TransactionModal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RecordClient() {
  const [openModal, setOpenModal] = useState(false)
  const [filters, setFilters] = useState({
    transactionType: "" as "" | "INCOME" | "EXPENSE" | "TRANSFER",
    categoryId: undefined as number | undefined,
    startDate: undefined as string | undefined,
    endDate: undefined as string | undefined,
  })

  return (
    <div className="space-y-6">
      <RecordsHeader onAddTransaction={() => setOpenModal(true)} />
      <RecordsFilterBar filters={filters} setFilters={setFilters} />
      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Records</CardTitle>
        </CardHeader>
        <CardContent>
          <RecordsTable filters={filters} />
        </CardContent>
      </Card>
      <TransactionModal open={openModal} onOpenChange={setOpenModal} />
    </div>
  )
}
