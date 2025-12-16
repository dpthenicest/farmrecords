"use client"

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TablePagination } from "@/components/ui/table"
import { ActionMenu } from "@/components/ui/action-menu"
import { Card, CardContent } from "@/components/ui/card"

export function AnimalRecordTable({ records, loading, error, page, limit, totalPages, onPageChange, onLimitChange, onView, onEdit, onDelete }: any) {
  if (loading) return <div>Loading records...</div>
  if (error) return <div className="text-red-600">{error.message}</div>
  if (!records?.length) return <div>No records found</div>

  const getRecordTypeColor = (type: string) => {
    switch (type) {
      case "HEALTH_CHECK":
        return "bg-blue-100 text-blue-800"
      case "VACCINATION":
        return "bg-green-100 text-green-800"
      case "FEEDING":
        return "bg-yellow-100 text-yellow-800"
      case "PRODUCTION":
        return "bg-purple-100 text-purple-800"
      case "MORTALITY":
        return "bg-red-100 text-red-800"
      case "BREEDING":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case "HEALTHY":
        return "bg-green-100 text-green-800"
      case "SICK":
        return "bg-red-100 text-red-800"
      case "RECOVERING":
        return "bg-yellow-100 text-yellow-800"
      case "QUARANTINE":
        return "bg-orange-100 text-orange-800"
      case "DECEASED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Animal/Batch</TableHead>
                <TableHead>Health Status</TableHead>
                <TableHead>Weight (kg)</TableHead>
                <TableHead>Feed (kg)</TableHead>
                <TableHead>Production</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r: any) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecordTypeColor(r.recordType)}`}>
                      {r.recordType.replace("_", " ")}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(r.recordDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {r.animal ? (
                      <div className="text-sm">
                        <div className="font-medium">🐄 {r.animal.animalTag}</div>
                        <div className="text-muted-foreground">{r.animal.species}</div>
                      </div>
                    ) : r.batch ? (
                      <div className="text-sm">
                        <div className="font-medium">📦 {r.batch.batchCode}</div>
                        <div className="text-muted-foreground">{r.batch.species}</div>
                      </div>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {r.healthStatus ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(r.healthStatus)}`}>
                        {r.healthStatus}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>
                    {r.weight ? `${Number(r.weight).toFixed(1)}` : "-"}
                  </TableCell>
                  <TableCell>
                    {r.feedConsumption ? `${Number(r.feedConsumption).toFixed(1)}` : "-"}
                  </TableCell>
                  <TableCell>
                    {r.productionOutput ? `${Number(r.productionOutput).toFixed(1)}` : "-"}
                  </TableCell>
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
