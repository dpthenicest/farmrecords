"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAnimalBatch } from "@/hooks/useAnimalBatches"
import { useAnimalsByBatch } from "@/hooks/useAnimals"

interface AnimalBatchDetailsProps {
  batchId: number
  onClose: () => void
}

interface PerformanceMetrics {
  averageWeight?: number
  totalFeedConsumption?: number
  totalMedicationCost?: number
  totalProductionOutput?: number
  mortalityRate?: number
  averageTemperature?: number
  healthStatusDistribution?: Record<string, number>
}

export function AnimalBatchDetails({ batchId }: AnimalBatchDetailsProps) {
  const { batch, loading: batchLoading, error: batchError } = useAnimalBatch(batchId)
  const { animals, loading: animalsLoading, error: animalsError } = useAnimalsByBatch(batchId)
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics>({})
  const [metricsLoading, setMetricsLoading] = useState(false)

  // Fetch performance metrics
  useEffect(() => {
    if (!batchId) return

    const fetchPerformanceMetrics = async () => {
      setMetricsLoading(true)
      try {
        const response = await fetch(`/api/animal-batches/${batchId}/performance`, {
          credentials: "include"
        })
        if (response.ok) {
          const data = await response.json()
          setPerformanceMetrics(data.data || {})
        }
      } catch (error) {
        console.error("Failed to fetch performance metrics:", error)
      } finally {
        setMetricsLoading(false)
      }
    }

    fetchPerformanceMetrics()
  }, [batchId])

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

  if (batchLoading) return <div className="p-4">Loading batch details...</div>
  if (batchError) return <div className="text-red-600 p-4">Error: {batchError.message}</div>
  if (!batch) return <div className="p-4">Batch not found</div>

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{batch.batchCode}</h2>
          <p className="text-muted-foreground">{batch.species} - {batch.breed || "Unknown breed"}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            batch.batchStatus === "ACTIVE" ? "bg-green-100 text-green-800" :
            batch.batchStatus === "COMPLETED" ? "bg-blue-100 text-blue-800" :
            batch.batchStatus === "SOLD" ? "bg-purple-100 text-purple-800" :
            "bg-gray-100 text-gray-800"
          }`}>
            {batch.batchStatus}
          </span>
        </div>
      </div>

      <hr className="border-gray-200" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batch Information */}
        <Card>
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Batch Code</label>
                <p className="font-medium">{batch.batchCode}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Species</label>
                <p className="font-medium">{batch.species}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Breed</label>
                <p className="font-medium">{batch.breed || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="font-medium">{batch.batchStatus}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Initial Quantity</label>
                <p className="font-medium">{batch.initialQuantity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Current Quantity</label>
                <p className="font-medium">{batch.currentQuantity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <p className="font-medium">{formatDate(batch.batchStartDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Location</label>
                <p className="font-medium">{batch.location || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Total Cost</label>
                <p className="font-medium">{formatCurrency(batch.totalCost)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Average Weight</label>
                <p className="font-medium">{formatWeight(batch.averageWeight)}</p>
              </div>
            </div>
            {batch.notes && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Notes</label>
                <p className="text-sm">{batch.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <div className="p-4">Loading performance metrics...</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Average Weight</label>
                  <p className="font-medium">{formatWeight(performanceMetrics.averageWeight)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Feed Consumption</label>
                  <p className="font-medium">{formatWeight(performanceMetrics.totalFeedConsumption)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Medication Cost</label>
                  <p className="font-medium">{formatCurrency(performanceMetrics.totalMedicationCost)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Production Output</label>
                  <p className="font-medium">{formatWeight(performanceMetrics.totalProductionOutput)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Mortality Count</label>
                  <p className="font-medium">{performanceMetrics.mortalityRate || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Average Temperature</label>
                  <p className="font-medium">
                    {performanceMetrics.averageTemperature 
                      ? `${performanceMetrics.averageTemperature.toFixed(1)}°C` 
                      : "-"
                    }
                  </p>
                </div>
              </div>
            )}

            {/* Health Status Distribution */}
            {performanceMetrics.healthStatusDistribution && Object.keys(performanceMetrics.healthStatusDistribution).length > 0 && (
              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground">Health Status Distribution</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(performanceMetrics.healthStatusDistribution).map(([status, count]) => (
                    <span
                      key={status}
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(status)}`}
                    >
                      {status}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Individual Animals */}
      <Card>
        <CardHeader>
          <CardTitle>Individual Animals ({animals?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {animalsLoading ? (
            <div className="p-4">Loading animals...</div>
          ) : animalsError ? (
            <div className="text-red-600 p-4">Error loading animals: {animalsError.message}</div>
          ) : !animals?.length ? (
            <div className="text-center p-6 text-muted-foreground">No individual animals recorded for this batch.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Animal Tag</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Birth Date</TableHead>
                    <TableHead>Current Weight</TableHead>
                    <TableHead>Health Status</TableHead>
                    <TableHead>Last Health Check</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {animals.map((animal) => (
                    <TableRow key={animal.id}>
                      <TableCell className="font-medium">{animal.animalTag}</TableCell>
                      <TableCell>{animal.gender || "-"}</TableCell>
                      <TableCell>{formatDate(animal.birthDate)}</TableCell>
                      <TableCell>{formatWeight(animal.currentWeight)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(animal.healthStatus)}`}>
                          {animal.healthStatus || "Unknown"}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(animal.lastHealthCheck)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          animal.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }`}>
                          {animal.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  )
}
