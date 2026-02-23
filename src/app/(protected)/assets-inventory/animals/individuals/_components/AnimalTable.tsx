"use client"

import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell, TablePagination } from "@/components/ui/table"
import { ActionMenu } from "@/components/ui/action-menu"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useUpdateAnimal } from "@/hooks/useAnimals"

interface AnimalTableProps {
  animals: any[]
  page: number
  limit: number
  totalPages: number
  loading: boolean
  error: Error | null
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onView: (id: number) => void
  onEdit: (id: number) => void
  onDelete: (id: number) => void
  onQuickHealthUpdate?: (id: number, status: string) => void
}

export function AnimalTable({
  animals,
  page,
  limit,
  totalPages,
  loading,
  error,
  onPageChange,
  onLimitChange,
  onView,
  onEdit,
  onDelete,
  onQuickHealthUpdate
}: AnimalTableProps) {
  const { updateAnimal, loading: updating } = useUpdateAnimal()

  const handleQuickHealthUpdate = async (animalId: number, status: string) => {
    try {
      await updateAnimal(animalId, { healthStatus: status })
      if (onQuickHealthUpdate) {
        onQuickHealthUpdate(animalId, status)
      }
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <div>Loading animals...</div>
  if (error) return <div className="text-red-600">Error loading animals: {error.message}</div>
  if (!animals || !Array.isArray(animals)) return <div>No animals data available</div>
  if (animals.length === 0) return <div>No animals found</div>

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Animal Tag</TableHead>
                <TableHead>Species</TableHead>
                <TableHead>Breed</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Current Weight</TableHead>
                <TableHead>Health Status</TableHead>
                <TableHead>Last Health Check</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {animals.map((animal) => (
                <TableRow key={animal.id}>
                  <TableCell className="font-medium">{animal.animalTag}</TableCell>
                  <TableCell>{animal.species}</TableCell>
                  <TableCell>{animal.breed || "Not specified"}</TableCell>
                  <TableCell>{animal.gender || "Not specified"}</TableCell>
                  <TableCell>
                    {animal.currentWeight ? `${Number(animal.currentWeight).toFixed(1)} kg` : "Not recorded"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs ${
                        animal.healthStatus === "HEALTHY" ? "bg-green-100 text-green-800" :
                        animal.healthStatus === "SICK" ? "bg-red-100 text-red-800" :
                        animal.healthStatus === "RECOVERING" ? "bg-yellow-100 text-yellow-800" :
                        animal.healthStatus === "QUARANTINE" ? "bg-orange-100 text-orange-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {animal.healthStatus || "Unknown"}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickHealthUpdate(animal.id, "HEALTHY")}
                          disabled={updating || animal.healthStatus === "HEALTHY"}
                          title="Mark Healthy"
                          className="h-6 w-6 p-0 text-xs"
                        >
                          ✓
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickHealthUpdate(animal.id, "SICK")}
                          disabled={updating || animal.healthStatus === "SICK"}
                          title="Mark Sick"
                          className="h-6 w-6 p-0 text-xs"
                        >
                          ✗
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {animal.lastHealthCheck ? new Date(animal.lastHealthCheck).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell>
                    <ActionMenu
                      onView={() => onView(animal.id)}
                      onEdit={() => onEdit(animal.id)}
                      onDelete={() => onDelete(animal.id)}
                      showView
                      showEdit
                      showDelete
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <TablePagination
            page={page}
            totalPages={totalPages}
            limit={limit}
            onPageChange={onPageChange}
            onLimitChange={(l: number) => { onLimitChange(l); onPageChange(1) }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
