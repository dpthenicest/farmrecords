"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSendInvoice, useMarkInvoicePaid } from "@/hooks/useInvoices"

interface InvoiceDetailsProps {
  invoice: any
  onClose: () => void
  onInvoiceUpdated?: () => void
}

export function InvoiceDetails({ invoice, onClose, onInvoiceUpdated }: InvoiceDetailsProps) {
  const { sendInvoice, loading: sending } = useSendInvoice()
  const { markPaid, loading: markingPaid } = useMarkInvoicePaid()

  const handleSendInvoice = async () => {
    try {
      await sendInvoice(invoice.id)
      onInvoiceUpdated?.()
      alert("Invoice sent successfully!")
    } catch (error) {
      console.error("Failed to send invoice:", error)
      alert("Failed to send invoice. Please try again.")
    }
  }

  const handleMarkPaid = async () => {
    try {
      await markPaid(invoice.id)
      onInvoiceUpdated?.()
      alert("Invoice marked as paid!")
    } catch (error) {
      console.error("Failed to mark invoice as paid:", error)
      alert("Failed to mark invoice as paid. Please try again.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-gray-100 text-gray-800'
      case 'SENT': return 'bg-blue-100 text-blue-800'
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number | string) => {
    const numAmount = Number(amount) || 0
    return `₦${numAmount.toLocaleString()}`
  }

  return (
    <div className="space-y-6">
      {/* Invoice Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Invoice #{invoice.invoiceNumber}</h2>
          <p className="text-gray-600 mt-1">Created on {formatDate(invoice.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={getStatusColor(invoice.status)}>
            {invoice.status}
          </Badge>
          <div className="flex gap-2">
            {invoice.status === 'DRAFT' && (
              <Button 
                onClick={handleSendInvoice} 
                disabled={sending}
                size="sm"
                variant="outline"
              >
                {sending ? "Sending..." : "Send Invoice"}
              </Button>
            )}
            {(invoice.status === 'SENT' || invoice.status === 'OVERDUE') && (
              <Button 
                onClick={handleMarkPaid} 
                disabled={markingPaid}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                {markingPaid ? "Processing..." : "Mark as Paid"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Invoice Date</p>
              <p className="font-medium">{formatDate(invoice.invoiceDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due Date</p>
              <p className="font-medium">{formatDate(invoice.dueDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Method</p>
              <p className="font-medium">{invoice.paymentMethod || 'Not specified'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Date</p>
              <p className="font-medium">
                {invoice.paymentDate ? formatDate(invoice.paymentDate) : 'Not paid'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-lg">{invoice.customer?.customerName}</h4>
              <p className="text-gray-600">{invoice.customer?.businessName}</p>
              <div className="mt-3 space-y-1">
                <p><span className="font-medium">Code:</span> {invoice.customer?.customerCode}</p>
                <p><span className="font-medium">Type:</span> {invoice.customer?.customerType}</p>
                <p><span className="font-medium">Contact:</span> {invoice.customer?.contactPerson}</p>
              </div>
            </div>
            <div className="space-y-1">
              <p><span className="font-medium">Email:</span> {invoice.customer?.email || 'Not provided'}</p>
              <p><span className="font-medium">Phone:</span> {invoice.customer?.phone || 'Not provided'}</p>
              <p><span className="font-medium">Address:</span> {invoice.customer?.address || 'Not provided'}</p>
              <p><span className="font-medium">Credit Limit:</span> {formatCurrency(invoice.customer?.creditLimit || 0)}</p>
              <p><span className="font-medium">Payment Terms:</span> {invoice.customer?.paymentTermsDays || 0} days</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Items */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Description</th>
                  <th className="text-right py-2">Quantity</th>
                  <th className="text-right py-2">Unit Price</th>
                  <th className="text-right py-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items?.map((item: any, index: number) => (
                  <tr key={item.id || index} className="border-b">
                    <td className="py-3">
                      <div>
                        <p className="font-medium">{item.itemDescription}</p>
                        {item.inventory && (
                          <p className="text-sm text-gray-600">
                            Inventory: {item.inventory.itemName} ({item.inventory.itemCode})
                          </p>
                        )}
                        {item.animalBatch && (
                          <p className="text-sm text-gray-600">
                            Batch: {item.animalBatch.batchCode} - {item.animalBatch.species}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-3">{Number(item.quantity).toLocaleString()}</td>
                    <td className="text-right py-3">{formatCurrency(item.unitPrice)}</td>
                    <td className="text-right py-3 font-medium">{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-700">Subtotal:</span>
              <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Tax Amount:</span>
              <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <div className="border-t pt-3">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total Amount:</span>
                <span className="text-2xl font-bold text-green-600">
                  {formatCurrency(invoice.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {invoice.financialRecords?.length ? (
            <div className="space-y-3">
              {invoice.financialRecords.map((payment: any) => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{formatCurrency(payment.amount)}</p>
                    <p className="text-sm text-gray-600">
                      {formatDate(payment.transactionDate)} - {payment.description}
                    </p>
                  </div>
                  <Badge variant="outline">{payment.transactionType}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No payments recorded for this invoice.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {invoice.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
