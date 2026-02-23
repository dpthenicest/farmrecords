"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"

import { useAnimalRecords, useDeleteAnimalRecord } from "@/hooks/useAnimalRecords"
import { AnimalRecordFiltersForm } from "./_components/AnimalRecordFiltersForm"
import { AnimalRecordForm } from "./_components/AnimalRecordForm"
import { AnimalRecordGrid } from "./_components/AnimalRecordGrid"
import { AnimalRecordTable } from "./_components/AnimalRecordTable"
import { AnimalRecordDetails } from "./_components/AnimalRecordDetails"

// Analytics View Component
function AnalyticsView({ records, loading, error }: { records: any[], loading: boolean, error: any }) {
  if (loading) return <div className="p-8 text-center">Loading analytics...</div>
  if (error) return <div className="text-red-600 p-8">Error: {error.message}</div>
  if (!records?.length) return <div className="p-8 text-center">No data available for analytics</div>

  // Calculate analytics
  const totalRecords = records.length
  const healthRecords = records.filter(r => ['HEALTH_CHECK', 'VACCINATION'].includes(r.recordType))
  const productionRecords = records.filter(r => r.recordType === 'PRODUCTION')
  const feedingRecords = records.filter(r => r.recordType === 'FEEDING')
  
  const avgWeight = (() => {
    const weights = records.filter(r => r.weight).map(r => Number(r.weight))
    return weights.length > 0 ? (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1) : "0"
  })()

  const totalProduction = (() => {
    const production = records.filter(r => r.productionOutput).map(r => Number(r.productionOutput))
    return production.length > 0 ? production.reduce((a, b) => a + b, 0).toFixed(1) : "0"
  })()

  const totalFeed = (() => {
    const feed = records.filter(r => r.feedConsumption).map(r => Number(r.feedConsumption))
    return feed.length > 0 ? feed.reduce((a, b) => a + b, 0).toFixed(1) : "0"
  })()

  const healthStatusDistribution = records.reduce((acc: any, record) => {
    if (record.healthStatus) {
      acc[record.healthStatus] = (acc[record.healthStatus] || 0) + 1
    }
    return acc
  }, {})

  const recordTypeDistribution = records.reduce((acc: any, record) => {
    acc[record.recordType] = (acc[record.recordType] || 0) + 1
    return acc
  }, {})

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="text-sm text-blue-600 font-medium">Total Records</div>
          <div className="text-3xl font-bold text-blue-900">{totalRecords}</div>
        </div>
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="text-sm text-green-600 font-medium">Average Weight</div>
          <div className="text-3xl font-bold text-green-900">{avgWeight} kg</div>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="text-sm text-purple-600 font-medium">Total Production</div>
          <div className="text-3xl font-bold text-purple-900">{totalProduction}</div>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
          <div className="text-sm text-yellow-600 font-medium">Total Feed</div>
          <div className="text-3xl font-bold text-yellow-900">{totalFeed} kg</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Record Type Distribution */}
        <div className="bg-white p-6 rounded-lg border">
          <h3 className="text-lg font-semibold mb-4">Record Type Distribution</h3>
          <div className="space-y-3">
            {Object.entries(recordTypeDistribution).map(([type, count]: [string, any]) => {
              const percentage = ((count / totalRecords) * 100).toFixed(1)
              return (
                <div key={type} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{type.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-12">{count}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Health Status Distribution */}
        {Object.keys(healthStatusDistribution).length > 0 && (
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Health Status Distribution</h3>
            <div className="space-y-3">
              {Object.entries(healthStatusDistribution).map(([status, count]: [string, any]) => {
                const percentage = ((count / healthRecords.length) * 100).toFixed(1)
                const getStatusColor = (status: string) => {
                  switch (status) {
                    case "HEALTHY": return "bg-green-500"
                    case "SICK": return "bg-red-500"
                    case "RECOVERING": return "bg-yellow-500"
                    case "QUARANTINE": return "bg-orange-500"
                    case "DECEASED": return "bg-gray-500"
                    default: return "bg-gray-400"
                  }
                }
                return (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{status}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getStatusColor(status)}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground w-12">{count}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recent Trends */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4">Recent Activity Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">{healthRecords.length}</div>
            <div className="text-sm text-blue-600">Health Records</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">{productionRecords.length}</div>
            <div className="text-sm text-green-600">Production Records</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-900">{feedingRecords.length}</div>
            <div className="text-sm text-yellow-600">Feeding Records</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AnimalRecordsClient() {
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(12)
  const [filters, setFilters] = React.useState<any>({})
  const [selectedRecordId, setSelectedRecordId] = React.useState<number | null>(null)
  const [showForm, setShowForm] = React.useState(false)
  const [editRecordId, setEditRecordId] = React.useState<number | null>(null)
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid")
  const [showAnalytics, setShowAnalytics] = React.useState(false)

  const { records, totalPages, loading, error, refetch } = useAnimalRecords({ page, limit, ...filters })

  const { deleteRecord } = useDeleteAnimalRecord()

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters)
    setPage(1)
    setShowAnalytics(false) // Exit analytics when filters change
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
          {!showAnalytics && (
            <>
              <Button onClick={() => setViewMode("grid")} variant={viewMode === "grid" ? "primary" : "outline"}>Grid</Button>
              <Button onClick={() => setViewMode("table")} variant={viewMode === "table" ? "primary" : "outline"}>Table</Button>
            </>
          )}
          <Button onClick={() => setShowAnalytics(!showAnalytics)} variant={showAnalytics ? "primary" : "outline"}>
            📊 Analytics
          </Button>
          <Button onClick={handleCreate}>+ Add Record</Button>
        </div>
      </div>

      {/* Filters - Only show when not in analytics view */}
      {!showAnalytics && <AnimalRecordFiltersForm onApplyFilters={handleApplyFilters} />}

      {/* Content */}
      {showAnalytics ? (
        <AnalyticsView records={records} loading={loading} error={error} />
      ) : (
        <>
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
        </>
      )}

      {/* Create/Edit Modal - Large Custom Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {editRecordId ? "Edit Animal Record" : "Add Animal Record"}
              </h2>
              <button
                onClick={() => {
                  setEditRecordId(null)
                  setShowForm(false)
                }}
                className="p-2 hover:bg-gray-100 rounded"
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <AnimalRecordForm
                recordId={editRecordId || undefined}
                onClose={() => setShowForm(false)}
                onSaved={() => {
                  refetch()
                  setShowForm(false)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* View Record Modal */}
      <Modal open={!!selectedRecordId} onOpenChange={() => setSelectedRecordId(null)} title="Record Details">
        {selectedRecordId ? <AnimalRecordDetails recordId={selectedRecordId} /> : <p>Record not found</p>}
      </Modal>
    </div>
  )
}
