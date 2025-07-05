'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RecordType } from '@/types'

interface EditRecordModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export function EditRecordModal({ isOpen, onClose, record, onSubmit, isLoading = false }: EditRecordModalProps) {
  const [formData, setFormData] = useState({
    type: 'INCOME' as RecordType,
    categoryId: '',
    title: '',
    unitPrice: '',
    quantity: '1',
    total: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
    animalId: ''
  })

  // Update form data when record changes
  useEffect(() => {
    if (record) {
      setFormData({
        type: record.type || 'INCOME',
        categoryId: record.categoryId || '',
        title: record.title || '',
        unitPrice: record.unitPrice?.toString() || '',
        quantity: record.quantity?.toString() || '1',
        total: record.total?.toString() || '',
        note: record.note || '',
        date: record.date || new Date().toISOString().split('T')[0],
        animalId: record.animalId || ''
      })
    }
  }, [record])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const total = parseFloat(formData.unitPrice) * parseInt(formData.quantity)
    onSubmit({
      ...formData,
      unitPrice: parseFloat(formData.unitPrice),
      quantity: parseInt(formData.quantity),
      total
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Record"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Record Type */}
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className={`cursor-pointer transition-all ${
              formData.type === 'INCOME' ? 'ring-2 ring-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => handleInputChange('type', 'INCOME')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-green-600">Income</CardTitle>
              <CardDescription>Money received</CardDescription>
            </CardHeader>
          </Card>
          
          <Card 
            className={`cursor-pointer transition-all ${
              formData.type === 'EXPENSE' ? 'ring-2 ring-red-500 bg-red-50' : ''
            }`}
            onClick={() => handleInputChange('type', 'EXPENSE')}
          >
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-red-600">Expense</CardTitle>
              <CardDescription>Money spent</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <Input
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter record title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              required
            />
          </div>
        </div>

        {/* Financial Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Price
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => handleInputChange('unitPrice', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <Input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              placeholder="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.total || (parseFloat(formData.unitPrice) * parseInt(formData.quantity)).toString()}
              onChange={(e) => handleInputChange('total', e.target.value)}
              placeholder="0.00"
              required
            />
          </div>
        </div>

        {/* Category and Animal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              {formData.type === 'INCOME' ? (
                <>
                  <option value="sale-goats">Sale of Goats</option>
                  <option value="sale-fowls">Sale of Fowls</option>
                  <option value="sale-catfish">Sale of Catfish</option>
                  <option value="manure-sales">Manure Sales</option>
                  <option value="subsidies">Subsidies/Support</option>
                  <option value="other-income">Other Income</option>
                </>
              ) : (
                <>
                  <option value="animal-purchase">Animal Purchase</option>
                  <option value="feed">Feed</option>
                  <option value="drugs-vaccines">Drugs & Vaccines</option>
                  <option value="workers-salary">Workers' Salary</option>
                  <option value="facility-costs">Facility Costs</option>
                  <option value="transportation">Transportation</option>
                  <option value="utilities">Utilities</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="miscellaneous">Miscellaneous</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Animal (Optional)
            </label>
            <select
              value={formData.animalId}
              onChange={(e) => handleInputChange('animalId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an animal</option>
              <option value="goat-batch-a">Goat Batch A</option>
              <option value="fowl-layer-2024">Fowl Layer 2024</option>
              <option value="catfish-pond-1">Catfish Pond 1</option>
            </select>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => handleInputChange('note', e.target.value)}
            placeholder="Add any additional notes..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Record'}
          </Button>
        </div>
      </form>
    </Modal>
  )
} 