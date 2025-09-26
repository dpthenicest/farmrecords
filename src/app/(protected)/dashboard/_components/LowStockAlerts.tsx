// app/dashboard/_components/LowStockAlerts.tsx
"use client"

import { useLowStockAlerts } from "@/hooks/useDashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export function LowStockAlerts() {
  const { data, loading, error } = useLowStockAlerts()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Low Stock Alerts
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
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">Failed to load stock alerts</p>
        </CardContent>
      </Card>
    )
  }

  const lowStockItems = data?.data || []

  if (lowStockItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-green-500" />
            Stock Levels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-600 text-sm">All items are well stocked!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          Low Stock Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockItems.map((item: any) => (
            <div key={item.id} className="flex justify-between items-center p-3 border border-orange-200 bg-orange-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm">{item.itemName}</p>
                <p className="text-xs text-gray-600">
                  Stock: {item.currentQuantity} {item.unitOfMeasure} 
                  (Reorder at: {item.reorderLevel})
                </p>
              </div>
              <Button size="sm" variant="outline">
                Reorder
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
