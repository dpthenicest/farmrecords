"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePurchaseOrders } from "@/hooks/usePurchaseOrders"
import { PurchaseOrderTable } from "./_components/PurchaseOrderTable"
import { PurchaseOrderFilters } from "./_components/PurchaseOrderFilters"
import { PurchaseOrderDetails } from "./_components/PurchaseOrderDetails"
import { PurchaseOrderForm } from "./_components/PurchaseOrderForm"
import { Modal } from "@/components/ui/modal"
import { X } from "lucide-react"

interface AppliedFilters {
  search: string
  status: string
  startDate: string
  endDate: string
}

export default function PurchaseOrdersClient() {
  const router = useRouter()
  
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
    status: appliedFilters.status !== "all" ? appliedFilters.status.toUpperCase() as "DRAFT" | "SENT" | "RECEIVED" | "PARTIAL" | "CANCELLED" : undefined,
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
            onView={(po: any) => setSelectedPO(po)}
            onEdit={(po: any) => {
              setSelectedPO(po)
              setShowForm(true)
            }}
            onDelete={(po: any) => console.log("delete", po)}
            onSend={(po: any) => console.log("send", po)}
            onReceive={(po: any) => {
              // Navigate to receive page
              router.push(`/financials/purchase-orders/${po.id}/receive`)
            }}
          />
        </CardContent>
      </Card>

      {/* Modals */}
      <Modal
        open={!!selectedPO && !showForm}
        onOpenChange={() => setSelectedPO(null)}
        title="Purchase Order Details"
        size="large"
      >
        {selectedPO && (
          <PurchaseOrderDetails
            purchaseOrder={selectedPO}
            onClose={() => setSelectedPO(null)}
          />
        )}
      </Modal>
      {/* Large Modal for Purchase Order Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {selectedPO ? "Edit Purchase Order" : "Create Purchase Order"}
              </h2>
              <button
                onClick={() => {
                  setSelectedPO(null)
                  setShowForm(false)
                }}
                className="p-2 hover:bg-gray-100 rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <PurchaseOrderForm
                purchaseOrder={selectedPO}
                onClose={() => {
                  setSelectedPO(null)
                  setShowForm(false)
                }}
                onSaved={() => {
                  refetch()
                  setSelectedPO(null)
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
