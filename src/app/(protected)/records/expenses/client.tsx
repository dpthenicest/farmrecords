"use client"

import React from 'react'
import ExpensesTableView from './components/table-view'

export default function ExpensesClient() {
  // TODO: Fetch and map expense records
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Expense Records</h1>
      {/* Analytics summary */}
      <div className="flex space-x-6 mb-6">
        <div className="bg-red-50 rounded-lg p-4 flex flex-col items-center shadow border border-red-100">
          <span className="text-lg font-semibold text-red-700">Total Expenses</span>
          <span className="text-2xl font-bold text-red-900">$1,800</span>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center shadow border border-blue-100">
          <span className="text-lg font-semibold text-blue-700">Number of Records</span>
          <span className="text-2xl font-bold text-blue-900">8</span>
        </div>
      </div>
      <ExpensesTableView />
    </div>
  )
} 