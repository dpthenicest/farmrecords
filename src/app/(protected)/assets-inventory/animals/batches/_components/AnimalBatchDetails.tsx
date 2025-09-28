"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAnimalBatch, useBatchPerformance } from "@/hooks/useAnimalBatches"

interface AnimalBatchDetailsProps {
  batchId: number
  onClose: () => void
}

export function AnimalBatchDetails({ batchId }: AnimalBatchDetailsProps) {
  const { batch, loading: batchLoading, error: batchError } = useAnimalBatch(batchId)
  const { performance, loading: perfLoading, error: perfError } = useBatchPerformance(batchId)

  if (batchLoading) return <div>Loading batch...</div>
  if (batchError) return <div className="text-red-600">{batchError.message}</div>

  return (
    <div className="space-y-4">
      {/* Batch Info */}
      <Card>
        <CardHeader>
          <CardTitle>Batch Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Code:</strong> {batch.batchCode}</p>
          <p><strong>Species:</strong> {batch.species}</p>
          <p><strong>Breed:</strong> {batch.breed}</p>
          <p><strong>Quantity:</strong> {batch.currentQuantity}</p>
          <p><strong>Start Date:</strong> {new Date(batch.batchStartDate).toLocaleDateString()}</p>
          <p><strong>Location:</strong> {batch.location}</p>
          <p><strong>Category:</strong> {batch.category?.name || "N/A"}</p>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          {perfLoading ? (
            <div>Loading performance...</div>
          ) : perfError ? (
            <div className="text-red-600">{perfError.message}</div>
          ) : (
            <>
              <p><strong>Growth Rate:</strong> {performance?.growthRate ?? "-"}</p>
              <p><strong>Mortality Rate:</strong> {performance?.mortalityRate ?? "-"}</p>
              <p><strong>Feed Conversion:</strong> {performance?.feedConversion ?? "-"}</p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Associated Animals */}
      <Card>
        <CardHeader>
          <CardTitle>Associated Animals</CardTitle>
        </CardHeader>
        <CardContent>
          {batch.animals?.length ? (
            <ul className="space-y-1">
              {batch.animals.map((a: any) => (
                <li key={a.id}>{a.name} - {a.species} - {a.status}</li>
              ))}
            </ul>
          ) : (
            <p>No animals recorded.</p>
          )}
        </CardContent>
      </Card>

      {/* Production Records */}
      <Card>
        <CardHeader>
          <CardTitle>Production Records</CardTitle>
        </CardHeader>
        <CardContent>
          {batch.productionRecords?.length ? (
            <ul className="space-y-1">
              {batch.productionRecords.map((r: any) => (
                <li key={r.id}>
                  {r.activity} - {new Date(r.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No production records.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
