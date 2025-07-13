import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMainData } from '@/providers/main-data-provider'

interface ProfitLossTableViewProps {
  batches: any[]
  isLoading: boolean
  onViewDetails: (animal: any) => void
}

export default function ProfitLossTableView({ batches, isLoading, onViewDetails }: ProfitLossTableViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit / Loss by Animal Batch</CardTitle>
        <CardDescription>Summary of profit or loss for each animal batch</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Batch</th>
                <th className="text-left py-3 px-4 font-medium">Income</th>
                <th className="text-left py-3 px-4 font-medium">Expenses</th>
                <th className="text-left py-3 px-4 font-medium">Net</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {batches.map(batch => (
                <tr key={batch.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold">{batch.name}</td>
                  <td className="py-3 px-4 text-green-600 font-bold">₦{batch.income.toLocaleString()}</td>
                  <td className="py-3 px-4 text-red-600 font-bold">₦{batch.expenses.toLocaleString()}</td>
                  <td className={"py-3 px-4 font-bold " + (batch.net >= 0 ? 'text-green-700' : 'text-red-700')}>₦{batch.net.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-3 py-1 rounded-full ${batch.net >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs font-semibold`}>{batch.status}</span>
                  </td>
                  <td className="py-3 px-4">
                    <Button variant="outline" size="sm" onClick={() => onViewDetails(batch)}>View</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
} 