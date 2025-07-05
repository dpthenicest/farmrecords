'use client'

import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RecordType } from '@/types'

interface ViewRecordModalProps {
  isOpen: boolean
  onClose: () => void
  record: any
  onEdit?: () => void
}

export function ViewRecordModal({ isOpen, onClose, record, onEdit }: ViewRecordModalProps) {
  if (!record) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getTypeBadge = (type: RecordType) => {
    return type === 'INCOME' ? (
      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
        Income
      </span>
    ) : (
      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
        Expense
      </span>
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Record Type */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{record.title}</h3>
          {getTypeBadge(record.type)}
        </div>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Date</label>
                <p className="text-sm text-gray-900">{record.date}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Category</label>
                <p className="text-sm text-gray-900">{record.category}</p>
              </div>
            </div>
            {record.animal && (
              <div>
                <label className="text-sm font-medium text-gray-500">Animal</label>
                <p className="text-sm text-gray-900">{record.animal}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financial Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Unit Price</label>
                <p className="text-sm text-gray-900">{formatCurrency(record.unitPrice)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Quantity</label>
                <p className="text-sm text-gray-900">{record.quantity}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Amount</label>
                <p className={`text-sm font-semibold ${
                  record.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {record.type === 'INCOME' ? '+' : '-'}{formatCurrency(record.total)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {record.note && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700">{record.note}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          {onEdit && (
            <Button
              variant="outline"
              onClick={onEdit}
            >
              Edit Record
            </Button>
          )}
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
} 