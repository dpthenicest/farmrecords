"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
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
  const [activeTab, setActiveTab] = useState("overview")

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
      <div className="w-full">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("overview")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("depreciation")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "depreciation"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Depreciation
            </button>
            <button
              onClick={() => setActiveTab("maintenance")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "maintenance"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Maintenance
            </button>
            <button
              onClick={() => setActiveTab("condition")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "condition"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Condition
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Asset Information</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Asset Name</label>
                        <p className="font-medium">{asset.assetName}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Asset Type</label>
                        <p className="font-medium">{asset.assetType}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Category</label>
                        <p className="font-medium">{asset.category?.categoryName || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Location</label>
                        <p className="font-medium">{asset.location || "-"}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Purchase Date</label>
                        <p className="font-medium">{formatDate(asset.purchaseDate)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Condition</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(asset.conditionStatus)}`}>
                          {asset.conditionStatus}
                        </span>
                      </div>
                    </div>
                    {asset.description && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">Description</label>
                        <p className="text-sm">{asset.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Financial Information */}
                <div className="border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Purchase Cost</label>
                        <p className="font-medium">{formatCurrency(asset.purchaseCost)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Salvage Value</label>
                        <p className="font-medium">{formatCurrency(asset.salvageValue)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Useful Life</label>
                        <p className="font-medium">{asset.usefulLifeYears} years</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Depreciation Rate</label>
                        <p className="font-medium">{asset.depreciationRate}%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Asset Timestamps */}
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Record Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created At</label>
                    <p className="font-medium">{formatDate(asset.createdAt)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Updated At</label>
                    <p className="font-medium">{formatDate(asset.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "depreciation" && (
            <DepreciationDisplay asset={asset} />
          )}

          {activeTab === "maintenance" && (
            <div className="space-y-6">
              {/* Upcoming Maintenance */}
              {upcomingMaintenance.length > 0 && (
                <div className="border rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Upcoming Maintenance</h3>
                    <Button size="sm" onClick={() => setShowScheduleModal(true)}>
                      Schedule Maintenance
                    </Button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Date</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Type</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Description</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Estimated Cost</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {upcomingMaintenance.map((maintenance) => (
                          <tr key={maintenance.id} className="border-b">
                            <td className="py-2 px-4">{formatDate(maintenance.maintenanceDate)}</td>
                            <td className="py-2 px-4">{maintenance.maintenanceType}</td>
                            <td className="py-2 px-4 max-w-xs truncate">{maintenance.description}</td>
                            <td className="py-2 px-4">{formatCurrency(maintenance.cost)}</td>
                            <td className="py-2 px-4">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMaintenanceStatusColor(maintenance.status)}`}>
                                {maintenance.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Maintenance History */}
              <div className="border rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Maintenance History</h3>
                  {upcomingMaintenance.length === 0 && (
                    <Button size="sm" onClick={() => setShowScheduleModal(true)}>
                      Schedule Maintenance
                    </Button>
                  )}
                </div>
                {loading ? (
                  <div className="p-4">Loading maintenance records...</div>
                ) : maintenanceRecords.length === 0 ? (
                  <div className="text-center p-6 text-gray-600">No maintenance records found.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Date</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Type</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Description</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Cost</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">Completed Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maintenanceRecords.map((maintenance) => (
                          <tr key={maintenance.id} className="border-b">
                            <td className="py-2 px-4">{formatDate(maintenance.maintenanceDate)}</td>
                            <td className="py-2 px-4">{maintenance.maintenanceType}</td>
                            <td className="py-2 px-4 max-w-xs truncate">{maintenance.description}</td>
                            <td className="py-2 px-4">{formatCurrency(maintenance.cost)}</td>
                            <td className="py-2 px-4">{formatDate(maintenance.completedDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "condition" && (
            <AssetConditionTracker 
              asset={asset} 
              onConditionUpdated={() => setRefreshTrigger(prev => prev + 1)} 
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end border-t pt-4">
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
          onScheduled={() => {
            setShowScheduleModal(false)
            setRefreshTrigger(prev => prev + 1)
          }}
        />
      </Modal>
    </div>
  )
}
