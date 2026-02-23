"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DatePicker } from "@/components/ui/date-picker"

import { useCustomers } from "@/hooks/useCustomers"
import { useInventory } from "@/hooks/useInventory"
import { useAssets } from "@/hooks/useAssets"
import { useAnimalBatches } from "@/hooks/useAnimalBatches"
import { useSalesExpenseCategories } from "@/hooks/useSalesExpenseCategories"
import { useCreateInvoice, useUpdateInvoice } from "@/hooks/useInvoices"

interface InvoiceItem {
  id?: number
  inventoryId?: number
  assetId?: number
  animalBatchId?: number
  itemDescription: string
  quantity: number
  unitPrice: number
  totalPrice: number
  // Allow linking inventory to animal batch
  linkedToBatch?: boolean // Flag to indicate if inventory is related to batch
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
    customerId: invoice?.customerId ? String(invoice.customerId) : "",
    notes: invoice?.notes || "",
    status: invoice?.status || "DRAFT",
    paymentMethod: invoice?.paymentMethod || "",
    categoryId: "", // For financial record category
  })

  const [taxRate, setTaxRate] = React.useState<number>(
    invoice?.taxAmount && invoice?.subtotal 
      ? (Number(invoice.taxAmount) / Number(invoice.subtotal)) * 100 
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
      assetId: item.assetId,
      animalBatchId: item.animalBatchId,
      itemDescription: item.itemDescription,
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      totalPrice: Number(item.totalPrice) || 0,
    })) || [{ itemDescription: "", quantity: 1, unitPrice: 0, totalPrice: 0 }]
  )

  const [customerSearch, setCustomerSearch] = React.useState(
    invoice?.customer?.customerName || ""
  )
  const [showCustomerDropdown, setShowCustomerDropdown] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Hooks - Load all customers initially, then filter by search
  const { customers: allCustomers } = useCustomers({ limit: 100 })
  
  // Filter customers based on search
  const customers = React.useMemo(() => {
    if (!customerSearch.trim()) return allCustomers
    return allCustomers.filter(customer => 
      customer.customerName.toLowerCase().includes(customerSearch.toLowerCase()) ||
      customer.customerCode.toLowerCase().includes(customerSearch.toLowerCase())
    )
  }, [allCustomers, customerSearch])
  const { items: inventoryItems, loading: inventoryLoading, error: inventoryError } = useInventory({ limit: 100 })
  const { assets, loading: assetsLoading, error: assetsError } = useAssets({ limit: 100 })
  const { batches, loading: batchesLoading, error: batchesError } = useAnimalBatches({ limit: 100 })
  const { categories: salesCategories, loading: categoriesLoading } = useSalesExpenseCategories({ 
    categoryType: "SALES", 
    isActive: true, 
    limit: 100 
  })
  const { createInvoice, loading: creating } = useCreateInvoice()
  const { updateInvoice, loading: updating } = useUpdateInvoice()

  // Debug logging and error handling
  React.useEffect(() => {
    if (inventoryError) console.error("Inventory error:", inventoryError)
    if (assetsError) console.error("Assets error:", assetsError)
    if (batchesError) console.error("Batches error:", batchesError)
    
    if (!inventoryLoading && inventoryItems.length === 0 && !inventoryError) {
      console.warn("No inventory items found")
    }
    if (!assetsLoading && assets.length === 0 && !assetsError) {
      console.warn("No assets found")
    }
    if (!batchesLoading && batches.length === 0 && !batchesError) {
      console.warn("No animal batches found")
    }
  }, [inventoryItems, inventoryLoading, inventoryError, assets, assetsLoading, assetsError, batches, batchesLoading, batchesError])

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
    setForm({ ...form, customerId: String(customer.id) })
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
    
    // Convert numeric fields to numbers
    if (field === 'quantity' || field === 'unitPrice') {
      const numericValue = Number(value) || 0
      newItems[index] = { ...newItems[index], [field]: numericValue }
      
      // Auto-calculate total price when quantity or unit price changes
      const quantity = field === 'quantity' ? numericValue : newItems[index].quantity
      const unitPrice = field === 'unitPrice' ? numericValue : newItems[index].unitPrice
      newItems[index].totalPrice = quantity * unitPrice
    } else {
      newItems[index] = { ...newItems[index], [field]: value }
    }
    
    setItems(newItems)
  }

  function selectInventoryItem(index: number, inventoryId: number) {
    const inventoryItem = inventoryItems.find(item => item.id === inventoryId)
    if (inventoryItem) {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        inventoryId: inventoryId,
        assetId: undefined,
        // Keep animalBatchId if linkedToBatch is true, otherwise clear it
        animalBatchId: newItems[index].linkedToBatch ? newItems[index].animalBatchId : undefined,
        itemDescription: inventoryItem.itemName,
        unitPrice: Number(inventoryItem.sellingPrice) || 0,
      }
      
      // Auto-calculate total price after setting unit price
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice
      setItems(newItems)
    }
  }

  function selectAsset(index: number, assetId: number) {
    const asset = assets.find(a => a.id === assetId)
    if (asset) {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        assetId: assetId,
        inventoryId: undefined,
        animalBatchId: undefined,
        linkedToBatch: false,
        itemDescription: `${asset.assetName} (${asset.assetCode})`,
        unitPrice: Number(asset.purchaseCost) || 0, // Use purchase cost as default
      }
      
      // Auto-calculate total price after setting unit price
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice
      setItems(newItems)
    }
  }

  function selectAnimalBatch(index: number, batchId: number) {
    const batch = batches.find(b => b.id === batchId)
    if (batch) {
      const newItems = [...items]
      newItems[index] = {
        ...newItems[index],
        animalBatchId: batchId,
        // Keep inventoryId if linkedToBatch is true, otherwise clear it
        inventoryId: newItems[index].linkedToBatch ? newItems[index].inventoryId : undefined,
        assetId: undefined,
        itemDescription: `${batch.species} - ${batch.breed} (${batch.batchCode})`,
      }
      setItems(newItems)
    }
  }

  function toggleBatchLink(index: number) {
    const newItems = [...items]
    const currentLinked = newItems[index].linkedToBatch || false
    
    if (!currentLinked) {
      // Enabling link - keep both inventory and batch
      newItems[index].linkedToBatch = true
    } else {
      // Disabling link - this is now mutually exclusive mode
      // Keep whichever was selected most recently, or clear batch if inventory exists
      if (newItems[index].inventoryId) {
        newItems[index].animalBatchId = undefined
      }
      newItems[index].linkedToBatch = false
    }
    
    setItems(newItems)
  }

  function clearItemSelection(index: number) {
    const newItems = [...items]
    newItems[index] = {
      ...newItems[index],
      inventoryId: undefined,
      assetId: undefined,
      animalBatchId: undefined,
      linkedToBatch: false,
      itemDescription: "",
      unitPrice: 0,
      totalPrice: 0,
    }
    setItems(newItems)
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

    if (items.length === 0 || items.some(item => !item.itemDescription || item.quantity <= 0 || item.unitPrice < 0)) {
      alert("Please add at least one valid item with positive quantity and non-negative unit price")
      return
    }

    // Validate that all numeric values are valid numbers
    if (items.some(item => isNaN(item.quantity) || isNaN(item.unitPrice))) {
      alert("Please ensure all quantities and prices are valid numbers")
      return
    }

    const invoiceData = {
      customerId: Number(form.customerId),
      invoiceDate: invoiceDate.toISOString(),
      dueDate: dueDate.toISOString(),
      notes: form.notes,
      status: form.status,
      paymentMethod: form.paymentMethod || undefined,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined, // For financial record creation
      taxRate: Number(taxRate) || 0,
      items: items.map(item => ({
        inventoryId: item.inventoryId || undefined,
        assetId: item.assetId || undefined,
        animalBatchId: item.animalBatchId || undefined,
        itemDescription: item.itemDescription,
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.unitPrice) || 0,
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
              placeholder="Search customers or click to see all..."
              value={customerSearch}
              onChange={handleCustomerSearch}
              onFocus={() => setShowCustomerDropdown(true)}
            />
            {showCustomerDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <div
                      key={customer.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => selectCustomer(customer)}
                    >
                      <div className="font-medium">{customer.customerName}</div>
                      <div className="text-sm text-gray-500">{customer.customerCode}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-center text-gray-500">
                    {allCustomers.length === 0 ? "No customers available" : "No customers match your search"}
                  </div>
                )}
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

        {/* Status and Payment Method */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Invoice Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Method</label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="">Select payment method...</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="card">Card</option>
              <option value="mobile_money">Mobile Money</option>
            </select>
          </div>
        </div>

        {/* Sales Category - For Financial Record Creation */}
        {(form.status === 'SENT' || form.status === 'PAID') && (
          <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="text-sm font-medium text-blue-900">
              Sales Category * (Required for financial record)
            </label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required={form.status === 'SENT' || form.status === 'PAID'}
              disabled={categoriesLoading}
              className="w-full rounded border border-blue-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
            >
              <option value="">
                {categoriesLoading ? "Loading categories..." : "Select sales category..."}
              </option>
              {salesCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
            <p className="text-xs text-blue-700">
              A financial record will be automatically created when this invoice is sent or marked as paid.
            </p>
          </div>
        )}

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
            const selectedAsset = item.assetId ? assets.find(asset => asset.id === item.assetId) : null
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
                <div className="space-y-3">
                  {/* Clear Selection Button - Show if any item is selected */}
                  {(item.inventoryId || item.assetId || item.animalBatchId) && (
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() => clearItemSelection(index)}
                        variant="secondary"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        ✕ Clear Selection
                      </Button>
                    </div>
                  )}

                  {/* Link Toggle - Only show if inventory or batch is selected */}
                  {(item.inventoryId || item.animalBatchId) && !item.assetId && (
                    <div className="flex items-center gap-2 p-2 bg-purple-50 rounded border border-purple-200">
                      <input
                        type="checkbox"
                        id={`link-${index}`}
                        checked={item.linkedToBatch || false}
                        onChange={() => toggleBatchLink(index)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <label htmlFor={`link-${index}`} className="text-sm font-medium text-purple-900 cursor-pointer">
                        🔗 Link Inventory to Animal Batch
                      </label>
                      <span className="text-xs text-purple-700 ml-auto">
                        {item.linkedToBatch 
                          ? "Inventory is related to the selected batch" 
                          : "Select both inventory and batch to link them"}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-600">
                        From Inventory
                        {item.linkedToBatch && item.animalBatchId && (
                          <span className="ml-1 text-purple-600">🔗</span>
                        )}
                      </label>
                      <select
                        value={item.inventoryId || ""}
                        onChange={(e) => selectInventoryItem(index, Number(e.target.value))}
                        disabled={inventoryLoading || (item.assetId ? true : false)}
                        className={`w-full rounded border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50 ${
                          item.linkedToBatch && item.animalBatchId ? 'border-purple-300 bg-purple-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">
                          {inventoryLoading ? "Loading inventory..." : 
                           inventoryError ? "Error loading inventory" :
                           item.assetId ? "Clear asset first" :
                           "Select inventory item..."}
                        </option>
                        {inventoryItems.map((invItem) => (
                          <option key={invItem.id} value={invItem.id}>
                            {invItem.itemName} (₦{Number(invItem.sellingPrice || 0).toLocaleString()})
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
                      <label className="text-xs text-gray-600">From Assets</label>
                      <select
                        value={item.assetId || ""}
                        onChange={(e) => selectAsset(index, Number(e.target.value))}
                        disabled={assetsLoading || (item.inventoryId || item.animalBatchId ? true : false)}
                        className="w-full rounded border border-gray-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
                      >
                        <option value="">
                          {assetsLoading ? "Loading assets..." : 
                           assetsError ? "Error loading assets" :
                           (item.inventoryId || item.animalBatchId) ? "Clear other selections first" :
                           "Select asset..."}
                        </option>
                        {assets.map((asset) => (
                          <option key={asset.id} value={asset.id}>
                            {asset.assetName} ({asset.assetCode})
                          </option>
                        ))}
                      </select>
                      {assetsError && (
                        <div className="text-xs text-red-600 mt-1">
                          {assetsError.message}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">
                        From Animal Batch
                        {item.linkedToBatch && item.inventoryId && (
                          <span className="ml-1 text-purple-600">🔗</span>
                        )}
                      </label>
                      <select
                        value={item.animalBatchId || ""}
                        onChange={(e) => selectAnimalBatch(index, Number(e.target.value))}
                        disabled={batchesLoading || (item.assetId ? true : false)}
                        className={`w-full rounded border p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50 ${
                          item.linkedToBatch && item.inventoryId ? 'border-purple-300 bg-purple-50' : 'border-gray-300'
                        }`}
                      >
                        <option value="">
                          {batchesLoading ? "Loading batches..." : 
                           batchesError ? "Error loading batches" :
                           item.assetId ? "Clear asset first" :
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
                </div>

                {/* Selected Item Details Display */}
                {(selectedInventoryItem || selectedAsset || selectedBatch) && (
                  <div className={`p-3 rounded-md ${item.linkedToBatch && selectedInventoryItem && selectedBatch ? 'bg-purple-50 border border-purple-200' : 'bg-blue-50'}`}>
                    <div className="text-xs font-medium text-blue-800 mb-2">
                      Selected Item Details:
                      {item.linkedToBatch && selectedInventoryItem && selectedBatch && (
                        <span className="ml-2 text-purple-700 font-semibold">🔗 Linked: Inventory + Batch</span>
                      )}
                    </div>
                    
                    {/* Show both inventory and batch when linked */}
                    {item.linkedToBatch && selectedInventoryItem && selectedBatch ? (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 text-sm text-purple-700 border-r border-purple-200 pr-4">
                          <div className="font-semibold text-purple-900 mb-2">📦 Inventory Item</div>
                          <div><span className="font-medium">Item:</span> {selectedInventoryItem.itemName}</div>
                          <div><span className="font-medium">Code:</span> {selectedInventoryItem.itemCode}</div>
                          <div className="flex items-center gap-2">
                            <span><span className="font-medium">Current Stock:</span> {Number(selectedInventoryItem.currentQuantity || 0).toLocaleString()} {selectedInventoryItem.unitOfMeasure}</span>
                            {item.quantity > Number(selectedInventoryItem.currentQuantity || 0) && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                ⚠️ Insufficient stock
                              </span>
                            )}
                          </div>
                          <div><span className="font-medium">Selling Price:</span> ₦{Number(selectedInventoryItem.sellingPrice || 0).toLocaleString()}</div>
                          {selectedInventoryItem.location && (
                            <div><span className="font-medium">Location:</span> {selectedInventoryItem.location}</div>
                          )}
                        </div>
                        <div className="space-y-1 text-sm text-purple-700">
                          <div className="font-semibold text-purple-900 mb-2">🐔 Animal Batch</div>
                          <div><span className="font-medium">Batch:</span> {selectedBatch.batchCode}</div>
                          <div><span className="font-medium">Species:</span> {selectedBatch.species}</div>
                          <div><span className="font-medium">Breed:</span> {selectedBatch.breed}</div>
                          <div><span className="font-medium">Current Quantity:</span> {Number(selectedBatch.currentQuantity || 0).toLocaleString()}</div>
                          <div><span className="font-medium">Status:</span> {selectedBatch.batchStatus}</div>
                          {selectedBatch.location && (
                            <div><span className="font-medium">Location:</span> {selectedBatch.location}</div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        {selectedInventoryItem && !item.linkedToBatch && (
                          <div className="space-y-1 text-sm text-blue-700">
                            <div><span className="font-medium">Item:</span> {selectedInventoryItem.itemName}</div>
                            <div><span className="font-medium">Code:</span> {selectedInventoryItem.itemCode}</div>
                            <div className="flex items-center gap-2">
                              <span><span className="font-medium">Current Stock:</span> {Number(selectedInventoryItem.currentQuantity || 0).toLocaleString()} {selectedInventoryItem.unitOfMeasure}</span>
                              {item.quantity > Number(selectedInventoryItem.currentQuantity || 0) && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  ⚠️ Insufficient stock
                                </span>
                              )}
                            </div>
                            <div><span className="font-medium">Selling Price:</span> ₦{Number(selectedInventoryItem.sellingPrice || 0).toLocaleString()}</div>
                            {selectedInventoryItem.location && (
                              <div><span className="font-medium">Location:</span> {selectedInventoryItem.location}</div>
                            )}
                          </div>
                        )}
                        {selectedAsset && (
                          <div className="space-y-1 text-sm text-blue-700">
                            <div><span className="font-medium">Asset:</span> {selectedAsset.assetName}</div>
                            <div><span className="font-medium">Code:</span> {selectedAsset.assetCode}</div>
                            <div><span className="font-medium">Type:</span> {selectedAsset.assetType}</div>
                            <div><span className="font-medium">Purchase Cost:</span> ₦{Number(selectedAsset.purchaseCost || 0).toLocaleString()}</div>
                            <div><span className="font-medium">Condition:</span> {selectedAsset.conditionStatus}</div>
                            {selectedAsset.location && (
                              <div><span className="font-medium">Location:</span> {selectedAsset.location}</div>
                            )}
                            {selectedAsset.purchaseDate && (
                              <div><span className="font-medium">Purchase Date:</span> {new Date(selectedAsset.purchaseDate).toLocaleDateString()}</div>
                            )}
                          </div>
                        )}
                        {selectedBatch && !item.linkedToBatch && (
                          <div className="space-y-1 text-sm text-blue-700">
                            <div><span className="font-medium">Batch:</span> {selectedBatch.batchCode}</div>
                            <div><span className="font-medium">Species:</span> {selectedBatch.species}</div>
                            <div><span className="font-medium">Breed:</span> {selectedBatch.breed}</div>
                            <div className="flex items-center gap-2">
                              <span><span className="font-medium">Current Quantity:</span> {Number(selectedBatch.currentQuantity || 0).toLocaleString()}</span>
                              {item.quantity > Number(selectedBatch.currentQuantity || 0) && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  ⚠️ Exceeds batch size
                                </span>
                              )}
                            </div>
                            <div><span className="font-medium">Average Weight:</span> {Number(selectedBatch.averageWeight || 0).toLocaleString()} kg</div>
                            <div><span className="font-medium">Status:</span> {selectedBatch.batchStatus}</div>
                            {selectedBatch.location && (
                              <div><span className="font-medium">Location:</span> {selectedBatch.location}</div>
                            )}
                          </div>
                        )}
                      </>
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
                      value={item.quantity || ""}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600">
                      Unit Price * 
                      {selectedInventoryItem && (
                        <span className="text-green-600 ml-1">
                          (Auto-filled from inventory: ₦{Number(selectedInventoryItem.sellingPrice || 0).toLocaleString()})
                        </span>
                      )}
                      {selectedAsset && (
                        <span className="text-green-600 ml-1">
                          (Auto-filled from asset: ₦{Number(selectedAsset.purchaseCost || 0).toLocaleString()})
                        </span>
                      )}
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice || ""}
                      onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                      required
                      className={(selectedInventoryItem || selectedAsset) ? "border-green-300 bg-green-50" : ""}
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    {item.quantity.toLocaleString()} × ₦{item.unitPrice.toLocaleString()} = 
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
              value={taxRate || ""}
              onChange={(e) => setTaxRate(Number(e.target.value) || 0)}
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