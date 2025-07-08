import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ProfitLossTableView({ batches = [] }) {
  // TODO: Fetch and map animal batch profit/loss data
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
                <th className="text-left py-3 px-4 font-medium">Time Frame</th>
                <th className="text-left py-3 px-4 font-medium">Income</th>
                <th className="text-left py-3 px-4 font-medium">Expenses</th>
                <th className="text-left py-3 px-4 font-medium">Net</th>
                <th className="text-left py-3 px-4 font-medium">Status</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Example row */}
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold">Goat Batch A</td>
                <td className="py-3 px-4">Jan 2024 - Mar 2024</td>
                <td className="py-3 px-4 text-green-600 font-bold">$2,500</td>
                <td className="py-3 px-4 text-red-600 font-bold">$1,200</td>
                <td className="py-3 px-4 text-green-700 font-bold">$1,300</td>
                <td className="py-3 px-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">Profit</span>
                </td>
                <td className="py-3 px-4">
                  <Button variant="outline" size="sm">View</Button>
                </td>
              </tr>
              {/* More rows... */}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
} 