"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, Eye, Pencil, Trash } from "lucide-react"
import { ActionMenu } from "@/components/ui/action-menu"

interface AssetTableProps {
  assets: any[]
  totalPages: number
  page: number
  limit: number
  loading: boolean
  error: string | null
  onPageChange: (page: number) => void
  onLimitChange: (limit: number) => void
  onView: (asset: any) => void
  onEdit: (asset: any) => void
  onDelete: (asset: any) => void
}

export function AssetTable({
  assets,
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
}: AssetTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>
  }

  if (!assets?.length) {
    return <div className="text-center p-6 text-muted-foreground">No assets found.</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {/* <TableHead>Asset Code</TableHead> */}
            <TableHead>Asset Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Purchase Cost</TableHead>
            <TableHead>Purchase Date</TableHead>
            <TableHead>Salvage Value</TableHead>
            {/* <TableHead>Useful Life (Years)</TableHead> */}
            <TableHead>Depreciation Rate</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => (
            <TableRow key={asset.id}>
              {/* <TableCell>{asset.assetCode}</TableCell> */}
              <TableCell>{asset.assetName}</TableCell>
              <TableCell>{asset.category?.categoryName || "-"}</TableCell>
              <TableCell>{asset.assetType}</TableCell>
              <TableCell>${Number(asset.purchaseCost).toLocaleString()}</TableCell>
              <TableCell>
                {new Date(asset.purchaseDate).toLocaleDateString()}
              </TableCell>
              <TableCell>${Number(asset.salvageValue).toLocaleString()}</TableCell>
              {/* <TableCell>{asset.usefulLifeYears}</TableCell> */}
              <TableCell>{asset.depreciationRate}%</TableCell>
              <TableCell>{asset.conditionStatus}</TableCell>
              <TableCell>{asset.location || "-"}</TableCell>
              <TableCell>{asset.isActive ? "Active" : "Inactive"}</TableCell>
              <TableCell>
                <ActionMenu
                  onView={() => onView(asset)}
                  onEdit={() => onEdit(asset)}
                  onDelete={() => onDelete(asset)}
                  showView
                  showEdit
                  showDelete
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ✅ Pagination */}
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