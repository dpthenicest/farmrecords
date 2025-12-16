"use client"

import { useState, useEffect } from "react"
import { useAnimalRecord } from "@/hooks/useAnimalRecords"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AnimalRecordDetailsProps {
  recordId: number
}

export function AnimalRecordDetails({ recordId }: AnimalRecordDetailsProps) {
  const { record, loading, error } = useAnimalRecord(recordId)
  const [relatedRecords, setRelatedRecords] = useState<any[]>([])
  const [relatedLoading, setRelatedLoading] = useState(false)

  // Fetch related health records for the same animal/batch
  useEffect(() => {
    if (!record) return

    const fetchRelatedRecords = async () => {
      setRelatedLoading(true)
      try {
        let url = ""
        if (record.animalId) {
          url = `/api/animal-records/by-animal/${record.animalId}`
        } else if (record.batchId) {
          url = `/api/animal-records/by-batch/${record.batchId}`
        }

        if (url) {
          const response = await fetch(url, { credentials: "include" })
          if (response.ok) {
            const data = await response.json()
            // Filter out current record and limit to health-related records
            const healthRecords = (data.data || [])
              .filter((r: any) => r.id !== recordId && 
                ['HEALTH_CHECK', 'VACCINATION', 'BREEDING', 'MORTALITY'].includes(r.recordType))
              .sort((a: any, b: any) => new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime())
              .slice(0, 10) // Show last 10 health records

            setRelatedRecords(healthRecords)
          }
        }
      } catch (error) {
        console.error("Failed to fetch related records:", error)
      } finally {
        setRelatedLoading(false)
      }
    }

    fetchRelatedRecords()
  }, [record, recordId])

  const formatDate = (date: string | null) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString()
  }

  const formatWeight = (weight: any) => {
    if (!weight) return "-"
    return `${Number(weight).toFixed(1)} kg`
  }

  const formatCurrency = (amount: any) => {
    if (!amount) return "-"
    return `$${Number(amount).toLocaleString()}`
  }

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

  if (loading) return <div className="p-4">Loading record details...</div>
  if (error) return <div className="text-red-600 p-4">Error: {error.message}</div>
  if (!record) return <div className="p-4">Record not found</div>

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Animal Record Details</h2>
          <p className="text-muted-foreground">
            {record.recordType.replace("_", " ")} - {formatDate(record.recordDate)}
          </p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecordTypeColor(record.recordType)}`}>
          {record.recordType.replace("_", " ")}
        </span>
      </div>

      <hr className="border-gray-200" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Record Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Record Type</label>
                <p className="font-medium">{record.recordType.replace("_", " ")}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Record Date</label>
                <p className="font-medium">{formatDate(record.recordDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Associated With</label>
                <p className="font-medium">
                  {record.animal ? `Animal: ${record.animal.animalTag}` : 
                   record.batch ? `Batch: ${record.batch.batchCode}` : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Health Status</label>
                {record.healthStatus ? (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(record.healthStatus)}`}>
                    {record.healthStatus}
                  </span>
                ) : (
                  <p className="font-medium">-</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Measurements */}
        <Card>
          <CardHeader>
            <CardTitle>Measurements & Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Weight</label>
                <p className="font-medium">{formatWeight(record.weight)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Temperature</label>
                <p className="font-medium">
                  {record.temperature ? `${Number(record.temperature).toFixed(1)}°C` : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Feed Consumption</label>
                <p className="font-medium">{formatWeight(record.feedConsumption)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Production Output</label>
                <p className="font-medium">{formatWeight(record.productionOutput)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Medication Cost</label>
                <p className="font-medium">{formatCurrency(record.medicationCost)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Mortality Count</label>
                <p className="font-medium">{record.mortalityCount || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Observations and Notes */}
      {(record.observations || record.notes) && (
        <Card>
          <CardHeader>
            <CardTitle>Observations & Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {record.observations && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Observations</label>
                <p className="text-sm">{record.observations}</p>
              </div>
            )}
            {record.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Additional Notes</label>
                <p className="text-sm">{record.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      {relatedRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Performance Metrics
              {record.animal ? ` for ${record.animal.animalTag}` : 
               record.batch ? ` for Batch ${record.batch.batchCode}` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {relatedLoading ? (
              <div className="p-4">Loading performance data...</div>
            ) : (
              <div className="space-y-6">
                {/* Performance Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="bg-blue-50">
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Avg Weight</div>
                      <div className="text-2xl font-bold">
                        {(() => {
                          const weights = relatedRecords.filter(r => r.weight).map(r => Number(r.weight))
                          return weights.length > 0 ? `${(weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)} kg` : "-"
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50">
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Total Production</div>
                      <div className="text-2xl font-bold">
                        {(() => {
                          const production = relatedRecords.filter(r => r.productionOutput).map(r => Number(r.productionOutput))
                          return production.length > 0 ? `${production.reduce((a, b) => a + b, 0).toFixed(1)}` : "-"
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-yellow-50">
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Total Feed</div>
                      <div className="text-2xl font-bold">
                        {(() => {
                          const feed = relatedRecords.filter(r => r.feedConsumption).map(r => Number(r.feedConsumption))
                          return feed.length > 0 ? `${feed.reduce((a, b) => a + b, 0).toFixed(1)} kg` : "-"
                        })()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50">
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">Health Records</div>
                      <div className="text-2xl font-bold">
                        {relatedRecords.filter(r => ['HEALTH_CHECK', 'VACCINATION'].includes(r.recordType)).length}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Weight Trend Visualization */}
                {(() => {
                  const weightRecords = relatedRecords
                    .filter(r => r.weight)
                    .sort((a, b) => new Date(a.recordDate).getTime() - new Date(b.recordDate).getTime())
                    .slice(-10) // Last 10 weight records
                  
                  if (weightRecords.length > 1) {
                    return (
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Weight Trend (Last 10 Records)</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {weightRecords.map((record, index) => {
                              const weight = Number(record.weight)
                              const maxWeight = Math.max(...weightRecords.map(r => Number(r.weight)))
                              const widthPercent = (weight / maxWeight) * 100
                              
                              return (
                                <div key={record.id} className="flex items-center gap-3">
                                  <div className="text-sm w-20">{formatDate(record.recordDate)}</div>
                                  <div className="flex-1 bg-gray-200 rounded-full h-4 relative">
                                    <div 
                                      className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                                      style={{ width: `${widthPercent}%` }}
                                    />
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                                      {weight.toFixed(1)} kg
                                    </span>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  }
                  return null
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Health History */}
      {relatedRecords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Recent Health History 
              {record.animal ? ` for ${record.animal.animalTag}` : 
               record.batch ? ` for Batch ${record.batch.batchCode}` : ""}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {relatedLoading ? (
              <div className="p-4">Loading health history...</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Health Status</TableHead>
                      <TableHead>Weight</TableHead>
                      <TableHead>Temperature</TableHead>
                      <TableHead>Observations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatedRecords.map((relatedRecord) => (
                      <TableRow key={relatedRecord.id}>
                        <TableCell>{formatDate(relatedRecord.recordDate)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecordTypeColor(relatedRecord.recordType)}`}>
                            {relatedRecord.recordType.replace("_", " ")}
                          </span>
                        </TableCell>
                        <TableCell>
                          {relatedRecord.healthStatus ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(relatedRecord.healthStatus)}`}>
                              {relatedRecord.healthStatus}
                            </span>
                          ) : "-"}
                        </TableCell>
                        <TableCell>{formatWeight(relatedRecord.weight)}</TableCell>
                        <TableCell>
                          {relatedRecord.temperature ? `${Number(relatedRecord.temperature).toFixed(1)}°C` : "-"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {relatedRecord.observations || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Record Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle>Record Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Created At</label>
            <p className="font-medium">{formatDate(record.createdAt)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Updated At</label>
            <p className="font-medium">{formatDate(record.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
