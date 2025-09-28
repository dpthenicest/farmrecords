"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAnimal, useUpdateAnimal } from "@/hooks/useAnimals"

interface IndividualAnimalDetailsProps {
  animalId: number
}

export function IndividualAnimalDetails({ animalId }: IndividualAnimalDetailsProps) {
  const { animal, loading, error } = useAnimal(animalId)
  const { updateAnimal, loading: updating } = useUpdateAnimal()

  const handleHealthUpdate = async (status: string) => {
    if (!animal) return
    try {
      await updateAnimal(animal.id, { healthStatus: status })
      alert(`Health status updated to "${status}"`)
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
          <CardTitle>Animal Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p><strong>Tag:</strong> {animal.tag}</p>
          <p><strong>Species:</strong> {animal.species}</p>
          <p><strong>Batch:</strong> {animal.batch}</p>
          <p><strong>Weight:</strong> {animal.weight}</p>
          <p><strong>Health Status:</strong> {animal.healthStatus}</p>
          <p><strong>Last Check:</strong> {animal.lastCheck}</p>

          <div className="flex gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => handleHealthUpdate("healthy")} disabled={updating}>Mark Healthy</Button>
            <Button size="sm" variant="outline" onClick={() => handleHealthUpdate("sick")} disabled={updating}>Mark Sick</Button>
            <Button size="sm" variant="outline" onClick={() => handleHealthUpdate("recovering")} disabled={updating}>Mark Recovering</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
