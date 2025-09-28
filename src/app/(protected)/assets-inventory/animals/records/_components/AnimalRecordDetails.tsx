"use client"

import { useAnimalRecord } from "@/hooks/useAnimalRecords"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AnimalRecordDetailsProps {
  recordId: number
}

export function AnimalRecordDetails({ recordId }: AnimalRecordDetailsProps) {
  const { record, loading, error } = useAnimalRecord(recordId)

  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-red-600">{error.message}</p>
  if (!record) return <p>Record not found</p>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Record Info</CardTitle></CardHeader>
        <CardContent>
          <p><strong>Type:</strong> {record.recordType.replace("_"," ")}</p>
          <p><strong>Date:</strong> {new Date(record.recordDate).toLocaleDateString()}</p>
          <p><strong>Batch ID:</strong> {record.batchId}</p>
          <p><strong>Feed Consumption:</strong> {record.feedConsumption ?? "-"}</p>
          <p><strong>Production Output:</strong> {record.productionOutput ?? "-"}</p>
          <p><strong>Observations:</strong> {record.observations || "-"}</p>
        </CardContent>
      </Card>
    </div>
  )
}
