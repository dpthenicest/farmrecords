"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AddAnimalModal } from "@/components/modals/add-animal-modal"
import { ViewAnimalModal } from "@/components/modals/view-animal-modal"
import { EditAnimalModal } from "@/components/modals/edit-animal-modal"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"
import { useMainData } from '@/providers/main-data-provider'

export default function AnimalsClient() {
  const [isAddAnimalModalOpen, setIsAddAnimalModalOpen] = useState(false)
  const [isViewAnimalModalOpen, setIsViewAnimalModalOpen] = useState(false)
  const [isEditAnimalModalOpen, setIsEditAnimalModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    animals,
    fetchAnimals,
    addAnimal,
    updateAnimal,
    deleteAnimal,
    loading,
    error
  } = useMainData()

  useEffect(() => {
    fetchAnimals()
  }, [fetchAnimals])

  const handleAddAnimal = async (data: any) => {
    setIsLoading(true)
    try {
      await addAnimal(data)
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
      await updateAnimal(selectedAnimal?.id, data)
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
      await deleteAnimal(selectedAnimal?.id)
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
        {animals.map((animal) => (
          <Card key={animal.id}>
            <CardHeader>
              <CardTitle>{animal.name}</CardTitle>
              <CardDescription>{animal.animalType?.type || 'Unknown'} • {animal.animalType?.emoji || '🐾'}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Description: {animal.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Added: {new Date(animal.createdAt).toLocaleDateString()}</span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewAnimal(animal)}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditAnimal(animal)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteClick(animal)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
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