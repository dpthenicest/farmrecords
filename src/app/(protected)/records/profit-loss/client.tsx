"use client"

import { useState } from 'react'
import ProfitLossGridView from './components/grid-view'
import ProfitLossTableView from './components/table-view'

export default function ProfitLossClient() {
  const [view, setView] = useState<'grid' | 'table'>('grid')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Profit / Loss by Animal Batch</h1>
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-700">View:</span>
          <button
            className={`px-4 py-2 rounded-l-lg border border-gray-300 focus:outline-none transition-colors ${view === 'grid' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setView('grid')}
          >
            Grid
          </button>
          <button
            className={`px-4 py-2 rounded-r-lg border border-gray-300 focus:outline-none transition-colors ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
            onClick={() => setView('table')}
          >
            Table
          </button>
        </div>
      </div>
      {view === 'grid' ? <ProfitLossGridView /> : <ProfitLossTableView />}
    </div>
  )
} 