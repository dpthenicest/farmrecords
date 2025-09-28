"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { useCustomers, useCustomer, useCustomerPayments, useCustomerInvoices } from "@/hooks/useCustomers"
import { Modal } from "@/components/ui/modal"
import { CustomerFilters } from "./_components/CustomerFilters"
import { CustomerForm } from "./_components/CustomerForm"
import { CustomerGrid } from "./_components/CustomerGrid"
import { CustomerTable } from "./_components/CustomerTable"
import { CustomerPaymentsModal } from "./_components/CustomerPaymentsModal"
import { CustomerInvoicesModal } from "./_components/CustomerInvoicesModal"

export default function CustomersClient() {
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(12)
  const [filters, setFilters] = React.useState<any>({})
  const [selectedCustomerId, setSelectedCustomerId] = React.useState<number | null>(null)
  const [showForm, setShowForm] = React.useState(false)
  const [editCustomerId, setEditCustomerId] = React.useState<number | null>(null)
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid")
  const [showPayments, setShowPayments] = React.useState<number | null>(null)
  const [showInvoices, setShowInvoices] = React.useState<number | null>(null)

  const { customers, totalPages, loading, error, refetch } = useCustomers({ page, limit, ...filters })
  const { customer: selectedCustomer, loading: customerLoading } = useCustomer(selectedCustomerId || undefined)
  const { payments, loading: paymentsLoading } = useCustomerPayments(showPayments || undefined)
  const { invoices, loading: invoicesLoading } = useCustomerInvoices(showInvoices || undefined)

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters)
    setPage(1)
  }

  const handleViewCustomer = (id: number) => setSelectedCustomerId(id)
  const handleEditCustomer = (id: number) => {
    setEditCustomerId(id)
    setShowForm(true)
  }
  const handleCreateCustomer = () => {
    setEditCustomerId(null)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Customers</h1>
        <div className="flex gap-2">
          <Button onClick={() => setViewMode("grid")} variant={viewMode === "grid" ? "default" : "outline"}>Grid</Button>
          <Button onClick={() => setViewMode("table")} variant={viewMode === "table" ? "default" : "outline"}>Table</Button>
          <Button onClick={handleCreateCustomer}>+ Add Customer</Button>
        </div>
      </div>

      {/* Filters */}
      <CustomerFilters onApplyFilters={handleApplyFilters} />

      {/* Customers View */}
      {viewMode === "grid" ? (
        <CustomerGrid
          customers={customers}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onViewCustomer={handleViewCustomer}
          onEditCustomer={handleEditCustomer}
          onShowPayments={setShowPayments}
          onShowInvoices={setShowInvoices}
        />
      ) : (
        <CustomerTable
          customers={customers}
          loading={loading}
          error={error}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          onEditCustomer={handleEditCustomer}
          onViewCustomer={handleViewCustomer}
          onShowPayments={setShowPayments}
          onShowInvoices={setShowInvoices}
          onDeleteCustomer={() => {}}
          limit={limit}
          onLimitChange={setLimit}
        />
      )}

      {/* Customer Details Modal */}
      <Modal open={!!selectedCustomerId} onOpenChange={() => setSelectedCustomerId(null)} title="Customer Details">
        {customerLoading ? <p>Loading...</p> : selectedCustomer ? (
          <div className="space-y-4">
            <p><strong>Name:</strong> {selectedCustomer.customerName}</p>
            <p><strong>Type:</strong> {selectedCustomer.customerType}</p>
            <p><strong>Contact:</strong> {selectedCustomer.contactPerson}</p>
            <p><strong>Email:</strong> {selectedCustomer.email}</p>
            <p><strong>Phone:</strong> {selectedCustomer.phone}</p>
            <p><strong>Credit Limit:</strong> ₦{selectedCustomer.creditLimit}</p>
            <p><strong>Payment Terms:</strong> {selectedCustomer.paymentTermsDays} days</p>
          </div>
        ) : <p>Customer not found.</p>}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal open={showForm} onOpenChange={setShowForm} title={editCustomerId ? "Edit Customer" : "Add Customer"}>
        <CustomerForm
          customerId={editCustomerId || undefined}
          onClose={() => { setEditCustomerId(null); setShowForm(false) }}
          onSaved={() => { refetch(); setShowForm(false) }}
        />
      </Modal>

      {/* Payments Modal */}
      <CustomerPaymentsModal
        open={!!showPayments}
        onClose={() => setShowPayments(null)}
        payments={payments || []}
        loading={paymentsLoading}
      />

      {/* Invoices Modal */}
      <CustomerInvoicesModal
        open={!!showInvoices}
        onClose={() => setShowInvoices(null)}
        invoices={invoices || []}
        loading={invoicesLoading}
      />
    </div>
  )
}
