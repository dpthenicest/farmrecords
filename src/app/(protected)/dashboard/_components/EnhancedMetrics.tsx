"use client"

import { useDashboardOverview } from "@/hooks/useDashboard"
import { MetricCard } from "./MetricCard"
import { AlertTriangle, CheckCircle, Clock, Wrench } from "lucide-react"

export function EnhancedMetrics() {
  const { data, loading, error } = useDashboardOverview()

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Failed to load dashboard metrics: {error.message}</p>
      </div>
    )
  }

  const metrics = data?.data

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Financial Metrics */}
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
        title="Total Assets Value" 
        value={`₦${metrics?.totalAssetsValue || '0'}`} 
      />
      <MetricCard 
        title="Outstanding Invoices" 
        value={`${metrics?.outstandingInvoices || 0} invoices`} 
      />

      {/* Operational Metrics */}
      <MetricCard 
        title="Active Batches" 
        value={`${metrics?.activeBatches || 0} batches`} 
      />
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
            <p className="text-2xl font-bold text-gray-900">{metrics?.lowStockItems || 0}</p>
          </div>
          <div className="flex items-center">
            {(metrics?.lowStockItems || 0) > 0 ? (
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-500" />
            )}
          </div>
        </div>
      </div>

      {/* Task Management Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
            <p className="text-2xl font-bold text-gray-900">{metrics?.pendingTasks || 0}</p>
            {(metrics?.overdueTasks || 0) > 0 && (
              <p className="text-xs text-red-600">{metrics?.overdueTasks} overdue</p>
            )}
          </div>
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </div>

      {/* Maintenance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Maintenance Due</p>
            <p className="text-2xl font-bold text-gray-900">{metrics?.upcomingMaintenance || 0}</p>
            {(metrics?.overdueMaintenance || 0) > 0 && (
              <p className="text-xs text-red-600">{metrics?.overdueMaintenance} overdue</p>
            )}
          </div>
          <div className="flex items-center">
            {(metrics?.overdueMaintenance || 0) > 0 ? (
              <AlertTriangle className="w-6 h-6 text-red-500" />
            ) : (
              <Wrench className="w-6 h-6 text-blue-500" />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}