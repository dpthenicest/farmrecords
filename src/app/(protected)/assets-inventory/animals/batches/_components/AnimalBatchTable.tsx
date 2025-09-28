"use client"

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TablePagination } from "@/components/ui/table"
import { ActionMenu } from "@/components/ui/action-menu"
import { Card, CardContent } from "@/components/ui/card"

export function AnimalBatchTable({ batches, totalPages, page, limit, loading, error, onPageChange, onLimitChange, onView, onEdit, onDelete }: any) {
  if (loading) return <div>Loading batches...</div>
  if (error) return <div className="text-red-600">{error.message}</div>
  if (!batches?.length) return <div>No batches found</div>

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch Code</TableHead>
                <TableHead>Species</TableHead>
                <TableHead>Breed</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch: any) => (
                <TableRow key={batch.id}>
                  <TableCell>{batch.batchCode}</TableCell>
                  <TableCell>{batch.species}</TableCell>
                  <TableCell>{batch.breed}</TableCell>
                  <TableCell>{batch.currentQuantity}</TableCell>
                  <TableCell>{batch.status}</TableCell>
                  <TableCell>
                    <ActionMenu
                      onView={() => onView(batch)}
                      onEdit={() => onEdit(batch)}
                      onDelete={() => onDelete(batch)}
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
            onLimitChange={(l: number) => { onLimitChange(l); onPageChange(1) }}
          />
        </CardContent>
      </Card>

    </div>
  )
}
