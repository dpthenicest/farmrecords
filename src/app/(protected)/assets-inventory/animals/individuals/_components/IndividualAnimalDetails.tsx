"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAnimal, useUpdateAnimal } from "@/hooks/useAnimals"

interface IndividualAnimalDetailsProps {
  animalId: number
  onHealthUpdate?: (animalId: number, status: string) => void
}

export function IndividualAnimalDetails({ animalId, onHealthUpdate }: IndividualAnimalDetailsProps) {
  const { animal, loading, error, setAnimal } = useAnimal(animalId)
  const { updateAnimal, loading: updating } = useUpdateAnimal()

  const handleHealthUpdate = async (status: string) => {
    if (!animal) return
    try {
      const updatedAnimal = await updateAnimal(animal.id, { healthStatus: status })
      setAnimal(updatedAnimal)
      if (onHealthUpdate) {
        onHealthUpdate(animal.id, status)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <p>Loading animal...</p>
  if (error) return <p className="text-red-600">{error.message}</p>
  if (!animal) return <p>Animal not found</p>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Animal Details</span>
            <span className="text-sm font-normal text-gray-600">ID: {animal.id}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong className="text-sm text-gray-600">Animal Tag:</strong>
              <p className="text-lg font-medium">{animal.animalTag}</p>
            </div>
            <div>
              <strong className="text-sm text-gray-600">Species:</strong>
              <p>{animal.species}</p>
            </div>
            <div>
              <strong className="text-sm text-gray-600">Breed:</strong>
              <p>{animal.breed || "Not specified"}</p>
            </div>
            <div>
              <strong className="text-sm text-gray-600">Gender:</strong>
              <p>{animal.gender || "Not specified"}</p>
            </div>
            <div>
              <strong className="text-sm text-gray-600">Birth Date:</strong>
              <p>{animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : "Not recorded"}</p>
            </div>
            <div>
              <strong className="text-sm text-gray-600">Purchase Weight:</strong>
              <p>{animal.purchaseWeight ? `${Number(animal.purchaseWeight).toFixed(1)} kg` : "Not recorded"}</p>
            </div>
            <div>
              <strong className="text-sm text-gray-600">Current Weight:</strong>
              <p>{animal.currentWeight ? `${Number(animal.currentWeight).toFixed(1)} kg` : "Not recorded"}</p>
            </div>
            <div>
              <strong className="text-sm text-gray-600">Purchase Cost:</strong>
              <p>{animal.purchaseCost ? `₦${Number(animal.purchaseCost).toLocaleString()}` : "Not recorded"}</p>
            </div>
          </div>

          <div>
            <strong className="text-sm text-gray-600">Health Status:</strong>
            <div className="flex items-center gap-2 mt-1">
              <span className={`inline-block px-3 py-1 rounded text-sm ${
                animal.healthStatus === "HEALTHY" ? "bg-green-100 text-green-800" :
                animal.healthStatus === "SICK" ? "bg-red-100 text-red-800" :
                animal.healthStatus === "RECOVERING" ? "bg-yellow-100 text-yellow-800" :
                animal.healthStatus === "QUARANTINE" ? "bg-orange-100 text-orange-800" :
                "bg-gray-100 text-gray-800"
              }`}>
                {animal.healthStatus || "Unknown"}
              </span>
            </div>
          </div>

          <div>
            <strong className="text-sm text-gray-600">Last Health Check:</strong>
            <p>{animal.lastHealthCheck ? new Date(animal.lastHealthCheck).toLocaleDateString() : "Never"}</p>
          </div>

          {animal.notes && (
            <div>
              <strong className="text-sm text-gray-600">Notes:</strong>
              <p className="text-gray-700 bg-gray-50 p-2 rounded">{animal.notes}</p>
            </div>
          )}

          <div className="border-t pt-4">
            <strong className="text-sm text-gray-600 block mb-2">Quick Health Updates:</strong>
            <div className="flex gap-2 flex-wrap">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleHealthUpdate("HEALTHY")} 
                disabled={updating || animal.healthStatus === "HEALTHY"}
                className="bg-green-50 hover:bg-green-100 text-green-700"
              >
                Mark Healthy
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleHealthUpdate("SICK")} 
                disabled={updating || animal.healthStatus === "SICK"}
                className="bg-red-50 hover:bg-red-100 text-red-700"
              >
                Mark Sick
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleHealthUpdate("RECOVERING")} 
                disabled={updating || animal.healthStatus === "RECOVERING"}
                className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700"
              >
                Mark Recovering
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => handleHealthUpdate("QUARANTINE")} 
                disabled={updating || animal.healthStatus === "QUARANTINE"}
                className="bg-orange-50 hover:bg-orange-100 text-orange-700"
              >
                Quarantine
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-500 border-t pt-2">
            <p>Created: {new Date(animal.createdAt).toLocaleString()}</p>
            <p>Last Updated: {new Date(animal.updatedAt).toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
