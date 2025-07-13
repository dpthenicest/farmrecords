import React from 'react'

export default function ProfitLossTableView() {
  // TODO: Fetch and map animal batch profit/loss data
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow border border-gray-100">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Batch</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Frame</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Income</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expenses</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody>
          {/* Example row */}
          <tr className="border-b hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap font-semibold">Goat Batch A</td>
            <td className="px-6 py-4 whitespace-nowrap">Jan 2024 - Mar 2024</td>
            <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">₦2,500</td>
            <td className="px-6 py-4 whitespace-nowrap text-red-600 font-bold">₦1,200</td>
            <td className="px-6 py-4 whitespace-nowrap text-green-700 font-bold">₦1,300</td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">Profit</span>
            </td>
          </tr>
          {/* More rows... */}
        </tbody>
      </table>
    </div>
  )
} 