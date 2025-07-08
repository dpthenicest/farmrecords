import React, { useState } from 'react'

export default function FilterModal({ isOpen, onClose, onApply, filters, animalTypes = [], animalBatches = [], categories = [] }) {
  const [localFilters, setLocalFilters] = useState(filters || {
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    animalType: '',
    animalBatch: '',
    category: '',
  })

  const handleChange = (e) => {
    setLocalFilters({ ...localFilters, [e.target.name]: e.target.value })
  }

  const handleApply = () => {
    onApply(localFilters)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Filter Records</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input type="date" name="dateFrom" value={localFilters.dateFrom} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input type="date" name="dateTo" value={localFilters.dateTo} onChange={handleChange} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Min</label>
              <input type="number" name="amountMin" value={localFilters.amountMin} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Max</label>
              <input type="number" name="amountMax" value={localFilters.amountMax} onChange={handleChange} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Animal Type</label>
            <select name="animalType" value={localFilters.animalType} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">All</option>
              {animalTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Animal Batch</label>
            <select name="animalBatch" value={localFilters.animalBatch} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">All</option>
              {animalBatches.map(batch => <option key={batch.id} value={batch.id}>{batch.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select name="category" value={localFilters.category} onChange={handleChange} className="w-full border rounded px-3 py-2">
              <option value="">All</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded bg-gray-200 text-gray-700 font-semibold">Cancel</button>
          <button onClick={handleApply} className="px-4 py-2 rounded bg-blue-600 text-white font-semibold">Apply</button>
        </div>
      </div>
    </div>
  )
} 