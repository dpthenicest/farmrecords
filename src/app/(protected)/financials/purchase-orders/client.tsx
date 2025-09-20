"use client"

import React, { useState } from 'react'
import ProfitLossGridView from './components/grid-view'
import ProfitLossTableView from './components/table-view'
import { ViewAnimalRecordsModal } from '@/components/modals/view-animal-records-modal'
import { useMainData } from '@/providers/main-data-provider'

export default function ProfitLossClient() {
  const [view, setView] = useState<'grid' | 'table'>('grid')
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null)
  const [isViewAnimalRecordsModalOpen, setIsViewAnimalRecordsModalOpen] = useState(false)
  const { animals, records } = useMainData()

  // Aggregate profit/loss by animal batch
  const batches = animals.map(animal => {
    const animalRecords = records.filter(r => r.animalId === animal.id)
    const income = animalRecords.filter(r => r.category?.categoryType?.name === 'INCOME').reduce((sum, r) => sum + parseFloat(r.unitPrice) * r.quantity, 0)
    const expenses = animalRecords.filter(r => r.category?.categoryType?.name === 'EXPENSE').reduce((sum, r) => sum + parseFloat(r.unitPrice) * r.quantity, 0)
    const net = income - expenses
    return {
      ...animal,
      income,
      expenses,
      net,
      status: net >= 0 ? 'Profit' : 'Loss',
    }
  })

  const isLoading = false // You can update this if you have loading logic

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
      {view === 'grid' ? (
        <ProfitLossGridView 
          batches={batches} 
          isLoading={isLoading}
          onViewDetails={(animal: any) => {
            setSelectedAnimal(animal)
            setIsViewAnimalRecordsModalOpen(true)
          }}
        />
      ) : (
        <ProfitLossTableView 
          batches={batches} 
          isLoading={isLoading}
          onViewDetails={(animal: any) => {
            setSelectedAnimal(animal)
            setIsViewAnimalRecordsModalOpen(true)
          }}
        />
      )}
      <ViewAnimalRecordsModal
        isOpen={isViewAnimalRecordsModalOpen}
        onClose={() => {
          setIsViewAnimalRecordsModalOpen(false)
          setSelectedAnimal(null)
        }}
        animal={selectedAnimal}
      />
    </div>
  )
} 