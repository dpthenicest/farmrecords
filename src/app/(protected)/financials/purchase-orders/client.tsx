"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders"
import { PurchaseOrderTable } from "./_components/PurchaseOrderTable"
import { PurchaseOrderFilters } from "./_components/PurchaseOrderFilters"
import { PurchaseOrderDetails } from "./_components/PurchaseOrderDetails"
import { PurchaseOrderForm } from "./_components/PurchaseOrderForm"
import { Modal } from "@/components/ui/modal"

interface AppliedFilters {
  search: string
  status: string
  startDate: string
  endDate: string
}

export default function PurchaseOrdersClient() {
  // pagination
  const [page, setPage] = React.useState(1)
  const [limit, setLimit] = React.useState(10)

  // filter state
  const [pendingSearch, setPendingSearch] = React.useState("")
  const [pendingStatus, setPendingStatus] = React.useState<string>("all")
  const [pendingStartDate, setPendingStartDate] = React.useState("")
  const [pendingEndDate, setPendingEndDate] = React.useState("")

  const [appliedFilters, setAppliedFilters] = React.useState<AppliedFilters>({
    search: "",
    status: "all",
    startDate: "",
    endDate: "",
  })

  const { orders, totalPages, loading, error, refetch } = usePurchaseOrders({
    page,
    limit,
    status: appliedFilters.status !== "all" ? appliedFilters.status.toUpperCase() : undefined,
    startDate: appliedFilters.startDate,
    endDate: appliedFilters.endDate,
    poNumber: appliedFilters.search || undefined,
  })

  const [showForm, setShowForm] = React.useState(false)
  const [selectedPO, setSelectedPO] = React.useState<any>(null)

  const handleApplyFilters = () => {
    setAppliedFilters({
      search: pendingSearch,
      status: pendingStatus,
      startDate: pendingStartDate,
      endDate: pendingEndDate,
    })
    setPage(1)
  }

  const handleDateChange = (range: { start: string; end: string }) => {
    setPendingStartDate(range.start)
    setPendingEndDate(range.end)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <Button onClick={() => setShowForm(true)}>+ Create Purchase Order</Button>
      </div>

      {/* Filters */}
      <PurchaseOrderFilters
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
          <CardTitle>Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <PurchaseOrderTable
            purchaseOrders={orders}
            totalPages={totalPages}
            page={page}
            limit={limit}
            loading={loading}
            error={error}
            onPageChange={setPage}
            onLimitChange={setLimit}
            onView={(po) => setSelectedPO(po)}
            onEdit={(po) => {
              setSelectedPO(po)
              setShowForm(true)
            }}
            onDelete={(po) => console.log("delete", po)}
            onSend={(po) => console.log("send", po)}
            onReceive={(po) => console.log("receive", po)}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        open={!!selectedPO && !showForm}
        onOpenChange={() => setSelectedPO(null)}
        title="Purchase Order Details"
      >
        {selectedPO && (
          <PurchaseOrderDetails
            purchaseOrder={selectedPO}
            onClose={() => setSelectedPO(null)}
          />
        )}
      </Modal>
      <Modal
        open={showForm}
        onOpenChange={setShowForm}
        title={selectedPO ? "Edit Purchase Order" : "Create Purchase Order"}
      >
        <PurchaseOrderForm
          purchaseOrder={selectedPO}
          onClose={() => {
            setSelectedPO(null)
            setShowForm(false)
          }}
          onSaved={refetch}
        />
      </Modal>
    </div>
  )
}
