"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { useAnimalBatches, useAnimalBatch } from "@/hooks/useAnimalBatches"

import { AnimalBatchFilters } from "./_components/AnimalBatchFilters"
import { AnimalBatchForm } from "./_components/AnimalBatchForm"
import { AnimalBatchGrid } from "./_components/AnimalBatchGrid"
import { AnimalBatchTable } from "./_components/AnimalBatchTable" // assume exists
import { AnimalBatchDetails } from "./_components/AnimalBatchDetails"

export default function AnimalBatchesClient() {
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(12)
  const [filters, setFilters] = React.useState<any>({})
  const [selectedBatchId, setSelectedBatchId] = React.useState<number | null>(null)
  const [showForm, setShowForm] = React.useState(false)
  const [editBatchId, setEditBatchId] = React.useState<number | null>(null)

  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid")

  const { batches, totalPages, loading, error, refetch } = useAnimalBatches({
    page,
    limit,
    ...filters,
  })

  const { batch: selectedBatch, loading: batchLoading } = useAnimalBatch(selectedBatchId || undefined)

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleViewBatch = (id: number) => setSelectedBatchId(id)
  const handleEditBatch = (id: number) => {
    setEditBatchId(id)
    setShowForm(true)
  }
  const handleCreateBatch = () => {
    setEditBatchId(null)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Animal Batches</h1>
        <div className="flex gap-2">
          <Button onClick={() => setViewMode("grid")} variant={viewMode === "grid" ? "default" : "outline"}>
            Grid
          </Button>
          <Button onClick={() => setViewMode("table")} variant={viewMode === "table" ? "default" : "outline"}>
            Table
          </Button>
          <Button onClick={handleCreateBatch}>+ Add New Batch</Button>
        </div>
      </div>

      {/* Filters */}
      <AnimalBatchFilters onApplyFilters={handleApplyFilters} />

      {/* Batches View */}
      {viewMode === "grid" ? (
        <AnimalBatchGrid
          batches={batches}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onViewBatch={handleViewBatch}
          onEditBatch={handleEditBatch}
        />
      ) : (
        <AnimalBatchTable
          batches={batches}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onEditBatch={handleEditBatch}
          onViewBatch={handleViewBatch}
        />
      )}

      {/* Batch Details Modal */}
      <Modal open={!!selectedBatchId} onOpenChange={() => setSelectedBatchId(null)} title="Batch Details">
        {selectedBatchId && (
          <AnimalBatchDetails 
            batchId={selectedBatchId} 
            onClose={() => setSelectedBatchId(null)} 
          />
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal open={showForm} onOpenChange={setShowForm} title={editBatchId ? "Edit Batch" : "Create Batch"}>
        <AnimalBatchForm
          batchId={editBatchId || undefined}
          onClose={() => {
            setEditBatchId(null)
            setShowForm(false)
          }}
          onSaved={() => {
            refetch()
            setShowForm(false)
          }}
        />
      </Modal>
    </div>
  )
}
