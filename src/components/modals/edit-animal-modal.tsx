'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMainData } from '@/providers/main-data-provider'

interface EditAnimalModalProps {
  isOpen: boolean
  onClose: () => void
  animal: any
  onSubmit: (data: any) => void
  isLoading?: boolean
}

export function EditAnimalModal({ isOpen, onClose, animal, onSubmit, isLoading = false }: EditAnimalModalProps) {
  const { animalTypes, fetchAnimalTypes } = useMainData()
  const [formData, setFormData] = useState({
    name: '',
    animalTypeId: '',
    description: '',
    quantity: '1',
    purchasePrice: '',
    totalPrice: '',
    note: '',
    purchaseDate: new Date().toISOString().split('T')[0]
  })
  const [purchaseRecord, setPurchaseRecord] = useState<any>(null)
  const [purchaseRecordId, setPurchaseRecordId] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchAnimalTypes()
      if (animal?.id) {
        fetchAnimalPurchaseRecord(animal.id)
      }
    }
  }, [isOpen, fetchAnimalTypes, animal?.id])

  const fetchAnimalPurchaseRecord = async (animalId: string) => {
    try {
      // Fetch the animal's purchase record (assuming it's the first record for this animal)
      const response = await fetch(`/api/records?animalId=${animalId}&limit=1`)
      if (response.ok) {
        const data = await response.json()
        if (data.records && data.records.length > 0) {
          const record = data.records[0]
          setPurchaseRecord(record)
          setPurchaseRecordId(record.id)
          // Update form data with purchase record information
          setFormData(prev => ({
            ...prev,
            quantity: record.quantity?.toString() || '1',
            purchasePrice: record.unitPrice?.toString() || '',
            totalPrice: ((record.unitPrice || 0) * (record.quantity || 1)).toString(),
            note: record.note || '',
            purchaseDate: record.date ? new Date(record.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching animal purchase record:', error)
    }
  }

  // Update form data when animal changes
  useEffect(() => {
    if (animal) {
      console.log('Animal data for editing:', animal) // Debug log
      setFormData(prev => ({
        ...prev,
        name: animal.name || '',
        animalTypeId: animal.animalTypeId || '',
        description: animal.description || '',
        // Keep purchase data if already loaded, otherwise use defaults
        quantity: prev.quantity || '1',
        purchasePrice: prev.purchasePrice || '',
        totalPrice: prev.totalPrice || '',
        note: prev.note || '',
        purchaseDate: prev.purchaseDate || new Date().toISOString().split('T')[0]
      }))
    }
  }, [animal])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Calculate purchase price if only total price is provided
    let finalPurchasePrice = formData.purchasePrice
    if (!formData.purchasePrice && formData.totalPrice && formData.quantity) {
      const totalPrice = parseFloat(formData.totalPrice)
      const quantity = parseInt(formData.quantity)
      if (!isNaN(totalPrice) && !isNaN(quantity) && quantity > 0) {
        finalPurchasePrice = (totalPrice / quantity).toFixed(2)
      }
    }
    
    // Calculate total price if only purchase price is provided
    let finalTotalPrice = formData.totalPrice
    if (!formData.totalPrice && formData.purchasePrice && formData.quantity) {
      const purchasePrice = parseFloat(formData.purchasePrice)
      const quantity = parseInt(formData.quantity)
      if (!isNaN(purchasePrice) && !isNaN(quantity)) {
        finalTotalPrice = (purchasePrice * quantity).toFixed(2)
      }
    }
    
    onSubmit({
      ...formData,
      quantity: parseInt(formData.quantity),
      purchasePrice: parseFloat(finalPurchasePrice || '0'),
      totalPrice: parseFloat(finalTotalPrice || '0'),
      purchaseRecordId
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }
      
      // Auto-calculate total price when purchase price or quantity changes
      if (field === 'purchasePrice' && value && newData.quantity) {
        const purchasePrice = parseFloat(value)
        const quantity = parseInt(newData.quantity)
        if (!isNaN(purchasePrice) && !isNaN(quantity)) {
          newData.totalPrice = (purchasePrice * quantity).toFixed(2)
        }
      }
      
      // Auto-calculate purchase price when total price changes
      if (field === 'totalPrice' && value && newData.quantity) {
        const totalPrice = parseFloat(value)
        const quantity = parseInt(newData.quantity)
        if (!isNaN(totalPrice) && !isNaN(quantity) && quantity > 0) {
          newData.purchasePrice = (totalPrice / quantity).toFixed(2)
        }
      }
      
      // Auto-calculate total price when quantity changes (if purchase price exists)
      if (field === 'quantity' && value && newData.purchasePrice) {
        const purchasePrice = parseFloat(newData.purchasePrice)
        const quantity = parseInt(value)
        if (!isNaN(purchasePrice) && !isNaN(quantity)) {
          newData.totalPrice = (purchasePrice * quantity).toFixed(2)
        }
      }
      
      return newData
    })
  }

  const selectedAnimalType = animalTypes.find(type => type.id === formData.animalTypeId)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Animal"
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
                  Unit Price (₦)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={(e) => handleInputChange('purchasePrice', e.target.value)}
                  placeholder="0.00"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Enter unit price to auto-calculate total</p>
              </div>
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Price (₦)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.totalPrice}
                  onChange={(e) => handleInputChange('totalPrice', e.target.value)}
                  placeholder="0.00"
                  className="w-full"
                />
                <p className="text-xs text-gray-500 mt-1">Enter total price to auto-calculate unit price</p>
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
              {isLoading ? 'Updating...' : 'Update Animal'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  )
} 