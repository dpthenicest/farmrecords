// app/dashboard/_components/DashboardContent.tsx (Client Component)
"use client"

import { MetricCard } from "./_components/MetricCard"
import { QuickActions } from "./_components/QuickActions"
import { RecentTransactions } from "./_components/RecentTransactions"
import { LowStockAlerts } from "./_components/LowStockAlerts"
import { PendingTasks } from "./_components/PendingTasks"
import { useDashboardOverview } from "@/hooks/useDashboard"

export function DashboardContent() {
  const { data, loading, error } = useDashboardOverview()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load dashboard data: {error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  const metrics = data?.data

  return (
    <>
      {/* Top Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Total Revenue" 
          value={`₦${metrics?.totalRevenue || '0'}`} 
          change="+12.5%" 
          positive 
        />
        <MetricCard 
          title="Net Profit" 
          value={`₦${metrics?.netProfit || '0'}`} 
          change="37.6%" 
          positive 
        />
        <MetricCard 
          title="Outstanding Invoices" 
          value={`${metrics?.outstandingInvoices || 0} invoices`} 
        />
        <MetricCard 
          title="Active Batches" 
          value={`${metrics?.activeBatches || 0} batches`} 
        />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Grid with transactions, low stock, tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        <div className="space-y-4">
          <LowStockAlerts />
          <PendingTasks />
        </div>
      </div>
    </>
  )
}