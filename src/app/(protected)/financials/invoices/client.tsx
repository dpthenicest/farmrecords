"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useInvoices, useSendInvoice, useMarkInvoicePaid, useDeleteInvoice } from "@/hooks/useInvoices"
import { InvoiceTable } from "./_components/InvoiceTable"
import { InvoiceFilters } from "./_components/InvoiceFilters"
import { InvoiceDetails } from "./_components/InvoiceDetails"
import { InvoiceForm } from "./_components/InvoiceForm"
import { Modal } from "@/components/ui/modal"
import { X } from "lucide-react"

interface AppliedFilters {
  search: string
  status: string
  startDate: string
  endDate: string
}

export default function InvoicesClient() {
  // pagination state
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)

  // pending filter state
  const [pendingSearch, setPendingSearch] = React.useState("")
  const [pendingStatus, setPendingStatus] = React.useState<string>("all")
  const [pendingStartDate, setPendingStartDate] = React.useState("")
  const [pendingEndDate, setPendingEndDate] = React.useState("")

  // applied filter state
  const [appliedFilters, setAppliedFilters] = React.useState<AppliedFilters>({
    search: "",
    status: "all",
    startDate: "",
    endDate: "",
  })

  const { invoices, totalPages, loading, error, refetch } = useInvoices({
    page,
    limit,
    status: appliedFilters.status !== "all" ? appliedFilters.status.toUpperCase() : undefined,
    startDate: appliedFilters.startDate,
    endDate: appliedFilters.endDate,
    customerId: appliedFilters.search ? Number(appliedFilters.search) : undefined, // example if backend filters by ID
  })

  const [showForm, setShowForm] = React.useState(false)
  const [selectedInvoice, setSelectedInvoice] = React.useState<any>(null)

  // Action hooks
  const { sendInvoice, loading: sending } = useSendInvoice()
  const { markPaid, loading: markingPaid } = useMarkInvoicePaid()
  const { deleteInvoice, loading: deleting } = useDeleteInvoice()

  const handleApplyFilters = () => {
    setAppliedFilters({
      search: pendingSearch,
      status: pendingStatus,
      startDate: pendingStartDate,
      endDate: pendingEndDate,
    })
    setPage(1) // reset page when filters change
  }

  const handleDateChange = (range: { start: string; end: string }) => {
    setPendingStartDate(range.start)
    setPendingEndDate(range.end)
  }

  // Action handlers
  const handleSendInvoice = async (invoice: any) => {
    if (invoice.status !== 'DRAFT') {
      alert('Only draft invoices can be sent')
      return
    }

    if (confirm(`Are you sure you want to send invoice ${invoice.invoiceNumber}?`)) {
      try {
        await sendInvoice(invoice.id)
        refetch() // Refresh the list
        alert('Invoice sent successfully!')
      } catch (error) {
        console.error('Failed to send invoice:', error)
        alert('Failed to send invoice. Please try again.')
      }
    }
  }

  const handleMarkPaid = async (invoice: any) => {
    if (invoice.status !== 'SENT' && invoice.status !== 'OVERDUE') {
      alert('Only sent or overdue invoices can be marked as paid')
      return
    }

    if (confirm(`Are you sure you want to mark invoice ${invoice.invoiceNumber} as paid?`)) {
      try {
        await markPaid(invoice.id)
        refetch() // Refresh the list
        alert('Invoice marked as paid successfully!')
      } catch (error) {
        console.error('Failed to mark invoice as paid:', error)
        alert('Failed to mark invoice as paid. Please try again.')
      }
    }
  }

  const handleDeleteInvoice = async (invoice: any) => {
    if (invoice.status === 'PAID') {
      alert('Paid invoices cannot be deleted')
      return
    }

    if (confirm(`Are you sure you want to delete invoice ${invoice.invoiceNumber}? This action cannot be undone.`)) {
      try {
        await deleteInvoice(invoice.id)
        refetch() // Refresh the list
        alert('Invoice deleted successfully!')
      } catch (error) {
        console.error('Failed to delete invoice:', error)
        alert('Failed to delete invoice. Please try again.')
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Invoices</h1>
        <Button onClick={() => setShowForm(true)}>+ Create Invoice</Button>
      </div>

      {/* Filters */}
      <InvoiceFilters
        search={pendingSearch}
        onSearch={setPendingSearch}
        status={pendingStatus}
        onStatusChange={setPendingStatus}
        startDate={pendingStartDate}
        endDate={pendingEndDate}
        onDateChange={handleDateChange}
        onApplyFilters={handleApplyFilters}
      />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <InvoiceTable
            invoices={invoices}
            totalPages={totalPages}
            page={page}
            limit={limit}
            loading={loading}
            error={error}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onView={(invoice) => setSelectedInvoice(invoice)}
            onEdit={(invoice) => {
              setSelectedInvoice(invoice)
              setShowForm(true)
            }}
            onDelete={handleDeleteInvoice}
            onSend={handleSendInvoice}
            onMarkPaid={handleMarkPaid}
            actionLoading={{
              sending,
              markingPaid,
              deleting,
            }}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        open={!!selectedInvoice && !showForm}
        onOpenChange={() => setSelectedInvoice(null)}
        title="Invoice Details"
        size="large"
      >
        {selectedInvoice && (
          <InvoiceDetails 
            invoice={selectedInvoice} 
            onClose={() => setSelectedInvoice(null)}
            onInvoiceUpdated={() => {
              refetch() // Refresh the invoice list
              setSelectedInvoice(null) // Close the modal
            }}
          />
        )}
      </Modal>
      {/* Large Modal for Invoice Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {selectedInvoice ? "Edit Invoice" : "Create Invoice"}
              </h2>
              <button
                onClick={() => {
                  setSelectedInvoice(null)
                  setShowForm(false)
                }}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <InvoiceForm
                invoice={selectedInvoice}
                onClose={() => {
                  setSelectedInvoice(null)
                  setShowForm(false)
                }}
                onSaved={() => {
                  refetch()
                  setSelectedInvoice(null)
                  setShowForm(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
