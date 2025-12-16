"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"

import { useCustomers } from "@/hooks/useCustomers"
import { useInventory } from "@/hooks/useInventory"
import { useAnimalBatches } from "@/hooks/useAnimalBatches"
import { useCreateInvoice, useUpdateInvoice } from "@/hooks/useInvoices"
import { useSalesExpenseCategories } from "@/hooks/useSalesExpenseCategories"

interface InvoiceItem {
  id?: number
  inventoryId?: number
  animalBatchId?: number
  itemDescription: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

export function InvoiceForm({
  invoice,
  onClose,
  onSaved,
}: {
  invoice?: any
  onClose: () => void
  onSaved: () => void
}) {
  const [form, setForm] = React.useState({
    customerId: invoice?.customerId || "",
    notes: invoice?.notes || "",
    categoryId: invoice?.categoryId || "",
  })

  const [taxRate, setTaxRate] = React.useState<number>(
    invoice?.taxAmount && invoice?.subtotal 
      ? (invoice.taxAmount / invoice.subtotal) * 100 
      : 8 // Default 8% VAT
  )
  
  const [invoiceDate, setInvoiceDate] = React.useState<Date | undefined>(
    invoice?.invoiceDate ? new Date(invoice.invoiceDate) : new Date()
  )
  const [dueDate, setDueDate] = React.useState<Date | undefined>(
    invoice?.dueDate ? new Date(invoice.dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  )

  const [items, setItems] = React.useState<InvoiceItem[]>(
    invoice?.items?.map((item: any) => ({
      id: item.id,
      inventoryId: item.inventoryId,
      animalBatchId: item.animalBatchId,
      itemDescription: item.itemDescription,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    })) || [{ itemDescription: "", quantity: 1, unitPrice: 0, totalPrice: 0 }]
  )

  const [customerSearch, setCustomerSearch] = React.useState(
    invoice?.customer?.customerName || ""
  )
  const [showCustomerDropdown, setShowCustomerDropdown] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Hooks
  const { customers } = useCustomers({ customerName: customerSearch, limit: 10 })
  const { items: inventoryItems, loading: inventoryLoading, error: inventoryError } = useInventory({ limit: 100 })
  const { batches, loading: batchesLoading, error: batchesError } = useAnimalBatches({ limit: 100 })
  const { categories, loading: categoriesLoading, error: categoriesError } = useSalesExpenseCategories({ categoryType: "SALES" })
  const { createInvoice, loading: creating } = useCreateInvoice()
  const { updateInvoice, loading: updating } = useUpdateInvoice()

  // Debug logging and error handling
  React.useEffect(() => {
    if (categoriesError) console.error("Categories error:", categoriesError)
    if (inventoryError) console.error("Inventory error:", inventoryError)
    if (batchesError) console.error("Batches error:", batchesError)
    
    if (!categoriesLoading && categories.length === 0 && !categoriesError) {
      console.warn("No sales categories found")
    }
    if (!inventoryLoading && inventoryItems.length === 0 && !inventoryError) {
      console.warn("No inventory items found")
    }
    if (!batchesLoading && batches.length === 0 && !batchesError) {
      console.warn("No animal batches found")
    }
  }, [categories, categoriesLoading, categoriesError, inventoryItems, inventoryLoading, inventoryError, batches, batchesLoading, batchesError])

  // Set initial customer search if editing
  React.useEffect(() => {
    if (invoice?.customer && !customerSearch) {
      setCustomerSearch(invoice.customer.customerName)
    }
  }, [invoice, customerSearch])

  const selectedCustomer = customers.find(c => c.id === Number(form.customerId))

  // Handle click outside to close dropdown
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCustomerDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  function handleCustomerSearch(e: React.ChangeEvent<HTMLInputElement>) {
    setCustomerSearch(e.target.value)
    setShowCustomerDropdown(true)
  }

  function selectCustomer(customer: any) {
    setForm({ ...form, customerId: customer.id })
    setCustomerSearch(customer.customerName)
    setShowCustomerDropdown(false)
  }

  function addItem() {
    setItems([...items, { itemDescription: "", quantity: 1, unitPrice: 0, totalPrice: 0 }])
  }

  function removeItem(index: number) {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  function updateItem(index: number, field: keyof InvoiceItem, value: any) {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Auto-calculate total price
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice
    }
    
    setItems(newItems)
  }

  function selectInventoryItem(index: number, inventoryId: number) {
    const inventoryItem = inventoryItems.find(item => item.id === inventoryId)
    if (inventoryItem) {
      updateItem(index, 'inventoryId', inventoryId)
      updateItem(index, 'animalBatchId', undefined)
      updateItem(index, 'itemDescription', inventoryItem.itemName)
      updateItem(index, 'unitPrice', inventoryItem.sellingPrice || 0)
      
      // Auto-calculate total price after setting unit price
      const newItems = [...items]
      newItems[index].totalPrice = newItems[index].quantity * (inventoryItem.sellingPrice || 0)
      setItems(newItems)
    }
  }

  function selectAnimalBatch(index: number, batchId: number) {
    const batch = batches.find(b => b.id === batchId)
    if (batch) {
      updateItem(index, 'animalBatchId', batchId)
      updateItem(index, 'inventoryId', undefined)
      updateItem(index, 'itemDescription', `${batch.species} - ${batch.breed} (${batch.batchCode})`)
      updateItem(index, 'unitPrice', 0) // User needs to set price
    }
  }

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
  const taxAmount = subtotal * (taxRate / 100)
  const totalAmount = subtotal + taxAmount

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!form.customerId) {
      alert("Please select a customer")
      return
    }

    if (!invoiceDate || !dueDate) {
      alert("Invoice Date and Due Date are required")
      return
    }

    if (items.length === 0 || items.some(item => !item.itemDescription || item.quantity <= 0)) {
      alert("Please add at least one valid item")
      return
    }

    const invoiceData = {
      customerId: Number(form.customerId),
      invoiceDate: invoiceDate.toISOString(),
      dueDate: dueDate.toISOString(),
      notes: form.notes,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      taxRate: taxRate,
      items: items.map(item => ({
        inventoryId: item.inventoryId || undefined,
        animalBatchId: item.animalBatchId || undefined,
        itemDescription: item.itemDescription,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }))
    }

    try {
      if (invoice) {
        await updateInvoice(invoice.id, invoiceData)
      } else {
        await createInvoice(invoiceData)
      }
      onSaved()
      onClose()
    } catch (error) {
      console.error("Failed to save invoice:", error)
      alert("Failed to save invoice. Please try again.")
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Customer *</label>
          <div className="relative" ref={dropdownRef}>
            <Input
              placeholder="Search customers..."
              value={customerSearch}
              onChange={handleCustomerSearch}
              onFocus={() => setShowCustomerDropdown(true)}
            />
            {showCustomerDropdown && customers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => selectCustomer(customer)}
                  >
                    <div className="font-medium">{customer.customerName}</div>
                    <div className="text-sm text-gray-500">{customer.customerCode}</div>
                  </div>
                ))}
              </div>
            )}
            {showCustomerDropdown && customers.length === 0 && customerSearch && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-4 text-center text-gray-500">
                No customers found
              </div>
            )}
          </div>
          {selectedCustomer && (
            <div className="text-sm text-gray-600">
              Selected: {selectedCustomer.customerName} ({selectedCustomer.customerCode})
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Invoice Date *</label>
            <DatePicker value={invoiceDate} onChange={setInvoiceDate} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Due Date *</label>
            <DatePicker value={dueDate} onChange={setDueDate} />
          </div>
        </div>

        {/* Sales Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Sales Category (Optional)</label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            disabled={categoriesLoading}
            className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
          >
            <option value="">
              {categoriesLoading ? "Loading categories..." : 
               categoriesError ? "Error loading categories" : 
               "Select category..."}
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.categoryName}
              </option>
            ))}
          </select>
          {categoriesError && (
            <div className="text-xs text-red-600">
              Error: {categoriesError.message}
            </div>
          )}
          {form.categoryId && (
            <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
              ✅ A financial record will be automatically created in this category when the invoice is saved
            </div>
          )}
        </div>

        {/* Invoice Items */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium">Invoice Items *</label>
            <Button type="button" onClick={addItem} variant="secondary" size="sm">
              Add Item
            </Button>
          </div>

          {items.map((item, index) => {
            const selectedInventoryItem = item.inventoryId ? inventoryItems.find(inv => inv.id === item.inventoryId) : null
            const selectedBatch = item.animalBatchId ? batches.find(batch => batch.id === item.animalBatchId) : null
            
            return (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Item {index + 1}</span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeItem(index)}
                      variant="secondary"
                      size="sm"
                    >
                      Remove
                    </Button>
                  )}
                </div>

                {/* Item Source Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-600">From Inventory</label>
                    <select
                      value={item.inventoryId || ""}
                      onChange={(e) => selectInventoryItem(index, Number(e.target.value))}
                      disabled={inventoryLoading}
                      className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
                    >
                      <option value="">
                        {inventoryLoading ? "Loading inventory..." : 
                         inventoryError ? "Error loading inventory" :
                         "Select inventory item..."}
                      </option>
                      {inventoryItems.map((invItem) => (
                        <option key={invItem.id} value={invItem.id}>
                          {invItem.itemName} (₦{invItem.sellingPrice || 0})
                        </option>
                      ))}
                    </select>
                    {inventoryError && (
                      <div className="text-xs text-red-600 mt-1">
                        {inventoryError.message}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">From Animal Batch</label>
                    <select
                      value={item.animalBatchId || ""}
                      onChange={(e) => selectAnimalBatch(index, Number(e.target.value))}
                      disabled={batchesLoading}
                      className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
                    >
                      <option value="">
                        {batchesLoading ? "Loading batches..." : 
                         batchesError ? "Error loading batches" :
                         "Select animal batch..."}
                      </option>
                      {batches.map((batch) => (
                        <option key={batch.id} value={batch.id}>
                          {batch.species} - {batch.breed} ({batch.batchCode})
                        </option>
                      ))}
                    </select>
                    {batchesError && (
                      <div className="text-xs text-red-600 mt-1">
                        {batchesError.message}
                      </div>
                    )}
                  </div>
                </div>

                {/* Selected Item Details Display */}
                {(selectedInventoryItem || selectedBatch) && (
                  <div className="bg-blue-50 p-3 rounded-md">
                    <div className="text-xs font-medium text-blue-800 mb-2">Selected Item Details:</div>
                    {selectedInventoryItem && (
                      <div className="space-y-1 text-sm text-blue-700">
                        <div><span className="font-medium">Item:</span> {selectedInventoryItem.itemName}</div>
                        <div><span className="font-medium">Code:</span> {selectedInventoryItem.itemCode}</div>
                        <div className="flex items-center gap-2">
                          <span><span className="font-medium">Current Stock:</span> {selectedInventoryItem.currentQuantity} {selectedInventoryItem.unitOfMeasure}</span>
                          {item.quantity > selectedInventoryItem.currentQuantity && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              ⚠️ Insufficient stock
                            </span>
                          )}
                        </div>
                        <div><span className="font-medium">Selling Price:</span> ₦{selectedInventoryItem.sellingPrice || 0}</div>
                        {selectedInventoryItem.location && (
                          <div><span className="font-medium">Location:</span> {selectedInventoryItem.location}</div>
                        )}
                      </div>
                    )}
                    {selectedBatch && (
                      <div className="space-y-1 text-sm text-blue-700">
                        <div><span className="font-medium">Batch:</span> {selectedBatch.batchCode}</div>
                        <div><span className="font-medium">Species:</span> {selectedBatch.species}</div>
                        <div><span className="font-medium">Breed:</span> {selectedBatch.breed}</div>
                        <div className="flex items-center gap-2">
                          <span><span className="font-medium">Current Quantity:</span> {selectedBatch.currentQuantity}</span>
                          {item.quantity > selectedBatch.currentQuantity && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                              ⚠️ Exceeds batch size
                            </span>
                          )}
                        </div>
                        <div><span className="font-medium">Average Weight:</span> {selectedBatch.averageWeight} kg</div>
                        <div><span className="font-medium">Status:</span> {selectedBatch.batchStatus}</div>
                        {selectedBatch.location && (
                          <div><span className="font-medium">Location:</span> {selectedBatch.location}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Item Details */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <label className="text-xs text-gray-600">Description *</label>
                    <Input
                      placeholder="Item description"
                      value={item.itemDescription}
                      onChange={(e) => updateItem(index, 'itemDescription', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Quantity *</label>
                    <Input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', Number(e.target.value))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">Unit Price *</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', Number(e.target.value))}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {item.quantity} × ₦{item.unitPrice.toLocaleString()} = 
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    ₦{item.totalPrice.toLocaleString()}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Tax Configuration */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Tax Rate (Optional)</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
              className="w-24"
            />
            <span className="text-sm text-gray-600">%</span>
            <span className="text-sm text-gray-500">
              (Default: 8% VAT - adjust as needed)
            </span>
          </div>
        </div>

        {/* Invoice Totals */}
        <div className="bg-gray-50 p-6 rounded-lg space-y-3">
          <div className="text-lg font-semibold text-gray-800 mb-4">Invoice Summary</div>
          
          {/* Selected Category Display */}
          {form.categoryId && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-sm text-gray-600">Sales Category:</span>
              <span className="text-sm font-medium text-blue-600">
                {categories.find(cat => cat.id === Number(form.categoryId))?.categoryName || 'Selected Category'}
              </span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Subtotal:</span>
            <span className="font-medium">₦{subtotal.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Tax ({taxRate}%):</span>
            <span className="font-medium">₦{taxAmount.toLocaleString()}</span>
          </div>
          
          <div className="border-t border-gray-300 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-xl font-bold text-gray-800">Total Amount:</span>
              <span className="text-2xl font-bold text-green-600">₦{totalAmount.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Items Summary */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {items.length} item{items.length !== 1 ? 's' : ''} • 
              Total Quantity: {items.reduce((sum, item) => sum + item.quantity, 0)}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <textarea
            name="notes"
            placeholder="Additional notes..."
            value={form.notes}
            onChange={handleChange}
            className="w-full rounded border p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-green-600"
          />
        </div>
        
        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={creating || updating}>
            {creating || updating ? "Saving..." : (invoice ? "Update Invoice" : "Create Invoice")}
          </Button>
        </div>
      </form>
    </div>
  )
}