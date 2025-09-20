'use client'

import { useEffect, useState } from 'react'
import { useMainData } from '@/providers/main-data-provider'
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

  const {
    records,
    categories,
    animals,
    animalTypes,
    fetchRecords,
    fetchCategories,
    fetchAnimals,
    fetchAnimalTypes,
    addRecord,
    updateRecord,
    deleteRecord,
    loading,
    error
  } = useMainData()

  useEffect(() => {
    fetchRecords()
    fetchCategories()
    fetchAnimals()
    fetchAnimalTypes()
  }, [fetchRecords, fetchCategories, fetchAnimals, fetchAnimalTypes])

  const handleAddRecord = async (data: any) => {
    setIsLoading(true)
    try {
      await addRecord(data)
      setIsAddRecordModalOpen(false)
    } catch (error) {
      console.error('Error adding record:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateRecord = async (data: any) => {
    setIsLoading(true)
    try {
      await updateRecord(selectedRecord?.id, data)
      setIsEditRecordModalOpen(false)
      setSelectedRecord(null)
    } catch (error) {
      console.error('Error updating record:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteRecord = async () => {
    setIsLoading(true)
    try {
      await deleteRecord(selectedRecord?.id)
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
                {loading || isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Loading records...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 text-lg font-medium">
                      No records available.
                    </td>
                  </tr>
                ) : (
                  records.map((record: any) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{record.date}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 bg-${record.category?.color}-100 text-${record.category?.color}-800 rounded-full text-xs`}>
                          {record.category?.categoryType?.name || 'Unknown'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{record.category?.name || 'Unknown'}</td>
                      <td className="py-3 px-4">{record.animal?.name || 'N/A'}</td>
                      <td className={`py-3 px-4 font-medium text-${record.category?.color}-600`}>₦{(record.unitPrice * record.quantity).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <ActionMenu
                          onView={() => handleViewRecord(record)}
                          onEdit={() => handleEditRecord(record)}
                          onDelete={() => handleDeleteClick(record)}
                        />
                      </td>
                    </tr>
                  ))
                )}
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
        message={`Are you sure you want to delete the record "${selectedRecord?.category?.name || 'Unknown'}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isLoading}
      />
    </div>
  )
} 