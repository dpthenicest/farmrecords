"use client"

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TablePagination } from "@/components/ui/table"
import { ActionMenu } from "@/components/ui/action-menu"
import { Card, CardContent } from "@/components/ui/card"

export function AnimalRecordTable({ records, loading, error, page, limit, totalPages, onPageChange, onLimitChange, onView, onEdit, onDelete }: any) {
  if (loading) return <div>Loading records...</div>
  if (error) return <div className="text-red-600">{error.message}</div>
  if (!records?.length) return <div>No records found</div>

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Batch ID</TableHead>
                <TableHead>Feed (kg)</TableHead>
                <TableHead>Production</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>{r.recordType.replace("_"," ")}</TableCell>
                  <TableCell>{new Date(r.recordDate).toLocaleDateString()}</TableCell>
                  <TableCell>{r.batchId}</TableCell>
                  <TableCell>{r.feedConsumption ?? "-"}</TableCell>
                  <TableCell>{r.productionOutput ?? "-"}</TableCell>
                  <TableCell>
                    <ActionMenu
                      onView={() => onView(r.id)}
                      onEdit={() => onEdit(r.id)}
                      onDelete={() => onDelete(r.id)}
                      showView
                      showEdit
                      showDelete
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            page={page}
            totalPages={totalPages}
            limit={limit}
            onPageChange={onPageChange}
            onLimitChange={(l:number) => { onLimitChange(l); onPageChange(1) }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
