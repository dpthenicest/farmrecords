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
  onDelete
}: AnimalTableProps) {
  const { updateAnimal, loading: updating } = useUpdateAnimal()

  const handleQuickHealthUpdate = async (animalId: number, status: string) => {
    try {
      await updateAnimal(animalId, { healthStatus: status })
      alert(`Health status updated to "${status}"`)
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <div>Loading animals...</div>
  if (error) return <div className="text-red-600">{error.message}</div>
  if (!animals.length) return <div>No animals found</div>

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-5">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tag</TableHead>
                <TableHead>Species</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Weight</TableHead>
                <TableHead>Health Status</TableHead>
                <TableHead>Last Check</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {animals.map((animal) => (
                <TableRow key={animal.id}>
                  <TableCell>{animal.tag}</TableCell>
                  <TableCell>{animal.species}</TableCell>
                  <TableCell>{animal.batch}</TableCell>
                  <TableCell>{animal.weight}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{animal.healthStatus}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleQuickHealthUpdate(animal.id, "healthy")}
                        disabled={updating}
                        title="Mark Healthy"
                      >H</Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => handleQuickHealthUpdate(animal.id, "sick")}
                        disabled={updating}
                        title="Mark Sick"
                      >S</Button>
                    </div>
                  </TableCell>
                  <TableCell>{animal.lastCheck}</TableCell>
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
