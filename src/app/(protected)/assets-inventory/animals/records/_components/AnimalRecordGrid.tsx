"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AnimalRecordGrid({ records, loading, error, page, totalPages, onPageChange, onView, onEdit, onDelete }: any) {
  if (loading) return <p>Loading records...</p>
  if (error) return <p className="text-red-600">{error.message}</p>
  if (!records?.length) return <p>No records found</p>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {records.map((r: any) => (
          <Card key={r.id} className="hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <CardTitle>{r.recordType.replace("_"," ")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Date: {new Date(r.recordDate).toLocaleDateString()}</p>
              <p>Batch ID: {r.batchId}</p>
              <p>Feed: {r.feedConsumption ?? "-"}</p>
              <p>Production: {r.productionOutput ?? "-"}</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => onView(r.id)}>View</Button>
                <Button size="sm" variant="secondary" onClick={() => onEdit(r.id)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(r.id)}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <Button key={p} size="sm" variant={p === page ? "default" : "outline"} onClick={() => onPageChange(p)}>{p}</Button>
          ))}
        </div>
      )}
    </div>
  )
}
