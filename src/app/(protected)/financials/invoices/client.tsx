"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useInvoices } from "@/hooks/useInvoices"
import { InvoiceTable } from "./_components/InvoiceTable"
import { InvoiceFilters } from "./_components/InvoiceFilters"
import { InvoiceDetails } from "./_components/InvoiceDetails"
import { InvoiceForm } from "./_components/InvoiceForm"
import { Modal } from "@/components/ui/modal"

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
            onDelete={(invoice) => console.log("delete", invoice)}
            onSend={(invoice) => console.log("send", invoice)}
            onMarkPaid={(invoice) => console.log("paid", invoice)}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        open={!!selectedInvoice && !showForm}
        onOpenChange={() => setSelectedInvoice(null)}
        title="Invoice Details"
      >
        {selectedInvoice && (
          <InvoiceDetails invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
        )}
      </Modal>
      <Modal
        open={showForm}
        onOpenChange={setShowForm}
        title={selectedInvoice ? "Edit Invoice" : "Create Invoice"}
      >
        <InvoiceForm
          invoice={selectedInvoice}
          onClose={() => {
            setSelectedInvoice(null)
            setShowForm(false)
          }}
          onSaved={refetch}
        />
      </Modal>
    </div>
  )
}
