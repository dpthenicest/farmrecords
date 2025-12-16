"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react"

interface AssetConditionTrackerProps {
  asset: any
  onConditionUpdated: () => void
}

interface ConditionHistory {
  id: number
  conditionStatus: string
  notes: string
  updatedAt: string
  updatedBy: string
}

export function AssetConditionTracker({ asset, onConditionUpdated }: AssetConditionTrackerProps) {
  const [currentCondition, setCurrentCondition] = useState(asset.conditionStatus)
  const [notes, setNotes] = useState("")
  const [conditionHistory, setConditionHistory] = useState<ConditionHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    // In a real implementation, you would fetch condition history from an API
    // For now, we'll simulate it
    setConditionHistory([
      {
        id: 1,
        conditionStatus: asset.conditionStatus,
        notes: "Current condition",
        updatedAt: asset.updatedAt,
        updatedBy: "System"
      }
    ])
  }, [asset])

  const conditionOptions = [
    { value: "EXCELLENT", label: "Excellent", color: "text-green-600", bgColor: "bg-green-100" },
    { value: "GOOD", label: "Good", color: "text-blue-600", bgColor: "bg-blue-100" },
    { value: "FAIR", label: "Fair", color: "text-yellow-600", bgColor: "bg-yellow-100" },
    { value: "POOR", label: "Poor", color: "text-orange-600", bgColor: "bg-orange-100" },
    { value: "CRITICAL", label: "Critical", color: "text-red-600", bgColor: "bg-red-100" }
  ]

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case "EXCELLENT":
      case "GOOD":
        return <CheckCircle className="h-4 w-4" />
      case "FAIR":
        return <Clock className="h-4 w-4" />
      case "POOR":
      case "CRITICAL":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <XCircle className="h-4 w-4" />
    }
  }

  const getConditionStyle = (condition: string) => {
    const option = conditionOptions.find(opt => opt.value === condition)
    return option ? `${option.color} ${option.bgColor}` : "text-gray-600 bg-gray-100"
  }

  const handleUpdateCondition = async () => {
    if (currentCondition === asset.conditionStatus && !notes.trim()) {
      return
    }

    setUpdating(true)
    try {
      const response = await fetch(`/api/assets/${asset.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          conditionStatus: currentCondition,
          // In a real implementation, you might want to track condition changes separately
          notes: notes.trim() || undefined
        })
      })

      if (response.ok) {
        // Add to condition history
        const newHistoryEntry: ConditionHistory = {
          id: Date.now(),
          conditionStatus: currentCondition,
          notes: notes.trim() || "Condition updated",
          updatedAt: new Date().toISOString(),
          updatedBy: "Current User"
        }
        setConditionHistory(prev => [newHistoryEntry, ...prev])
        setNotes("")
        onConditionUpdated()
      } else {
        console.error("Failed to update asset condition")
      }
    } catch (error) {
      console.error("Error updating asset condition:", error)
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + " " + new Date(dateString).toLocaleTimeString()
  }

  const needsAttention = ["POOR", "CRITICAL"].includes(currentCondition)

  return (
    <div className="space-y-4">
      {/* Current Condition Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getConditionIcon(currentCondition)}
            Asset Condition Status
            {needsAttention && (
              <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded-full">
                Needs Attention
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="condition">Current Condition</Label>
            <Select
              value={currentCondition}
              onValueChange={setCurrentCondition}
            >
              {conditionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Update Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about the condition change..."
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button 
              onClick={handleUpdateCondition}
              disabled={updating || (currentCondition === asset.conditionStatus && !notes.trim())}
            >
              {updating ? "Updating..." : "Update Condition"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Condition Alerts */}
      {needsAttention && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Condition Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-red-700">
                This asset is in {currentCondition.toLowerCase()} condition and requires immediate attention.
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-red-300 text-red-700">
                  Schedule Inspection
                </Button>
                <Button size="sm" variant="outline" className="border-red-300 text-red-700">
                  Schedule Maintenance
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Condition History */}
      <Card>
        <CardHeader>
          <CardTitle>Condition History</CardTitle>
        </CardHeader>
        <CardContent>
          {conditionHistory.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No condition history available.</p>
          ) : (
            <div className="space-y-3">
              {conditionHistory.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getConditionIcon(entry.conditionStatus)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionStyle(entry.conditionStatus)}`}>
                        {entry.conditionStatus}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        by {entry.updatedBy}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {formatDate(entry.updatedAt)}
                    </p>
                    {entry.notes && (
                      <p className="text-sm">{entry.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}