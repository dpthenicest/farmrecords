'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimalType } from '@/types'

interface EditAnimalModalProps {
  isOpen: boolean
  onClose: () => void
  animal: any
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export function EditAnimalModal({ isOpen, onClose, animal, onSubmit, isLoading = false }: EditAnimalModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'GOAT' as AnimalType,
    description: ''
  })

  // Update form data when animal changes
  useEffect(() => {
    if (animal) {
      setFormData({
        name: animal.name || '',
        type: animal.type || 'GOAT',
        description: animal.description || ''
      })
    }
  }, [animal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
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
      title="Edit Animal"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Animal Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Animal Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            {animalTypes.map((animalType) => (
              <Card 
                key={animalType.type}
                className={`cursor-pointer transition-all ${
                  formData.type === animalType.type ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleInputChange('type', animalType.type)}
              >
                <CardHeader className="pb-3 text-center">
                  <div className="text-2xl mb-2">{animalType.icon}</div>
                  <CardTitle className="text-sm">{animalType.title}</CardTitle>
                  <CardDescription className="text-xs">{animalType.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Animal Name/Batch
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder={`Enter ${formData.type.toLowerCase()} name or batch`}
              required
            />
          </div>

          <div>
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
            {isLoading ? 'Updating...' : 'Update Animal'}
          </Button>
        </div>
      </form>
    </Modal>
  )
} 