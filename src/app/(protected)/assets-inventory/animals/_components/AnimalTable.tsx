"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { ActionMenu } from "@/components/ui/action-menu"
import { useDeleteAnimal } from "@/hooks/useAnimals"
import { useState } from "react"

interface AnimalTableProps {
  animals: any[]
  totalPages: number
  page: number
  limit: number
  loading: boolean
  error: any
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onView: (animal: any) => void
  onEdit: (animal: any) => void
  onDelete: (animal: any) => void
  onRefetch: () => void
}

export function AnimalTable({
  animals,
  totalPages,
  page,
  limit,
  loading,
  error,
  onPageChange,
  onLimitChange,
  onView,
  onEdit,
  onDelete,
  onRefetch,
}: AnimalTableProps) {
  const { deleteAnimal, loading: deleteLoading } = useDeleteAnimal()
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const handleDelete = async (animal: any) => {
    if (confirm(`Are you sure you want to delete animal ${animal.animalTag}?`)) {
      try {
        setDeletingId(animal.id)
        await deleteAnimal(animal.id)
        onRefetch()
      } catch (error) {
        console.error("Failed to delete animal:", error)
      } finally {
        setDeletingId(null)
      }
    }
  }

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
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Animal Tag</TableHead>
            <TableHead>Species</TableHead>
            <TableHead>Breed</TableHead>
            <TableHead>Gender</TableHead>
            <TableHead>Birth Date</TableHead>
            <TableHead>Current Weight</TableHead>
            <TableHead>Health Status</TableHead>
            <TableHead>Last Health Check</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {animals.map((animal) => (
            <TableRow key={animal.id}>
              <TableCell className="font-medium">{animal.animalTag}</TableCell>
              <TableCell>{animal.species}</TableCell>
              <TableCell>{animal.breed || "-"}</TableCell>
              <TableCell>{animal.gender || "-"}</TableCell>
              <TableCell>
                {animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : "-"}
              </TableCell>
              <TableCell>
                {animal.currentWeight ? `${Number(animal.currentWeight).toFixed(1)} kg` : "-"}
              </TableCell>
              <TableCell>
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
              </TableCell>
              <TableCell>
                {animal.lastHealthCheck ? new Date(animal.lastHealthCheck).toLocaleDateString() : "-"}
              </TableCell>
              <TableCell>
                {animal.batch ? animal.batch.batchCode : "-"}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    animal.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {animal.isActive ? "Active" : "Inactive"}
                </span>
              </TableCell>
              <TableCell>
                <ActionMenu
                  onView={() => onView(animal)}
                  onEdit={() => onEdit(animal)}
                  onDelete={() => handleDelete(animal)}
                  showView
                  showEdit
                  showDelete
                  disabled={deletingId === animal.id}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="mt-4">
        <TablePagination
          page={page}
          totalPages={totalPages}
          limit={limit}
          onPageChange={onPageChange}
          onLimitChange={(newLimit: number) => {
            onLimitChange(newLimit)
            onPageChange(1)
          }}
        />
      </div>
    </div>
  )
}