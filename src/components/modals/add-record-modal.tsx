'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMainData } from '@/providers/main-data-provider'

interface AddRecordModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export function AddRecordModal({ isOpen, onClose, onSubmit, isLoading = false }: AddRecordModalProps) {
  const { data: session } = useSession()
  const { categories, animals, fetchCategories, fetchAnimals } = useMainData()
  const [formData, setFormData] = useState({
    categoryId: '',
    unitPrice: '',
    quantity: '1',
    totalPrice: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
    animalId: ''
  })

  // Fetch categories and animals when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories()
      fetchAnimals()
    }
  }, [isOpen, fetchCategories, fetchAnimals])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Calculate unit price if only total price is provided
    let finalUnitPrice = formData.unitPrice
    if (!formData.unitPrice && formData.totalPrice && formData.quantity) {
      const totalPrice = parseFloat(formData.totalPrice)
      const quantity = parseInt(formData.quantity)
      if (!isNaN(totalPrice) && !isNaN(quantity) && quantity > 0) {
        finalUnitPrice = (totalPrice / quantity).toFixed(2)
      }
    }
    
    // Calculate total price if only unit price is provided
    let finalTotalPrice = formData.totalPrice
    if (!formData.totalPrice && formData.unitPrice && formData.quantity) {
      const unitPrice = parseFloat(formData.unitPrice)
      const quantity = parseInt(formData.quantity)
      if (!isNaN(unitPrice) && !isNaN(quantity)) {
        finalTotalPrice = (unitPrice * quantity).toFixed(2)
      }
    }
    
    onSubmit({
      ...formData,
      unitPrice: parseFloat(finalUnitPrice || '0'),
      quantity: parseInt(formData.quantity),
      totalPrice: parseFloat(finalTotalPrice || '0'),
      userId: session?.user?.id // Include userId from session
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Auto-calculate total price when unit price or quantity changes
      if (field === 'unitPrice' && value && newData.quantity) {
        const unitPrice = parseFloat(value)
        const quantity = parseInt(newData.quantity)
        if (!isNaN(unitPrice) && !isNaN(quantity)) {
          newData.totalPrice = (unitPrice * quantity).toFixed(2)
        }
      }
      
      // Auto-calculate unit price when total price changes
      if (field === 'totalPrice' && value && newData.quantity) {
        const totalPrice = parseFloat(value)
        const quantity = parseInt(newData.quantity)
        if (!isNaN(totalPrice) && !isNaN(quantity) && quantity > 0) {
          newData.unitPrice = (totalPrice / quantity).toFixed(2)
        }
      }
      
      // Auto-calculate total price when quantity changes (if unit price exists)
      if (field === 'quantity' && value && newData.unitPrice) {
        const unitPrice = parseFloat(newData.unitPrice)
        const quantity = parseInt(value)
        if (!isNaN(unitPrice) && !isNaN(quantity)) {
          newData.totalPrice = (unitPrice * quantity).toFixed(2)
        }
      }
      
      return newData
    })
  }

  // Group categories by type
  const incomeCategories = categories.filter(cat => cat.categoryType?.name === 'INCOME')
  const expenseCategories = categories.filter(cat => cat.categoryType?.name === 'EXPENSE')

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Record"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
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
              
              {/* Income Categories */}
              {incomeCategories.length > 0 && (
                <optgroup label="Income Categories">
                  {incomeCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </optgroup>
              )}
              
              {/* Expense Categories */}
              {expenseCategories.length > 0 && (
                <optgroup label="Expense Categories">
                  {expenseCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </optgroup>
              )}
              
              {/* Fallback options if no categories exist */}
              {categories.length === 0 && (
                <>
                  <optgroup label="Income Categories">
                    <option value="sale-goats">Sale of Animals</option>
                    <option value="manure-sales">Manure Sales</option>
                    <option value="subsidies">Subsidies/Support</option>
                    <option value="other-income">Other Income</option>
                  </optgroup>
                  <optgroup label="Expense Categories">
                    <option value="animal-purchase">Animal Purchase</option>
                    <option value="feed">Feed</option>
                    <option value="drugs-vaccines">Drugs & Vaccines</option>
                    <option value="workers-salary">Workers' Salary</option>
                    <option value="facility-costs">Facility Costs</option>
                    <option value="transportation">Transportation</option>
                    <option value="utilities">Utilities</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="maintenance">Animal Loss</option>
                    <option value="miscellaneous">Miscellaneous</option>
                  </optgroup>
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
              {animals.length > 0 ? (
                animals.map((animal) => (
                  <option key={animal.id} value={animal.id}>
                    {animal.name} ({animal.animalType?.type || 'Unknown'})
                  </option>
                ))
              ) : (
                <option value="" disabled>No animal batch recorded</option>
              )}
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
              min="1"
              required
              className="w-full"
            />
          </div>

          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Price
            </label>
            <Input
              type="number"
              step="0.01"
              value={formData.totalPrice}
              onChange={(e) => handleInputChange('totalPrice', e.target.value)}
              placeholder="0.00"
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