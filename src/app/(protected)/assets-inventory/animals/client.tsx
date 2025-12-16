"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"
import { useAnimals } from "@/hooks/useAnimals"
import { AnimalFilters } from "./_components/AnimalFilters"
import { AnimalTable } from "./_components/AnimalTable"
import { AnimalGrid } from "./_components/AnimalGrid"
import { AnimalDetails } from "./_components/AnimalDetails"
import { AnimalForm } from "./_components/AnimalForm"

export default function AnimalsClient() {
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)
  const [view, setView] = React.useState<"grid" | "table">("table")

  const [pendingFilters, setPendingFilters] = React.useState({
    species: "",
    breed: "",
    gender: "",
    healthStatus: "",
    startDate: "",
    endDate: ""
  })
  const [appliedFilters, setAppliedFilters] = React.useState({
    species: "",
    breed: "",
    gender: "",
    healthStatus: "",
    startDate: "",
    endDate: ""
  })

  const { animals, totalPages, loading, error, refetch } = useAnimals({
    page,
    limit,
    species: appliedFilters.species || undefined,
    breed: appliedFilters.breed || undefined,
    gender: appliedFilters.gender || undefined,
    healthStatus: appliedFilters.healthStatus || undefined,
    startDate: appliedFilters.startDate || undefined,
    endDate: appliedFilters.endDate || undefined,
  })

  const [showForm, setShowForm] = React.useState(false)
  const [selectedAnimal, setSelectedAnimal] = React.useState<any>(null)

  const handleApplyFilters = () => {
    setAppliedFilters(pendingFilters)
    setPage(1)
  }

  const handleResetFilters = () => {
    const emptyFilters = {
      species: "",
      breed: "",
      gender: "",
      healthStatus: "",
      startDate: "",
      endDate: ""
    }
    setPendingFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Animals</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setView(view === "table" ? "grid" : "table")}>
            Toggle {view === "table" ? "Grid" : "Table"}
          </Button>
          <Button onClick={() => setShowForm(true)}>+ Add Animal</Button>
        </div>
      </div>

      {/* Filters */}
      <AnimalFilters
        filters={pendingFilters}
        onFiltersChange={setPendingFilters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Table or Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Animals ({animals?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {view === "table" ? (
            <AnimalTable
              animals={animals}
              totalPages={totalPages}
              page={page}
              limit={limit}
              loading={loading}
              error={error}
              onPageChange={setPage}
              onLimitChange={setLimit}
              onView={setSelectedAnimal}
              onEdit={(animal) => {
                setSelectedAnimal(animal)
                setShowForm(true)
              }}
              onDelete={(animal) => console.log("delete", animal)}
              onRefetch={refetch}
            />
          ) : (
            <AnimalGrid
              animals={animals}
              loading={loading}
              error={error}
              onView={setSelectedAnimal}
            />
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        open={!!selectedAnimal && !showForm}
        onOpenChange={() => setSelectedAnimal(null)}
        title="Animal Details"
      >
        {selectedAnimal && (
          <AnimalDetails animal={selectedAnimal} onClose={() => setSelectedAnimal(null)} />
        )}
      </Modal>
      <Modal
        open={showForm}
        onOpenChange={setShowForm}
        title={selectedAnimal ? "Edit Animal" : "Add Animal"}
      >
        <AnimalForm
          animal={selectedAnimal}
          onClose={() => {
            setSelectedAnimal(null)
            setShowForm(false)
          }}
          onSaved={refetch}
        />
      </Modal>
    </div>
  )
}