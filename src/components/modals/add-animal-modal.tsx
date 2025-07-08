'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimalType } from '@/types'

interface AddAnimalModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export function AddAnimalModal({ isOpen, onClose, onSubmit, isLoading = false }: AddAnimalModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'GOAT' as AnimalType,
    description: '',
    quantity: '1',
    unitPrice: '',
    totalPrice: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let unitPrice = formData.unitPrice
    if (formData.totalPrice && formData.quantity && parseFloat(formData.quantity) > 0) {
      unitPrice = (parseFloat(formData.totalPrice) / parseFloat(formData.quantity)).toFixed(2)
    }
    onSubmit({
      ...formData,
      quantity: parseInt(formData.quantity),
      unitPrice: parseFloat(unitPrice),
      totalPrice: parseFloat(formData.totalPrice)
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const animalTypes = [
    {
      type: 'GOAT',
      title: 'Goat',
      description: 'Goat livestock',
      icon: '🐐'
    },
    {
      type: 'FOWL',
      title: 'Fowl',
      description: 'Poultry birds',
      icon: '🐔'
    },
    {
      type: 'CATFISH',
      title: 'Catfish',
      description: 'Freshwater fish',
      icon: '🐟'
    }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Animal"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6 w-full">
        {/* Animal Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Animal Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
            {animalTypes.map((animal) => (
              <Card 
                key={animal.type}
                className={`cursor-pointer transition-all w-full ${
                  formData.type === animal.type ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleInputChange('type', animal.type)}
              >
                <CardHeader className="pb-3 text-center">
                  <div className="text-2xl mb-2">{animal.icon}</div>
                  <CardTitle className="text-sm">{animal.title}</CardTitle>
                  <CardDescription className="text-xs">{animal.description}</CardDescription>
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
              placeholder={`Enter ${formData.type.toLowerCase()} name or batch`}
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

        {/* Quantity, Unit Price, Total Price */}
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
              value={formData.unitPrice}
              onChange={(e) => handleInputChange('unitPrice', e.target.value)}
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
    </Modal>
  )
} 