"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface AnimalBatchGridProps {
  batches: any[]
  loading: boolean
  error: Error | null
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  onViewBatch: (id: number) => void
  onEditBatch: (id: number) => void
}

export function AnimalBatchGrid({
  batches,
  loading,
  error,
  page,
  totalPages,
  onPageChange,
  onViewBatch,
  onEditBatch,
}: AnimalBatchGridProps) {
  if (loading) return <p>Loading batches...</p>
  if (error) return <p className="text-red-600">{error.message}</p>
  if (!batches.length) return <p>No batches found</p>

  return (
    <div className="space-y-4">
      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {batches.map((batch) => (
          <Card key={batch.id} className="cursor-pointer hover:shadow-lg transition">
            <CardHeader>
              <CardTitle>{batch.batchCode}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Species: {batch.species}</p>
              <p>Breed: {batch.breed}</p>
              <p>Quantity: {batch.currentQuantity}</p>
              <p>Status: {batch.batchStatus}</p>
              <p>Location: {batch.location}</p>
              <div className="flex gap-2 mt-2">
                <Button size="sm" variant="outline" onClick={() => onViewBatch(batch.id)}>
                  View
                </Button>
                <Button size="sm" variant="secondary" onClick={() => onEditBatch(batch.id)}>
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              size="sm"
              variant={p === page ? "default" : "outline"}
              onClick={() => onPageChange(p)}
            >
              {p}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
