"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { 
  useSuppliers, 
  useSupplier, 
  useCreateSupplier, 
  useUpdateSupplier,
  useSupplierPurchaseOrders,
  useSupplierPayments
} from "@/hooks/useSuppliers"

import { SupplierFilters } from "./_components/SupplierFilters"
import { SupplierForm } from "./_components/SupplierForm"
import { SupplierGrid } from "./_components/SupplierGrid"
import { SupplierTable } from "./_components/SupplierTable"
import { SupplierPurchaseOrdersModal } from "./_components/SupplierPurchaseOrdersModal"
import { SupplierPaymentsModal } from "./_components/SupplierPaymentsModal"

export default function SuppliersClient() {
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(12)
  const [filters, setFilters] = React.useState<any>({})
  const [selectedSupplierId, setSelectedSupplierId] = React.useState<number | null>(null)
  const [editSupplierId, setEditSupplierId] = React.useState<number | null>(null)
  const [showForm, setShowForm] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid")
  const [showOrders, setShowOrders] = React.useState<number | null>(null)
  const [showPayments, setShowPayments] = React.useState<number | null>(null)

  const { suppliers, totalPages, loading, error, refetch } = useSuppliers({ page, limit, ...filters })
  const { supplier: selectedSupplier, loading: supplierLoading } = useSupplier(selectedSupplierId || undefined)
  const { orders, loading: ordersLoading } = useSupplierPurchaseOrders(showOrders || undefined)
  const { payments, loading: paymentsLoading } = useSupplierPayments(showPayments || undefined)

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleViewSupplier = (id: number) => setSelectedSupplierId(id)
  const handleEditSupplier = (id: number) => { setEditSupplierId(id); setShowForm(true) }
  const handleCreateSupplier = () => { setEditSupplierId(null); setShowForm(true) }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <div className="flex gap-2">
          <Button onClick={() => setViewMode("grid")} variant={viewMode === "grid" ? "default" : "outline"}>Grid</Button>
          <Button onClick={() => setViewMode("table")} variant={viewMode === "table" ? "default" : "outline"}>Table</Button>
          <Button onClick={handleCreateSupplier}>+ Add Supplier</Button>
        </div>
      </div>

      {/* Filters */}
      <SupplierFilters onApplyFilters={handleApplyFilters} />

      {/* Suppliers View */}
      {viewMode === "grid" ? (
        <SupplierGrid
          suppliers={suppliers}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onViewSupplier={handleViewSupplier}
          onEditSupplier={handleEditSupplier}
          onShowOrders={setShowOrders}
          onShowPayments={setShowPayments}
        />
      ) : (
        <SupplierTable
          suppliers={suppliers}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onViewSupplier={handleViewSupplier}
          onEditSupplier={handleEditSupplier}
          onShowOrders={setShowOrders}
          onShowPayments={setShowPayments}
          onDeleteSupplier={() => {}}
        />
      )}

      {/* Supplier Details Modal */}
      <Modal open={!!selectedSupplierId} onOpenChange={() => setSelectedSupplierId(null)} title="Supplier Details">
        {supplierLoading ? <p>Loading...</p> : selectedSupplier ? (
          <div className="space-y-4">
            <p><strong>Name:</strong> {selectedSupplier.supplierName}</p>
            <p><strong>Code:</strong> {selectedSupplier.supplierCode}</p>
            <p><strong>Type:</strong> {selectedSupplier.supplierType}</p>
            <p><strong>Contact:</strong> {selectedSupplier.contactPerson}</p>
            <p><strong>Email:</strong> {selectedSupplier.email}</p>
            <p><strong>Phone:</strong> {selectedSupplier.phone}</p>
            <p><strong>Rating:</strong> {selectedSupplier.rating} ★</p>
            <p><strong>Tax ID:</strong> {selectedSupplier.taxId}</p>
          </div>
        ) : <p>Supplier not found.</p>}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal open={showForm} onOpenChange={setShowForm} title={editSupplierId ? "Edit Supplier" : "Add Supplier"}>
        <SupplierForm
          supplierId={editSupplierId || undefined}
          onClose={() => { setEditSupplierId(null); setShowForm(false) }}
          onSaved={() => { refetch(); setShowForm(false) }}
        />
      </Modal>

      {/* Purchase Orders Modal */}
      <SupplierPurchaseOrdersModal open={!!showOrders} onClose={() => setShowOrders(null)} orders={orders || []} loading={ordersLoading} />

      {/* Payments Modal */}
      <SupplierPaymentsModal open={!!showPayments} onClose={() => setShowPayments(null)} payments={payments || []} loading={paymentsLoading} />
    </div>
  )
}
