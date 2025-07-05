'use client'

import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnimalType } from '@/types'

interface ViewAnimalModalProps {
  isOpen: boolean
  onClose: () => void
  animal: any
  onEdit?: () => void
}

export function ViewAnimalModal({ isOpen, onClose, animal, onEdit }: ViewAnimalModalProps) {
  if (!animal) return null

  const getAnimalIcon = (type: AnimalType) => {
    switch (type) {
      case 'GOAT':
        return '🐐'
      case 'FOWL':
        return '🐔'
      case 'CATFISH':
        return '🐟'
      default:
        return '🐾'
    }
  }

  const getAnimalTypeLabel = (type: AnimalType) => {
    switch (type) {
      case 'GOAT':
        return 'Goat'
      case 'FOWL':
        return 'Fowl'
      case 'CATFISH':
        return 'Catfish'
      default:
        return 'Unknown'
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Animal Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Animal Header */}
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{getAnimalIcon(animal.type)}</div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{animal.name}</h3>
            <p className="text-sm text-gray-500">{getAnimalTypeLabel(animal.type)}</p>
          </div>
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Animal Name/Batch</label>
                <p className="text-sm text-gray-900">{animal.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <p className="text-sm text-gray-900">{getAnimalTypeLabel(animal.type)}</p>
              </div>
            </div>
            {animal.description && (
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-sm text-gray-700">{animal.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">15</div>
                <div className="text-sm text-gray-500">Total Animals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">12</div>
                <div className="text-sm text-gray-500">Healthy</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">3</div>
                <div className="text-sm text-gray-500">Under Care</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Health check completed</p>
                  <p className="text-xs text-gray-500">2 days ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Feed distributed</p>
                  <p className="text-xs text-gray-500">1 week ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">Vaccination scheduled</p>
                  <p className="text-xs text-gray-500">2 weeks ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          {onEdit && (
            <Button
              variant="outline"
              onClick={onEdit}
            >
              Edit Animal
            </Button>
          )}
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
} 