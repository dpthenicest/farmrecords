// app/financials/records/_components/TransactionModal.tsx
"use client"

import { Modal } from "@/components/ui/modal"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function TransactionModal({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Add Transaction"
      description="Fill in the transaction details"
      footer={
        <>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit">Save</Button>
        </>
      }
    >
      <form className="space-y-4">
        <select
          name="transactionType"
          required
          className="w-full border rounded-md px-3 py-2 text-sm"
        >
          <option value="INCOME">Income</option>
          <option value="EXPENSE">Expense</option>
          <option value="TRANSFER">Transfer</option>
        </select>

        <Input type="number" name="amount" placeholder="Amount (₦)" required />

        <select
          name="categoryId"
          required
          className="w-full border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Select Category</option>
          {/* TODO: Populate from API */}
        </select>

        <Input type="date" name="transactionDate" required />
        <textarea
          name="description"
          placeholder="Description"
          className="w-full border rounded-md px-3 py-2 text-sm"
        />
        <Input name="referenceNumber" placeholder="Reference Number" />
      </form>
    </Modal>
  )
}
