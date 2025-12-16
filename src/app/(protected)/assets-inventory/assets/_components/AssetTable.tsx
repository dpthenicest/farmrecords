"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TablePagination } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, Eye, Pencil, Trash, AlertTriangle, Clock, CheckCircle } from "lucide-react"
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

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case "EXCELLENT":
      case "GOOD":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "FAIR":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "POOR":
      case "CRITICAL":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "EXCELLENT":
        return "bg-green-100 text-green-800"
      case "GOOD":
        return "bg-blue-100 text-blue-800"
      case "FAIR":
        return "bg-yellow-100 text-yellow-800"
      case "POOR":
        return "bg-orange-100 text-orange-800"
      case "CRITICAL":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const calculateCurrentValue = (asset: any) => {
    const yearsInUse = Math.floor(
      (new Date().getTime() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
    )
    const depreciationPerYear = (Number(asset.purchaseCost) - Number(asset.salvageValue)) / asset.usefulLifeYears
    const accumulatedDepreciation = Math.min(
      depreciationPerYear * yearsInUse,
      Number(asset.purchaseCost) - Number(asset.salvageValue)
    )
    return Number(asset.purchaseCost) - accumulatedDepreciation
  }

  if (!assets?.length) {
    return <div className="text-center p-6 text-muted-foreground">No assets found.</div>
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Asset Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Purchase Cost</TableHead>
            <TableHead>Current Value</TableHead>
            <TableHead>Condition</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Age (Years)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map((asset) => {
            const currentValue = calculateCurrentValue(asset)
            const yearsInUse = Math.floor(
              (new Date().getTime() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 365)
            )
            const needsAttention = ["POOR", "CRITICAL"].includes(asset.conditionStatus)
            
            return (
              <TableRow key={asset.id} className={needsAttention ? "bg-red-50" : ""}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {needsAttention && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {asset.assetName}
                  </div>
                </TableCell>
                <TableCell>{asset.assetType}</TableCell>
                <TableCell>{asset.category?.categoryName || "-"}</TableCell>
                <TableCell>${Number(asset.purchaseCost).toLocaleString()}</TableCell>
                <TableCell className="font-medium">
                  ${currentValue.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getConditionIcon(asset.conditionStatus)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(asset.conditionStatus)}`}>
                      {asset.conditionStatus}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{asset.location || "-"}</TableCell>
                <TableCell>
                  <span className={yearsInUse >= asset.usefulLifeYears * 0.9 ? "text-orange-600 font-medium" : ""}>
                    {yearsInUse} / {asset.usefulLifeYears}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    asset.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                  }`}>
                    {asset.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
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
            )
          })}
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