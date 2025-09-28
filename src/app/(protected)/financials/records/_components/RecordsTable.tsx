"use client"

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableHeader,
  TableBody,
  TablePagination,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { useFinancialRecords } from "@/hooks/useFinancialRecords"
import { useState } from "react"
import { ActionMenu } from "@/components/ui/action-menu"

interface RecordsTableProps {
  filters: {
    transactionType?: "INCOME" | "EXPENSE" | "TRANSFER" | ""
    categoryId?: number
    startDate?: string
    endDate?: string
  }
}

export function RecordsTable({ filters }: RecordsTableProps) {
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10) // ✅ Add limit state

  const { records, loading, error, totalPages } = useFinancialRecords({
    ...filters,
    page,
    limit,
    transactionType: filters.transactionType || undefined, // convert "" to undefined
  })

  if (loading) return <p className="p-4">Loading...</p>
  if (error) return <p className="p-4 text-red-600">Error: {error.message}</p>

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Customer/Supplier</TableHead>
            <TableHead>Reference</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                No records found
              </TableCell>
            </TableRow>
          ) : (
            records.map((rec) => (
              <TableRow key={rec.id}>
                <TableCell>
                  {new Date(rec.transactionDate).toLocaleDateString("en-GB")}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 text-xs rounded ${rec.transactionType === "INCOME"
                        ? "bg-green-100 text-green-700"
                        : rec.transactionType === "EXPENSE"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {rec.transactionType}
                  </span>
                </TableCell>
                <TableCell>{rec.description}</TableCell>
                <TableCell>{rec.category?.categoryName || "-"}</TableCell>
                <TableCell className="text-right font-medium">
                  ₦{rec.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  {rec.customer?.customerName || rec.supplier?.name || "-"}
                </TableCell>
                <TableCell>{rec.referenceNumber || "-"}</TableCell>
                <TableCell className="space-x-2">
                  <ActionMenu
                    onView={() => console.log("View", rec.id)}
                    onEdit={() => console.log("Edit", rec.id)}
                    onDelete={() => console.log("Delete", rec.id)}
                  />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination with limit selector */}
      <TablePagination
        page={page}
        totalPages={totalPages}
        limit={limit} // ✅ pass current limit
        onPageChange={setPage}
        onLimitChange={(newLimit) => {
          setLimit(newLimit)
          setPage(1) // reset to page 1 on limit change
        }}
      />
    </div>
  )
}
