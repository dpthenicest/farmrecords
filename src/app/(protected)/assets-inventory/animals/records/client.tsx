"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import { useAnimalRecords, useCreateAnimalRecord, useUpdateAnimalRecord, useDeleteAnimalRecord } from "@/hooks/useAnimalRecords"
import { AnimalRecordFiltersForm } from "./_components/AnimalRecordFiltersForm"
import { AnimalRecordForm } from "./_components/AnimalRecordForm"
import { AnimalRecordGrid } from "./_components/AnimalRecordGrid"
import { AnimalRecordTable } from "./_components/AnimalRecordTable"
import { AnimalRecordDetails } from "./_components/AnimalRecordDetails"

export default function AnimalRecordsClient() {
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(12)
  const [filters, setFilters] = React.useState<any>({})
  const [selectedRecordId, setSelectedRecordId] = React.useState<number | null>(null)
  const [showForm, setShowForm] = React.useState(false)
  const [editRecordId, setEditRecordId] = React.useState<number | null>(null)
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid")
  const [tab, setTab] = React.useState<string>("ALL")

  const { records, totalPages, loading, error, refetch } = useAnimalRecords({ page, limit, ...filters, recordType: tab === "ALL" ? undefined : tab })

  const { createRecord } = useCreateAnimalRecord()
  const { updateRecord } = useUpdateAnimalRecord()
  const { deleteRecord } = useDeleteAnimalRecord()

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleCreate = () => {
    setEditRecordId(null)
    setShowForm(true)
  }

  const handleEdit = (id: number) => {
    setEditRecordId(id)
    setShowForm(true)
  }

  const handleView = (id: number) => setSelectedRecordId(id)

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return
    try {
      await deleteRecord(id)
      refetch()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Animal Records</h1>
        <div className="flex gap-2">
          <Button onClick={() => setViewMode("grid")} variant={viewMode === "grid" ? "default" : "outline"}>Grid</Button>
          <Button onClick={() => setViewMode("table")} variant={viewMode === "table" ? "default" : "outline"}>Table</Button>
          <Button onClick={handleCreate}>+ Add Record</Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="FEEDING">Feeding</TabsTrigger>
          <TabsTrigger value="HEALTH_CHECK">Health</TabsTrigger>
          <TabsTrigger value="PRODUCTION">Production</TabsTrigger>
          <TabsTrigger value="MORTALITY">Mortality</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <AnimalRecordFiltersForm onApplyFilters={handleApplyFilters} />

      {/* Records View */}
      {viewMode === "grid" ? (
        <AnimalRecordGrid
          records={records}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <AnimalRecordTable
          records={records}
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
        />
      )}

      {/* Create/Edit Modal */}
      <Modal open={showForm} onOpenChange={setShowForm} title={editRecordId ? "Edit Record" : "Add Record"}>
        <AnimalRecordForm
          recordId={editRecordId || undefined}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            refetch()
            setShowForm(false)
          }}
        />
      </Modal>

      {/* View Record Modal */}
      <Modal open={!!selectedRecordId} onOpenChange={() => setSelectedRecordId(null)} title="Record Details">
        {selectedRecordId ? <AnimalRecordDetails recordId={selectedRecordId} /> : <p>Record not found</p>}
      </Modal>
    </div>
  )
}
