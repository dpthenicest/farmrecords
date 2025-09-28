"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Modal } from "@/components/ui/modal"
import { useAssets } from "@/hooks/useAssets"
import { AssetFilters } from "./_components/AssetFilters"
import { AssetTable } from "./_components/AssetTable"
import { AssetGrid } from "./_components/AssetGrid"
import { AssetDetails } from "./_components/AssetDetails"
import { AssetForm } from "./_components/AssetForm"

export default function AssetsClient() {
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)
  const [view, setView] = React.useState<"grid" | "table">("table")

  const [pendingType, setPendingType] = React.useState("all")
  const [appliedType, setAppliedType] = React.useState("all")

  const { assets, totalPages, loading, error, refetch } = useAssets({
    page,
    limit,
    assetType: appliedType !== "all" ? appliedType.toUpperCase() : undefined,
  })

  const [showForm, setShowForm] = React.useState(false)
  const [selectedAsset, setSelectedAsset] = React.useState<any>(null)

  const handleApplyFilters = () => {
    setAppliedType(pendingType)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Assets</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setView(view === "table" ? "grid" : "table")}>
            Toggle {view === "table" ? "Grid" : "Table"}
          </Button>
          <Button onClick={() => setShowForm(true)}>+ Add Asset</Button>
        </div>
      </div>

      {/* Filters */}
      <AssetFilters
        type={pendingType}
        onTypeChange={setPendingType}
        onApplyFilters={handleApplyFilters}
      />

      {/* Table or Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Assets</CardTitle>
        </CardHeader>
        <CardContent>
          {view === "table" ? (
            <AssetTable
              assets={assets}
              totalPages={totalPages}
              page={page}
              limit={limit}
              loading={loading}
              error={error}
              onPageChange={setPage}
              onLimitChange={setLimit}
              onView={setSelectedAsset}
              onEdit={(asset) => {
                setSelectedAsset(asset)
                setShowForm(true)
              }}
              onDelete={(asset) => console.log("delete", asset)}
            />
          ) : (
            <AssetGrid
              assets={assets}
              loading={loading}
              error={error}
              onView={setSelectedAsset}
            />
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        open={!!selectedAsset && !showForm}
        onOpenChange={() => setSelectedAsset(null)}
        title="Asset Details"
      >
        {selectedAsset && (
          <AssetDetails asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
        )}
      </Modal>
      <Modal
        open={showForm}
        onOpenChange={setShowForm}
        title={selectedAsset ? "Edit Asset" : "Add Asset"}
      >
        <AssetForm
          asset={selectedAsset}
          onClose={() => {
            setSelectedAsset(null)
            setShowForm(false)
          }}
          onSaved={refetch}
        />
      </Modal>
    </div>
  )
}
