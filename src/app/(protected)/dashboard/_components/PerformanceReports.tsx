"use client"

import { usePerformanceReports } from "@/hooks/useDashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, BarChart3, DollarSign, Package } from "lucide-react"

export function PerformanceReports() {
  const { data, loading, error } = usePerformanceReports()

  if (loading) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Performance Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-500" />
            Performance Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">Failed to load performance reports</p>
        </CardContent>
      </Card>
    )
  }

  const reports = data?.data || {}
  const financialSummary = reports.financialSummary || {}
  const animalPerformance = reports.animalPerformance || []
  const assetUtilization = reports.assetUtilization || []
  const topMovingInventory = reports.topMovingInventory || []

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-500" />
          Performance Reports
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Financial Performance */}
          <div>
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-500" />
              Financial Performance (Last 12 Months)
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-xs text-gray-600">Revenue</p>
                <p className="font-bold text-green-600">₦{financialSummary.totalRevenue}</p>
              </div>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-xs text-gray-600">Expenses</p>
                <p className="font-bold text-red-600">₦{financialSummary.totalExpenses}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-xs text-gray-600">Net Profit</p>
                <p className="font-bold text-blue-600">₦{financialSummary.netProfit}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <p className="text-xs text-gray-600">Profit Margin</p>
                <p className="font-bold text-purple-600">{financialSummary.profitMargin}%</p>
              </div>
            </div>
          </div>

          {/* Animal Performance */}
          {animalPerformance.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                Animal Performance (Last 90 Days)
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {animalPerformance.map((perf: any, index: number) => (
                  <div key={index} className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <p className="text-xs text-gray-600 capitalize">{perf.recordType.toLowerCase()}</p>
                    <p className="font-bold text-orange-600">
                      Total: {perf.totalOutput} | Avg: {perf.averageOutput}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Asset Utilization */}
          {assetUtilization.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-blue-500" />
                Top Asset Utilization
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {assetUtilization.slice(0, 5).map((asset: any) => (
                  <div key={asset.id} className="flex justify-between items-center p-2 bg-blue-50 rounded border border-blue-200">
                    <div>
                      <p className="font-medium text-sm">{asset.assetName}</p>
                      <p className="text-xs text-gray-600">Value: ₦{asset.currentValue}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Maintenance: {asset.maintenanceCount}</p>
                      <p className={`text-xs font-medium ${
                        asset.utilizationScore === 'High' ? 'text-green-600' : 'text-yellow-600'
                      }`}>
                        {asset.utilizationScore}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Moving Inventory */}
          {topMovingInventory.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-500" />
                Top Moving Inventory (Last 90 Days)
              </h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {topMovingInventory.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-indigo-50 rounded border border-indigo-200">
                    <div>
                      <p className="font-medium text-sm">{item.itemName}</p>
                      <p className="text-xs text-gray-600">Stock: {item.currentQuantity} {item.unitOfMeasure}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600">Movement</p>
                      <p className="text-sm font-medium text-indigo-600">{item.totalMovement}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}