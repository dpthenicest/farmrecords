import React from 'react'

export default function ProfitLossGridView() {
  // TODO: Fetch and map animal batch profit/loss data
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Example card */}
      <div className="bg-white rounded-lg shadow p-6 flex flex-col items-start border border-gray-100">
        <h2 className="text-xl font-semibold mb-2">Goat Batch A</h2>
        <p className="text-gray-500 mb-1">Time frame: Jan 2024 - Mar 2024</p>
        <p className="mb-2">Total Income: <span className="text-green-600 font-bold">$2,500</span></p>
        <p className="mb-2">Total Expenses: <span className="text-red-600 font-bold">$1,200</span></p>
        <p className="mb-2">Net Profit: <span className="text-green-700 font-bold">$1,300</span></p>
        <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">Profit</span>
      </div>
      {/* More cards... */}
    </div>
  )
} 