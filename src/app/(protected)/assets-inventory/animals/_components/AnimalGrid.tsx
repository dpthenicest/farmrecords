"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Eye } from "lucide-react"

interface AnimalGridProps {
  animals: any[]
  loading: boolean
  error: any
  onView: (animal: any) => void
}

export function AnimalGrid({ animals, loading, error, onView }: AnimalGridProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error.message || "Failed to load animals"}</div>
  }

  if (!animals?.length) {
    return <div className="text-center p-6 text-muted-foreground">No animals found.</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {animals.map((animal) => (
        <Card key={animal.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{animal.animalTag}</CardTitle>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  animal.healthStatus === "HEALTHY"
                    ? "bg-green-100 text-green-800"
                    : animal.healthStatus === "SICK"
                    ? "bg-red-100 text-red-800"
                    : animal.healthStatus === "RECOVERING"
                    ? "bg-yellow-100 text-yellow-800"
                    : animal.healthStatus === "QUARANTINE"
                    ? "bg-orange-100 text-orange-800"
                    : animal.healthStatus === "DECEASED"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {animal.healthStatus || "Unknown"}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Species:</span>
                <div className="text-muted-foreground">{animal.species}</div>
              </div>
              <div>
                <span className="font-medium">Breed:</span>
                <div className="text-muted-foreground">{animal.breed || "-"}</div>
              </div>
              <div>
                <span className="font-medium">Gender:</span>
                <div className="text-muted-foreground">{animal.gender || "-"}</div>
              </div>
              <div>
                <span className="font-medium">Weight:</span>
                <div className="text-muted-foreground">
                  {animal.currentWeight ? `${Number(animal.currentWeight).toFixed(1)} kg` : "-"}
                </div>
              </div>
            </div>

            {animal.batch && (
              <div className="text-sm">
                <span className="font-medium">Batch:</span>
                <div className="text-muted-foreground">{animal.batch.batchCode}</div>
              </div>
            )}

            {animal.birthDate && (
              <div className="text-sm">
                <span className="font-medium">Birth Date:</span>
                <div className="text-muted-foreground">
                  {new Date(animal.birthDate).toLocaleDateString()}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  animal.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {animal.isActive ? "Active" : "Inactive"}
              </span>
              <Button size="sm" variant="outline" onClick={() => onView(animal)}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}