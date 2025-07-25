import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface IncomeTableViewProps {
  records?: any[]
  isLoading?: boolean
  onViewRecord?: (record: any) => void
}

export default function IncomeTableView({ records = [], isLoading = false, onViewRecord }: IncomeTableViewProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Income Records</CardTitle>
          <CardDescription>A list of all your income records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading income records...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Records</CardTitle>
        <CardDescription>A list of all your income records</CardDescription>
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
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No income records found
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      {record.category?.name || 'Unknown'}
                    </td>
                    <td className="py-3 px-4">
                      {record.animal?.name || '-'}
                    </td>
                    <td className="py-3 px-4 font-medium text-green-600">
                      +₦{(record.unitPrice * record.quantity).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      {record.note || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <Button variant="outline" size="sm" onClick={() => onViewRecord && onViewRecord(record)}>View</Button>
                      {/* <Button variant="outline" size="sm" className="ml-2">Edit</Button> */}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
} 