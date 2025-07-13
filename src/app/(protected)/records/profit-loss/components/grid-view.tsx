import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useMainData } from '@/providers/main-data-provider'

interface ProfitLossGridViewProps {
  batches: any[]
  isLoading: boolean
  onViewDetails: (animal: any) => void
}

export default function ProfitLossGridView({ batches, isLoading, onViewDetails }: ProfitLossGridViewProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {batches.map(batch => (
        <Card key={batch.id}>
          <CardHeader>
            <CardTitle>{batch.name}</CardTitle>
            <CardDescription>{batch.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Total Income: <span className="text-green-600 font-bold">₦{batch.income.toLocaleString()}</span></p>
              <p className="text-sm text-gray-600">Total Expenses: <span className="text-red-600 font-bold">₦{batch.expenses.toLocaleString()}</span></p>
              <p className="text-sm text-gray-600">Net Profit: <span className={`${batch.net >= 0 ? 'text-green-700' : 'text-red-700'} font-bold`}>₦{batch.net.toLocaleString()}</span></p>
              <div className="flex items-center space-x-2 mt-2">
                <span className={`inline-block px-3 py-1 rounded-full ${batch.net >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs font-semibold`}>{batch.status}</span>
                <Button variant="outline" size="sm" onClick={() => onViewDetails(batch)}>View Details</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 