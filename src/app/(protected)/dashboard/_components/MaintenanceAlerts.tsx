"use client"

import { useComprehensiveAlerts } from "@/hooks/useDashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wrench, AlertTriangle, Clock } from "lucide-react"

export function MaintenanceAlerts() {
  const { data, loading, error } = useComprehensiveAlerts()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-500" />
            Maintenance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-500" />
            Maintenance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">Failed to load maintenance alerts</p>
        </CardContent>
      </Card>
    )
  }

  const alerts = data?.data || {}
  const overdueMaintenance = alerts.overdueMaintenance || []
  const upcomingMaintenance = alerts.upcomingMaintenance || []

  const totalAlerts = overdueMaintenance.length + upcomingMaintenance.length

  if (totalAlerts === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-green-500" />
            Maintenance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600 text-sm">All maintenance is up to date!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-500" />
            Maintenance Alerts
          </div>
          <span className="text-sm font-normal text-gray-500">
            {totalAlerts} alert{totalAlerts > 1 ? "s" : ""}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="max-h-[345px] overflow-y-auto space-y-3 pr-1">
          {/* Overdue Maintenance */}
          {overdueMaintenance.map((maintenance: any) => (
            <div
              key={`overdue-${maintenance.id}`}
              className="flex justify-between items-center p-3 border border-red-200 bg-red-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <p className="font-medium text-sm">{maintenance.assetName}</p>
                </div>
                <p className="text-xs text-gray-600">
                  {maintenance.maintenanceType} - {maintenance.daysOverdue} days overdue
                </p>
                <p className="text-xs text-gray-500">
                  Asset: {maintenance.assetTag}
                </p>
              </div>
              <Button size="sm" variant="outline" className="text-red-600 border-red-200">
                Schedule
              </Button>
            </div>
          ))}

          {/* Upcoming Maintenance */}
          {upcomingMaintenance.map((maintenance: any) => (
            <div
              key={`upcoming-${maintenance.id}`}
              className="flex justify-between items-center p-3 border border-yellow-200 bg-yellow-50 rounded-lg"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-yellow-500" />
                  <p className="font-medium text-sm">{maintenance.assetName}</p>
                </div>
                <p className="text-xs text-gray-600">
                  {maintenance.maintenanceType} - Due in {maintenance.daysUntilDue} days
                </p>
                <p className="text-xs text-gray-500">
                  Asset: {maintenance.assetTag}
                </p>
              </div>
              <Button size="sm" variant="outline" className="text-yellow-600 border-yellow-200">
                View
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}