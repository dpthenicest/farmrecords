'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AddAnimalTypeModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export function AddAnimalTypeModal({ isOpen, onClose, onSubmit, isLoading = false }: AddAnimalTypeModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🐾',
    category: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const iconOptions = [
    { value: '🐐', label: 'Goat' },
    { value: '🐔', label: 'Chicken' },
    { value: '🐟', label: 'Fish' },
    { value: '🐄', label: 'Cow' },
    { value: '🐖', label: 'Pig' },
    { value: '🐑', label: 'Sheep' },
    { value: '🦆', label: 'Duck' },
    { value: '🦃', label: 'Turkey' },
    { value: '🐾', label: 'Generic' }
  ]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Animal Type"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Icon Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Icon
          </label>
          <div className="grid grid-cols-3 gap-3">
            {iconOptions.map((icon) => (
              <Card 
                key={icon.value}
                className={`cursor-pointer transition-all text-center ${
                  formData.icon === icon.value ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => handleInputChange('icon', icon.value)}
              >
                <CardHeader className="pb-2">
                  <div className="text-2xl mb-1">{icon.value}</div>
                  <CardTitle className="text-xs">{icon.label}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        {/* Basic Information */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type Name
            </label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Goat, Chicken, Catfish"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a category</option>
              <option value="livestock">Livestock</option>
              <option value="poultry">Poultry</option>
              <option value="aquaculture">Aquaculture</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe this animal type, its characteristics, or farming requirements..."
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
            {isLoading ? 'Adding...' : 'Add Animal Type'}
          </Button>
        </div>
      </form>
    </Modal>
  )
} 