"use client"

import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useMainData } from '@/providers/main-data-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AddAnimalModal } from "@/components/modals/add-animal-modal"
import { ViewAnimalRecordsModal } from "@/components/modals/view-animal-records-modal"
import { EditAnimalModal } from "@/components/modals/edit-animal-modal"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

interface AnimalTypeClientProps {
  params: {
    type: string
  }
}

export default function AnimalTypeClient({ params }: AnimalTypeClientProps) {
  const [isAddAnimalModalOpen, setIsAddAnimalModalOpen] = useState(false)
  const [isViewAnimalRecordsModalOpen, setIsViewAnimalRecordsModalOpen] = useState(false)
  const [isEditAnimalModalOpen, setIsEditAnimalModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const {
    animals,
    animalTypes,
    fetchAnimals,
    fetchAnimalTypes,
    addAnimal,
    updateAnimal,
    deleteAnimal,
    loading,
    error
  } = useMainData()

  useEffect(() => {
    fetchAnimals()
    fetchAnimalTypes()
  }, [fetchAnimals, fetchAnimalTypes])

  // Find the animal type data
  const animalType = animalTypes.find(type => type.type.toLowerCase() === params.type.toLowerCase())

  // Filter animals by animal type ID
  const filteredAnimals = animals.filter(a => a.animalTypeId === animalType?.id)

  if (!animalType) {
    notFound()
  }

  const handleAddAnimal = async (data: any) => {
    setIsLoading(true)
    try {
      await addAnimal({ ...data, animalTypeId: animalType.id })
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
    setIsViewAnimalRecordsModalOpen(true)
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
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{animalType.emoji}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{animalType.type.charAt(0).toUpperCase() + animalType.type.slice(1).toLowerCase()}s</h1>
            <p className="text-gray-600">Manage your {animalType.type.toLowerCase()} livestock</p>
          </div>
        </div>
        <Button 
          className="flex items-center space-x-2"
          onClick={() => setIsAddAnimalModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Add {animalType.type.charAt(0).toUpperCase() + animalType.type.slice(1).toLowerCase()}</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter your {animalType.type.toLowerCase()}s</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder={`Search ${animalType.type.toLowerCase()}s...`} className="pl-10" />
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
      {filteredAnimals.length === 0 ? (
        <div className="text-center text-gray-500 py-12 text-lg font-medium">
          No animals available for this type.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimals.map((animal) => (
            <Card key={animal.id}>
              <CardHeader>
                <CardTitle>{animal.name}</CardTitle>
                <CardDescription>{animalType.type.charAt(0).toUpperCase() + animalType.type.slice(1).toLowerCase()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">{animal.description}</p>
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
      )}

      {/* Modals */}
      <AddAnimalModal
        isOpen={isAddAnimalModalOpen}
        onClose={() => setIsAddAnimalModalOpen(false)}
        onSubmit={handleAddAnimal}
        isLoading={isLoading}
        forcedAnimalTypeId={animalType.id}
        customTitle={`Add a ${animalType.type} Batch`}
        hideAnimalTypeSelection={true}
      />

      <ViewAnimalRecordsModal
        isOpen={isViewAnimalRecordsModalOpen}
        onClose={() => {
          setIsViewAnimalRecordsModalOpen(false)
          setSelectedAnimal(null)
        }}
        animal={selectedAnimal}
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
        message={`Are you sure you want to delete ${selectedAnimal?.name}? This action cannot be undone.`}
        isLoading={isLoading}
      />
    </div>
  )
} 