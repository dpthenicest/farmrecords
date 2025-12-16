"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AnimalDetailsProps {
  animal: any
  onClose: () => void
}

export function AnimalDetails({ animal, onClose }: AnimalDetailsProps) {
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

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{animal.animalTag}</h2>
          <p className="text-muted-foreground">{animal.species} - {animal.breed || "Unknown breed"}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthStatusColor(animal.healthStatus)}`}>
            {animal.healthStatus || "Unknown"}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${animal.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
            {animal.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Animal Tag</label>
            <p className="font-medium">{animal.animalTag}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Species</label>
            <p className="font-medium">{animal.species}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Breed</label>
            <p className="font-medium">{animal.breed || "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Gender</label>
            <p className="font-medium">{animal.gender || "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Birth Date</label>
            <p className="font-medium">{formatDate(animal.birthDate)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Age</label>
            <p className="font-medium">
              {animal.birthDate 
                ? `${Math.floor((new Date().getTime() - new Date(animal.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} years`
                : "-"
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Physical Information */}
      <Card>
        <CardHeader>
          <CardTitle>Physical Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Purchase Weight</label>
            <p className="font-medium">{formatWeight(animal.purchaseWeight)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Current Weight</label>
            <p className="font-medium">{formatWeight(animal.currentWeight)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Weight Gain</label>
            <p className="font-medium">
              {animal.purchaseWeight && animal.currentWeight
                ? `${(Number(animal.currentWeight) - Number(animal.purchaseWeight)).toFixed(1)} kg`
                : "-"
              }
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Purchase Cost</label>
            <p className="font-medium">{formatCurrency(animal.purchaseCost)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Health Information */}
      <Card>
        <CardHeader>
          <CardTitle>Health Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Health Status</label>
            <p className="font-medium">{animal.healthStatus || "Unknown"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Last Health Check</label>
            <p className="font-medium">{formatDate(animal.lastHealthCheck)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Batch Information */}
      {animal.batch && (
        <Card>
          <CardHeader>
            <CardTitle>Batch Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Batch Code</label>
              <p className="font-medium">{animal.batch.batchCode}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Batch Status</label>
              <p className="font-medium">{animal.batch.batchStatus}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Batch Start Date</label>
              <p className="font-medium">{formatDate(animal.batch.batchStartDate)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Current Quantity</label>
              <p className="font-medium">{animal.batch.currentQuantity}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {animal.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{animal.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <Card>
        <CardHeader>
          <CardTitle>Record Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Created At</label>
            <p className="font-medium">{formatDate(animal.createdAt)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Updated At</label>
            <p className="font-medium">{formatDate(animal.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  )
}