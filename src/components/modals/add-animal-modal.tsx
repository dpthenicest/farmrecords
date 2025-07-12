'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMainData } from '@/providers/main-data-provider'

interface AddAnimalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export function AddAnimalModal({ isOpen, onClose, onSubmit, isLoading = false }: AddAnimalModalProps) {
  const { animalTypes, fetchAnimalTypes } = useMainData()
  const [formData, setFormData] = useState({
    name: '',
    animalTypeId: '',
    description: '',
    quantity: '1',
    purchasePrice: '',
    totalPrice: '',
    note: '',
    purchaseDate: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  })

  useEffect(() => {
    if (isOpen) {
      fetchAnimalTypes()
      // Set default animal type if available
      if (animalTypes.length > 0 && !formData.animalTypeId) {
        setFormData(prev => ({ ...prev, animalTypeId: animalTypes[0].id }))
      }
    }
  }, [isOpen, fetchAnimalTypes, animalTypes])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let purchasePrice = formData.purchasePrice
    if (formData.totalPrice && formData.quantity && parseFloat(formData.quantity) > 0) {
      purchasePrice = (parseFloat(formData.totalPrice) / parseFloat(formData.quantity)).toFixed(2)
    }
    onSubmit({
      ...formData,
      quantity: parseInt(formData.quantity),
      purchasePrice: parseFloat(purchasePrice),
      totalPrice: parseFloat(formData.totalPrice)
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const selectedAnimalType = animalTypes.find(type => type.id === formData.animalTypeId)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Animal"
      size="md"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6 w-full">
          {/* Animal Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Animal Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
              {animalTypes.map((animalType) => (
                <Card 
                  key={animalType.id}
                  className={`cursor-pointer transition-all w-full ${
                    formData.animalTypeId === animalType.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleInputChange('animalTypeId', animalType.id)}
                >
                  <CardHeader className="pb-3 text-center">
                    <div className="text-2xl mb-2">{animalType.emoji}</div>
                    <CardTitle className="text-sm">{animalType.type.charAt(0).toUpperCase() + animalType.type.slice(1).toLowerCase()}</CardTitle>
                    <CardDescription className="text-xs">{animalType.type.toLowerCase()} livestock</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Animal Name/Batch
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={selectedAnimalType ? `Enter ${selectedAnimalType.type.toLowerCase()} name or batch` : 'Enter animal name or batch'}
                required
                className="w-full"
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Add description, breed, age, or other details..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>

          {/* Purchase Information */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Purchase Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purchase Date
                </label>
                <Input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  required
                  className="w-full"
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note (Optional)
                </label>
                <Input
                  value={formData.note}
                  onChange={(e) => handleInputChange('note', e.target.value)}
                  placeholder="Purchase notes, seller info, etc."
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
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
                  Unit Price
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                  placeholder="0.00"
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
              {isLoading ? 'Adding...' : 'Add Animal'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
} 