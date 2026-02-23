"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export function AnimalGrid({ animals, loading, error, page, totalPages, onPageChange, onView, onEdit, onQuickHealthUpdate }: any) {
  if (loading) return <p>Loading animals...</p>
  if (error) return <p className="text-red-600">Error loading animals: {error.message}</p>
  if (!animals || !Array.isArray(animals)) return <p>No animals data available</p>
  if (animals.length === 0) return <p>No animals found</p>

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {animals.map((animal: any) => (
          <Card key={animal.id} className="hover:shadow-lg transition cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">{animal.animalTag}</CardTitle>
              <div className="text-sm text-gray-600">
                {animal.species} {animal.breed && `• ${animal.breed}`}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="font-medium">Gender:</span>
                  <div>{animal.gender || "Not specified"}</div>
                </div>
                <div>
                  <span className="font-medium">Weight:</span>
                  <div>{animal.currentWeight ? `${Number(animal.currentWeight).toFixed(1)} kg` : "Not recorded"}</div>
                </div>
                <div>
                  <span className="font-medium">Health:</span>
                  <div className={`inline-block px-2 py-1 rounded text-xs ${
                    animal.healthStatus === "HEALTHY" ? "bg-green-100 text-green-800" :
                    animal.healthStatus === "SICK" ? "bg-red-100 text-red-800" :
                    animal.healthStatus === "RECOVERING" ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {animal.healthStatus || "Unknown"}
                  </div>
                </div>
                <div>
                  <span className="font-medium">Last Check:</span>
                  <div>{animal.lastHealthCheck ? new Date(animal.lastHealthCheck).toLocaleDateString() : "Never"}</div>
                </div>
              </div>
              
              {animal.notes && (
                <div className="text-sm">
                  <span className="font-medium">Notes:</span>
                  <div className="text-gray-600 truncate">{animal.notes}</div>
                </div>
              )}
              
              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" onClick={() => onView(animal.id)}>
                  View
                </Button>
                <Button size="sm" variant="secondary" onClick={() => onEdit(animal.id)}>
                  Edit
                </Button>
                {onQuickHealthUpdate && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onQuickHealthUpdate(animal.id, animal.healthStatus === "HEALTHY" ? "SICK" : "HEALTHY")}
                    className="text-xs"
                  >
                    {animal.healthStatus === "HEALTHY" ? "Mark Sick" : "Mark Healthy"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages, page - 2 + i))
            return (
              <Button 
                key={pageNum} 
                size="sm" 
                variant={pageNum === page ? "default" : "outline"} 
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </Button>
            )
          })}
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
