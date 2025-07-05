'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { AddAnimalModal } from "@/components/modals/add-animal-modal"
import { ViewAnimalModal } from "@/components/modals/view-animal-modal"
import { EditAnimalModal } from "@/components/modals/edit-animal-modal"
import { ConfirmationModal } from "@/components/ui/confirmation-modal"

interface AnimalTypePageProps {
  params: {
    type: string
  }
}

export default function AnimalTypePage({ params }: AnimalTypePageProps) {
  const [isAddAnimalModalOpen, setIsAddAnimalModalOpen] = useState(false)
  const [isViewAnimalModalOpen, setIsViewAnimalModalOpen] = useState(false)
  const [isEditAnimalModalOpen, setIsEditAnimalModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedAnimal, setSelectedAnimal] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const animalType = params.type.charAt(0).toUpperCase() + params.type.slice(1)
  
  const animalTypeData = {
    goats: {
      title: "Goats",
      description: "Manage your goat livestock",
      icon: "🐐",
      sampleAnimals: [
        { name: "Goat Batch A", count: 15, description: "Young goats for breeding" },
        { name: "Goat Batch B", count: 8, description: "Mature goats for milk" }
      ]
    },
    fowls: {
      title: "Fowls", 
      description: "Manage your poultry",
      icon: "🐔",
      sampleAnimals: [
        { name: "Fowl Layer 2024", count: 50, description: "Egg-laying chickens" },
        { name: "Broiler Batch", count: 30, description: "Meat chickens" }
      ]
    },
    catfish: {
      title: "Catfish",
      description: "Manage your fish farming",
      icon: "🐟", 
      sampleAnimals: [
        { name: "Catfish Pond 1", count: 200, description: "Freshwater catfish" },
        { name: "Catfish Pond 2", count: 150, description: "Growing catfish" }
      ]
    }
  }

  const data = animalTypeData[params.type as keyof typeof animalTypeData] || {
    title: animalType,
    description: `Manage your ${params.type}`,
    icon: "🐾",
    sampleAnimals: []
  }

  const handleAddAnimal = async (data: any) => {
    setIsLoading(true)
    try {
      // TODO: Implement API call to add animal
      console.log('Adding animal:', data)
      // Simulate API call
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
      // Simulate API call
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
      // Simulate API call
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
        <div className="flex items-center space-x-3">
          <span className="text-3xl">{data.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{data.title}</h1>
            <p className="text-gray-600">{data.description}</p>
          </div>
        </div>
        <Button 
          className="flex items-center space-x-2"
          onClick={() => setIsAddAnimalModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Add {data.title.slice(0, -1)}</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter your {data.title.toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input placeholder={`Search ${data.title.toLowerCase()}...`} className="pl-10" />
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
        {data.sampleAnimals.map((animal, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle>{animal.name}</CardTitle>
              <CardDescription>{data.title.slice(0, -1)} • {animal.count} animals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">{animal.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Added: Jan 2024</span>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewAnimal({
                        id: index + 1,
                        name: animal.name,
                        type: params.type.toUpperCase(),
                        description: animal.description
                      })}
                    >
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditAnimal({
                        id: index + 1,
                        name: animal.name,
                        type: params.type.toUpperCase(),
                        description: animal.description
                      })}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDeleteClick({
                        id: index + 1,
                        name: animal.name
                      })}
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