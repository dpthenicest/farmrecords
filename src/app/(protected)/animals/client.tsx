"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AddAnimalModal } from "@/components/modals/add-animal-modal"
import { ViewAnimalModal } from "@/components/modals/view-animal-modal"
import { EditAnimalModal } from "@/components/modals/edit-animal-modal"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

export default function AnimalsClient() {
  const [isAddAnimalModalOpen, setIsAddAnimalModalOpen] = useState(false)
  const [isViewAnimalModalOpen, setIsViewAnimalModalOpen] = useState(false)
  const [isEditAnimalModalOpen, setIsEditAnimalModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAddAnimal = async (data: any) => {
    setIsLoading(true)
    try {
      // TODO: Implement API call to add animal
      console.log('Adding animal:', data)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsAddAnimalModalOpen(false)
    } catch (error) {
      console.error('Error adding animal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateAnimal = async (data: any) => {
    setIsLoading(true)
    try {
      // TODO: Implement API call to update animal
      console.log('Updating animal:', data)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsEditAnimalModalOpen(false)
      setSelectedAnimal(null)
    } catch (error) {
      console.error('Error updating animal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAnimal = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement API call to delete animal
      console.log('Deleting animal:', selectedAnimal)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsDeleteModalOpen(false)
      setSelectedAnimal(null)
    } catch (error) {
      console.error('Error deleting animal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleViewAnimal = (animal: any) => {
    setSelectedAnimal(animal)
    setIsViewAnimalModalOpen(true)
  }

  const handleEditAnimal = (animal: any) => {
    setSelectedAnimal(animal)
    setIsEditAnimalModalOpen(true)
  }

  const handleDeleteClick = (animal: any) => {
    setSelectedAnimal(animal)
    setIsDeleteModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">All Animals</h1>
          <p className="text-gray-600">Manage your farm animals and livestock</p>
        </div>
        <Button 
          className="flex items-center space-x-2"
          onClick={() => setIsAddAnimalModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Add Animal</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter your animals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder="Search animals..." className="pl-10" />
              </div>
            </div>
            <Button variant="outline" className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span>Filter</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Animals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Goat Batch A</CardTitle>
            <CardDescription>Goat • 15 animals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Description: Young goats for breeding</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Added: Jan 2024</span>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewAnimal({
                      id: 1,
                      name: 'Goat Batch A',
                      type: 'GOAT',
                      description: 'Young goats for breeding'
                    })}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditAnimal({
                      id: 1,
                      name: 'Goat Batch A',
                      type: 'GOAT',
                      description: 'Young goats for breeding'
                    })}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteClick({
                      id: 1,
                      name: 'Goat Batch A'
                    })}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fowl Layer 2024</CardTitle>
            <CardDescription>Fowl • 50 animals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Description: Egg-laying chickens</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Added: Dec 2023</span>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewAnimal({
                      id: 2,
                      name: 'Fowl Layer 2024',
                      type: 'FOWL',
                      description: 'Egg-laying chickens'
                    })}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditAnimal({
                      id: 2,
                      name: 'Fowl Layer 2024',
                      type: 'FOWL',
                      description: 'Egg-laying chickens'
                    })}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteClick({
                      id: 2,
                      name: 'Fowl Layer 2024'
                    })}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Catfish Pond 1</CardTitle>
            <CardDescription>Catfish • 200 animals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Description: Freshwater catfish</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Added: Nov 2023</span>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewAnimal({
                      id: 3,
                      name: 'Catfish Pond 1',
                      type: 'CATFISH',
                      description: 'Freshwater catfish'
                    })}
                  >
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditAnimal({
                      id: 3,
                      name: 'Catfish Pond 1',
                      type: 'CATFISH',
                      description: 'Freshwater catfish'
                    })}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteClick({
                      id: 3,
                      name: 'Catfish Pond 1'
                    })}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <AddAnimalModal
        isOpen={isAddAnimalModalOpen}
        onClose={() => setIsAddAnimalModalOpen(false)}
        onSubmit={handleAddAnimal}
        isLoading={isLoading}
      />

      <ViewAnimalModal
        isOpen={isViewAnimalModalOpen}
        onClose={() => {
          setIsViewAnimalModalOpen(false)
          setSelectedAnimal(null)
        }}
        animal={selectedAnimal}
        onEdit={() => {
          setIsViewAnimalModalOpen(false)
          setIsEditAnimalModalOpen(true)
        }}
      />

      <EditAnimalModal
        isOpen={isEditAnimalModalOpen}
        onClose={() => {
          setIsEditAnimalModalOpen(false)
          setSelectedAnimal(null)
        }}
        animal={selectedAnimal}
        onSubmit={handleUpdateAnimal}
        isLoading={isLoading}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAnimal}
        title="Delete Animal"
        message={`Are you sure you want to delete "${selectedAnimal?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isLoading}
      />
    </div>
  )
} 