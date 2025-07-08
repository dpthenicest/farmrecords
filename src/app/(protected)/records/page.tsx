'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AddRecordModal } from "@/components/modals/add-record-modal"
import { ViewRecordModal } from "@/components/modals/view-record-modal"
import { EditRecordModal } from "@/components/modals/edit-record-modal"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { ActionMenu } from "@/components/ui/action-menu"

export default function RecordsPage() {
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false)
  const [isViewRecordModalOpen, setIsViewRecordModalOpen] = useState(false)
  const [isEditRecordModalOpen, setIsEditRecordModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedRecord, setSelectedRecord] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAddRecord = async (data: any) => {
    setIsLoading(true)
    try {
      // TODO: Implement API call to add record
      console.log('Adding record:', data)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsAddRecordModalOpen(false)
    } catch (error) {
      console.error('Error adding record:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRecord = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement API call to delete record
      console.log('Deleting record:', selectedRecord)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsDeleteModalOpen(false)
      setSelectedRecord(null)
    } catch (error) {
      console.error('Error deleting record:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewRecord = (record: any) => {
    setSelectedRecord(record)
    setIsViewRecordModalOpen(true)
  }

  const handleEditRecord = (record: any) => {
    setSelectedRecord(record)
    setIsEditRecordModalOpen(true)
  }

  const handleUpdateRecord = async (data: any) => {
    setIsLoading(true)
    try {
      // TODO: Implement API call to update record
      console.log('Updating record:', data)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsEditRecordModalOpen(false)
      setSelectedRecord(null)
    } catch (error) {
      console.error('Error updating record:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (record: any) => {
    setSelectedRecord(record)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Records</h1>
          <p className="text-gray-600">Manage your farm transactions and records</p>
        </div>
        <Button 
          className="flex items-center space-x-2"
          onClick={() => setIsAddRecordModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Add Record</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter your records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search records..." className="pl-10" />
              </div>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Records Table */}
      <Card>
        <CardHeader>
          <CardTitle>Records</CardTitle>
          <CardDescription>A list of all your farm records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Animal</th>
                  <th className="text-left py-3 px-4 font-medium">Amount</th>
                  <th className="text-left py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">2024-01-15</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Income
                    </span>
                  </td>
                  <td className="py-3 px-4">Sale of Goats</td>
                  <td className="py-3 px-4">Goat Batch A</td>
                  <td className="py-3 px-4 font-medium text-green-600">+$2,500</td>
                  <td className="py-3 px-4">
                    <ActionMenu
                      onView={() => handleViewRecord({ 
                        id: 1, 
                        type: 'INCOME',
                        date: '2024-01-15',
                        category: 'Sale of Goats',
                        animal: 'Goat Batch A',
                        unitPrice: 2500,
                        quantity: 1,
                        total: 2500,
                        note: 'Sold 1 goat for breeding'
                      })}
                      onEdit={() => handleEditRecord({ 
                        id: 1, 
                        type: 'INCOME',
                        categoryId: 'sale-goats',
                        date: '2024-01-15',
                        animalId: 'goat-batch-a',
                        unitPrice: 2500,
                        quantity: 1,
                        total: 2500,
                        note: 'Sold 1 goat for breeding'
                      })}
                      onDelete={() => handleDeleteClick({ id: 1 })}
                    />
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">2024-01-14</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                      Expense
                    </span>
                  </td>
                  <td className="py-3 px-4">Feed</td>
                  <td className="py-3 px-4 font-medium text-red-600">-$450</td>
                  <td className="py-3 px-4">
                    <ActionMenu
                      onView={() => handleViewRecord({ 
                        id: 2, 
                        type: 'EXPENSE',
                        date: '2024-01-14',
                        category: 'Feed',
                        animal: null,
                        unitPrice: 450,
                        quantity: 1,
                        total: 450,
                        note: 'Purchased feed for all animals'
                      })}
                      onEdit={() => handleEditRecord({ 
                        id: 2, 
                        type: 'EXPENSE',
                        categoryId: 'feed',
                        date: '2024-01-14',
                        animalId: '',
                        unitPrice: 450,
                        quantity: 1,
                        total: 450,
                        note: 'Purchased feed for all animals'
                      })}
                      onDelete={() => handleDeleteClick({ id: 2 })}
                    />
                  </td>
                </tr>
                <tr className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">2024-01-13</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      Income
                    </span>
                  </td>
                  <td className="py-3 px-4">Sale of Fowls</td>
                  <td className="py-3 px-4">Fowl Layer 2024</td>
                  <td className="py-3 px-4 font-medium text-green-600">+$800</td>
                  <td className="py-3 px-4">
                    <ActionMenu
                      onView={() => handleViewRecord({ 
                        id: 3, 
                        type: 'INCOME',
                        date: '2024-01-13',
                        category: 'Sale of Fowls',
                        animal: 'Fowl Layer 2024',
                        unitPrice: 800,
                        quantity: 1,
                        total: 800,
                        note: 'Sold eggs from layer chickens'
                      })}
                      onEdit={() => handleEditRecord({ 
                        id: 3, 
                        type: 'INCOME',
                        categoryId: 'sale-fowls',
                        date: '2024-01-13',
                        animalId: 'fowl-layer-2024',
                        unitPrice: 800,
                        quantity: 1,
                        total: 800,
                        note: 'Sold eggs from layer chickens'
                      })}
                      onDelete={() => handleDeleteClick({ id: 3 })}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddRecordModal
        isOpen={isAddRecordModalOpen}
        onClose={() => setIsAddRecordModalOpen(false)}
        onSubmit={handleAddRecord}
        isLoading={isLoading}
      />

      <ViewRecordModal
        isOpen={isViewRecordModalOpen}
        onClose={() => {
          setIsViewRecordModalOpen(false)
          setSelectedRecord(null)
        }}
        record={selectedRecord}
        onEdit={() => {
          setIsViewRecordModalOpen(false)
          setIsEditRecordModalOpen(true)
        }}
      />

      <EditRecordModal
        isOpen={isEditRecordModalOpen}
        onClose={() => {
          setIsEditRecordModalOpen(false)
          setSelectedRecord(null)
        }}
        record={selectedRecord}
        onSubmit={handleUpdateRecord}
        isLoading={isLoading}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteRecord}
        title="Delete Record"
        message={`Are you sure you want to delete "${selectedRecord?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isLoading}
      />
    </div>
  )
} 