"use client"

import React from 'react'
import IncomeTableView from './components/table-view'

export default function IncomeClient() {
  // TODO: Fetch and map income records
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Income Records</h1>
      {/* Analytics summary */}
      <div className="flex space-x-6 mb-6">
        <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center shadow border border-green-100">
          <span className="text-lg font-semibold text-green-700">Total Income</span>
          <span className="text-2xl font-bold text-green-900">$3,500</span>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center shadow border border-blue-100">
          <span className="text-lg font-semibold text-blue-700">Number of Records</span>
          <span className="text-2xl font-bold text-blue-900">12</span>
        </div>
      </div>
      <IncomeTableView />
    </div>
  )
} 