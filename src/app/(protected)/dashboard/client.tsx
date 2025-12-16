// app/dashboard/_components/DashboardContent.tsx (Client Component)
"use client"

import { QuickActions } from "./_components/QuickActions"
import { RecentTransactions } from "./_components/RecentTransactions"
import { LowStockAlerts } from "./_components/LowStockAlerts"
import { PendingTasks } from "./_components/PendingTasks"
import { MaintenanceAlerts } from "./_components/MaintenanceAlerts"
import { PerformanceReports } from "./_components/PerformanceReports"
import { EnhancedMetrics } from "./_components/EnhancedMetrics"

export function DashboardContent() {
  return (
    <>
      {/* Enhanced Top Metrics */}
      <EnhancedMetrics />

      {/* Quick Actions */}
      <QuickActions />

      {/* Performance Reports Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <PerformanceReports />
        <div className="space-y-4">
          <LowStockAlerts />
          <MaintenanceAlerts />
        </div>
      </div>

      {/* Bottom Section with Transactions and Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <div className="space-y-4">
          <PendingTasks />
        </div>
      </div>
    </>
  )
}