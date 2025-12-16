"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Modal } from "@/components/ui/modal"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MaintenanceScheduleForm } from "./MaintenanceScheduleForm"
import { AssetConditionTracker } from "./AssetConditionTracker"
import { DepreciationDisplay } from "./DepreciationDisplay"

interface AssetDetailsProps {
  asset: any
  onClose: () => void
}

interface DepreciationData {
  currentValue: number
  accumulatedDepreciation: number
  monthlyDepreciation: number
  remainingValue: number
  yearsRemaining: number
}

interface MaintenanceRecord {
  id: number
  maintenanceDate: string
  maintenanceType: string
  description: string
  cost: number
  status: string
  completedDate?: string
}

export function AssetDetails({ asset, onClose }: AssetDetailsProps) {
  const [depreciationData, setDepreciationData] = useState<DepreciationData | null>(null)
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([])
  const [upcomingMaintenance, setUpcomingMaintenance] = useState<MaintenanceRecord[]>([])
  const [loading, setLoading] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    if (!asset?.id) return

    const fetchAssetData = async () => {
      setLoading(true)
      try {
        // Fetch depreciation data
        const depreciationResponse = await fetch(`/api/assets/${asset.id}/depreciation`, {
          credentials: "include"
        })
        if (depreciationResponse.ok) {
          const depreciationResult = await depreciationResponse.json()
          setDepreciationData(depreciationResult.data)
        }

        // Fetch maintenance records
        const maintenanceResponse = await fetch(`/api/maintenance?assetId=${asset.id}`, {
          credentials: "include"
        })
        if (maintenanceResponse.ok) {
          const maintenanceResult = await maintenanceResponse.json()
          const records = maintenanceResult.data || []
          
          // Separate completed and upcoming maintenance
          const completed = records.filter((r: MaintenanceRecord) => r.status === "COMPLETED")
          const upcoming = records.filter((r: MaintenanceRecord) => 
            r.status === "SCHEDULED" || r.status === "OVERDUE"
          )
          
          setMaintenanceRecords(completed)
          setUpcomingMaintenance(upcoming)
        }
      } catch (error) {
        console.error("Failed to fetch asset data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssetData()
  }, [asset?.id, refreshTrigger])

  const formatDate = (date: string | null | undefined) => {
    if (!date) return "-"
    return new Date(date).toLocaleDateString()
  }

  const formatCurrency = (amount: any) => {
    if (!amount) return "-"
    return `$${Number(amount).toLocaleString()}`
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "EXCELLENT":
        return "bg-green-100 text-green-800"
      case "GOOD":
        return "bg-blue-100 text-blue-800"
      case "FAIR":
        return "bg-yellow-100 text-yellow-800"
      case "POOR":
        return "bg-orange-100 text-orange-800"
      case "CRITICAL":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "SCHEDULED":
        return "bg-blue-100 text-blue-800"
      case "OVERDUE":
        return "bg-red-100 text-red-800"
      case "IN_PROGRESS":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!asset) return null

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">{asset.assetName}</h2>
          <p className="text-muted-foreground">{asset.assetType} - {asset.category?.categoryName || "Uncategorized"}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(asset.conditionStatus)}`}>
            {asset.conditionStatus}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            asset.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
          }`}>
            {asset.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Tabbed Interface */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="depreciation">Depreciation</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="condition">Condition</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Asset Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Asset Name</label>
                    <p className="font-medium">{asset.assetName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Asset Type</label>
                    <p className="font-medium">{asset.assetType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="font-medium">{asset.category?.categoryName || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Location</label>
                    <p className="font-medium">{asset.location || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Purchase Date</label>
                    <p className="font-medium">{formatDate(asset.purchaseDate)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Condition</label>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(asset.conditionStatus)}`}>
                      {asset.conditionStatus}
                    </span>
                  </div>
                </div>
                {asset.description && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Description</label>
                    <p className="text-sm">{asset.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle>Financial Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Purchase Cost</label>
                    <p className="font-medium">{formatCurrency(asset.purchaseCost)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Salvage Value</label>
                    <p className="font-medium">{formatCurrency(asset.salvageValue)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Useful Life</label>
                    <p className="font-medium">{asset.usefulLifeYears} years</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Depreciation Rate</label>
                    <p className="font-medium">{asset.depreciationRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Asset Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Record Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Created At</label>
                <p className="font-medium">{formatDate(asset.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Updated At</label>
                <p className="font-medium">{formatDate(asset.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="depreciation">
          <DepreciationDisplay asset={asset} />
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          {/* Upcoming Maintenance */}
          {upcomingMaintenance.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Upcoming Maintenance</CardTitle>
                  <Button size="sm" onClick={() => setShowScheduleModal(true)}>
                    Schedule Maintenance
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Estimated Cost</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingMaintenance.map((maintenance) => (
                        <TableRow key={maintenance.id}>
                          <TableCell>{formatDate(maintenance.maintenanceDate)}</TableCell>
                          <TableCell>{maintenance.maintenanceType}</TableCell>
                          <TableCell className="max-w-xs truncate">{maintenance.description}</TableCell>
                          <TableCell>{formatCurrency(maintenance.cost)}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMaintenanceStatusColor(maintenance.status)}`}>
                              {maintenance.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Maintenance History */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Maintenance History</CardTitle>
                {upcomingMaintenance.length === 0 && (
                  <Button size="sm" onClick={() => setShowScheduleModal(true)}>
                    Schedule Maintenance
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="p-4">Loading maintenance records...</div>
              ) : maintenanceRecords.length === 0 ? (
                <div className="text-center p-6 text-muted-foreground">No maintenance records found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead>Completed Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenanceRecords.map((maintenance) => (
                        <TableRow key={maintenance.id}>
                          <TableCell>{formatDate(maintenance.maintenanceDate)}</TableCell>
                          <TableCell>{maintenance.maintenanceType}</TableCell>
                          <TableCell className="max-w-xs truncate">{maintenance.description}</TableCell>
                          <TableCell>{formatCurrency(maintenance.cost)}</TableCell>
                          <TableCell>{formatDate(maintenance.completedDate)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="condition">
          <AssetConditionTracker 
            asset={asset} 
            onConditionUpdated={() => setRefreshTrigger(prev => prev + 1)} 
          />
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex justify-end">
        <Button onClick={onClose}>Close</Button>
      </div>

      {/* Schedule Maintenance Modal */}
      <Modal
        open={showScheduleModal}
        onOpenChange={setShowScheduleModal}
        title="Schedule Maintenance"
      >
        <MaintenanceScheduleForm
          assetId={asset.id}
          onClose={() => setShowScheduleModal(false)}
          onScheduled={() => setRefreshTrigger(prev => prev + 1)}
        />
      </Modal>
    </div>
  )
}
