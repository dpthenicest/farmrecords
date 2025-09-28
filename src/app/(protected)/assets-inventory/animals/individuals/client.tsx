"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"

import { useAnimals, useUpdateAnimal } from "@/hooks/useAnimals"
import { AnimalFiltersForm } from "./_components/AnimalFiltersForm"
import { IndividualAnimalForm } from "./_components/IndividualAnimalForm"
import { IndividualAnimalDetails } from "./_components/IndividualAnimalDetails"
import { AnimalGrid } from "./_components/AnimalGrid"
import { AnimalTable } from "./_components/AnimalTable"

export default function IndividualAnimalsClient() {
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(12)
  const [filters, setFilters] = React.useState<any>({})
  const [selectedAnimalId, setSelectedAnimalId] = React.useState<number | null>(null)
  const [showForm, setShowForm] = React.useState(false)
  const [editAnimalId, setEditAnimalId] = React.useState<number | null>(null)
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid")

  const { animals, totalPages, loading, error, refetch } = useAnimals({
    page,
    limit,
    ...filters,
  })

  const { updateAnimal } = useUpdateAnimal()

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleCreate = () => {
    setEditAnimalId(null)
    setShowForm(true)
  }

  const handleEdit = (id: number) => {
    setEditAnimalId(id)
    setShowForm(true)
  }

  const handleView = (id: number) => setSelectedAnimalId(id)

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this animal?")) return
    try {
      await updateAnimal(id, { deleted: true }) // assuming soft delete
      refetch()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const handleQuickHealthUpdate = async (animalId: number, status: string) => {
    try {
      await updateAnimal(animalId, { healthStatus: status })
      refetch()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Individual Animals</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setViewMode("grid")}
            variant={viewMode === "grid" ? "default" : "outline"}
          >
            Grid
          </Button>
          <Button
            onClick={() => setViewMode("table")}
            variant={viewMode === "table" ? "default" : "outline"}
          >
            Table
          </Button>
          <Button onClick={handleCreate}>+ Add Animal</Button>
        </div>
      </div>

      {/* Filters */}
      <AnimalFiltersForm onApplyFilters={handleApplyFilters} />

      {/* Animal Grid/Table */}
      {viewMode === "grid" ? (
        <AnimalGrid
          animals={animals}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onView={handleView}
          onEdit={handleEdit}
          onQuickHealthUpdate={handleQuickHealthUpdate} // pass down for grid cards
        />
      ) : (
        <AnimalTable
          animals={animals}
          loading={loading}
          error={error}
          page={page}
          limit={limit}
          totalPages={totalPages}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onQuickHealthUpdate={handleQuickHealthUpdate} // pass down for table buttons
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        open={showForm}
        onOpenChange={setShowForm}
        title={editAnimalId ? "Edit Animal" : "Add Animal"}
      >
        <IndividualAnimalForm
          animalId={editAnimalId || undefined}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            refetch()
            setShowForm(false)
          }}
        />
      </Modal>

      {/* View Animal Modal */}
      <Modal
        open={!!selectedAnimalId}
        onOpenChange={() => setSelectedAnimalId(null)}
        title="Animal Details"
      >
        {selectedAnimalId ? (
          <IndividualAnimalDetails
            animalId={selectedAnimalId}
            onHealthUpdate={handleQuickHealthUpdate}
          />
        ) : (
          <p>Animal not found</p>
        )}
      </Modal>
    </div>
  )
}
