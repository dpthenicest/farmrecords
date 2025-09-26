// app/dashboard/page.tsx (Server Component)
import { MetricCard } from "./_components/MetricCard"
import { QuickActions } from "./_components/QuickActions"
import { DashboardContent } from "./client"

export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Farm Dashboard</h1>
      
      {/* Use client component for dynamic content */}
      <DashboardContent />
    </div>
  )
}