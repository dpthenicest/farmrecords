import React from 'react'

interface ProfitLossTableViewProps {
  batches?: any[]
  isLoading?: boolean
  onViewDetails?: (animal: any) => void
}

export default function ProfitLossTableView({ batches = [], isLoading = false, onViewDetails }: ProfitLossTableViewProps) {
  if (isLoading) {
    return <div>Loading...</div>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">Batch</th>
            <th className="text-left py-3 px-4 font-medium">Time Frame</th>
            <th className="text-left py-3 px-4 font-medium">Income</th>
            <th className="text-left py-3 px-4 font-medium">Expenses</th>
            <th className="text-left py-3 px-4 font-medium">Net Profit</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-left py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {batches.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-8 text-gray-500">
                No batches found
              </td>
            </tr>
          ) : (
            batches.map((batch) => (
              <tr key={batch.id} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-semibold">{batch.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{batch.timeFrame}</td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">₦{batch.income.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-red-600 font-bold">₦{batch.expenses.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-green-700 font-bold">₦{batch.net.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">Profit</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    className="text-blue-600 hover:underline"
                    onClick={() => onViewDetails && onViewDetails(batch.animal ? batch.animal : batch)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
} 