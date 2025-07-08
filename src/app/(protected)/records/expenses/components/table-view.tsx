import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ExpensesTableView({ records = [] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Records</CardTitle>
        <CardDescription>A list of all your expense records</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium">Date</th>
                <th className="text-left py-3 px-4 font-medium">Category</th>
                <th className="text-left py-3 px-4 font-medium">Animal</th>
                <th className="text-left py-3 px-4 font-medium">Amount</th>
                <th className="text-left py-3 px-4 font-medium">Note</th>
                <th className="text-left py-3 px-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Example row */}
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">2024-01-14</td>
                <td className="py-3 px-4">Feed</td>
                <td className="py-3 px-4">-</td>
                <td className="py-3 px-4 font-medium text-red-600">-$450</td>
                <td className="py-3 px-4">Purchased feed for all animals</td>
                <td className="py-3 px-4">
                  <Button variant="outline" size="sm">View</Button>
                  <Button variant="outline" size="sm" className="ml-2">Edit</Button>
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