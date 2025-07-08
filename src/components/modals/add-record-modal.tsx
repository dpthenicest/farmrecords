'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RecordType, CategoryType } from '@/types'

interface AddRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export function AddRecordModal({ isOpen, onClose, onSubmit, isLoading = false }: AddRecordModalProps) {
  const [formData, setFormData] = useState({
    type: 'INCOME' as RecordType,
    categoryId: '',
    unitPrice: '',
    quantity: '1',
    total: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
    animalId: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let unitPrice = formData.unitPrice
    if (formData.total && formData.quantity && parseFloat(formData.quantity) > 0) {
      unitPrice = (parseFloat(formData.total) / parseFloat(formData.quantity)).toFixed(2)
    }
    onSubmit({
      ...formData,
      unitPrice: parseFloat(unitPrice),
      quantity: parseInt(formData.quantity),
      total: parseFloat(formData.total)
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Record"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        {/* Record Type */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <Card 
            className={`cursor-pointer transition-all w-full ${
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
            className={`cursor-pointer transition-all w-full ${
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

        {/* Category and Animal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="w-full">
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

          <div className="w-full">
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

        {/* Financial Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unit Price
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.unitPrice}
              onChange={(e) => handleInputChange('unitPrice', e.target.value)}
              placeholder="0.00"
              className="w-full"
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <Input
              type="number"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              placeholder="1"
              required
              className="w-full"
            />
          </div>

          <div className="w-full">
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
              className="w-full"
            />
          </div>
        </div>

        {/* Date */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date
          </label>
          <Input
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            required
            className="w-full"
          />
        </div>

        {/* Notes */}
        <div className="w-full">
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
        <div className="flex justify-end space-x-3 pt-4 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="w-32"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-32"
          >
            {isLoading ? 'Adding...' : 'Add Record'}
          </Button>
        </div>
      </form>
    </Modal>
  )
} 