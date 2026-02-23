"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DatePicker } from "@/components/ui/date-picker"
import { useSalesExpenseCategories } from "@/hooks/useSalesExpenseCategories"

interface AssetFormProps {
  asset?: any
  onClose: () => void
  onSaved: () => void
}

export function AssetForm({ asset, onClose, onSaved }: AssetFormProps) {
  const [form, setForm] = useState({
    assetName: asset?.assetName || "",
    assetCode: asset?.assetCode || "",
    assetType: asset?.assetType || "",
    categoryId: asset?.categoryId?.toString() || "",
    purchaseCost: asset?.purchaseCost?.toString() || "",
    salvageValue: asset?.salvageValue?.toString() || "",
    usefulLifeYears: asset?.usefulLifeYears?.toString() || "",
    depreciationRate: asset?.depreciationRate?.toString() || "",
    conditionStatus: asset?.conditionStatus || "GOOD",
    location: asset?.location || "",
    description: asset?.description || "",
    warrantyInfo: asset?.warrantyInfo || "",
    insuranceInfo: asset?.insuranceInfo || "",
  })
  
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(
    asset?.purchaseDate ? new Date(asset.purchaseDate) : new Date()
  )
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Fetch expense categories only
  const { categories: expenseCategories, loading: categoriesLoading } = useSalesExpenseCategories({
    categoryType: "EXPENSE",
    isActive: true,
    limit: 100
  })

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
    // Clear errors when user starts typing
    if (errors.length > 0) {
      setErrors([])
    }
  }

  const validateForm = () => {
    const newErrors: string[] = []

    if (!form.assetName.trim()) {
      newErrors.push("Asset name is required")
    }

    if (!form.assetCode.trim()) {
      newErrors.push("Asset code is required")
    }

    if (!form.assetType) {
      newErrors.push("Asset type is required")
    }

    if (!purchaseDate) {
      newErrors.push("Purchase date is required")
    }

    if (!form.purchaseCost || isNaN(Number(form.purchaseCost)) || Number(form.purchaseCost) <= 0) {
      newErrors.push("Valid purchase cost is required")
    }

    if (!form.salvageValue || isNaN(Number(form.salvageValue)) || Number(form.salvageValue) < 0) {
      newErrors.push("Valid salvage value is required")
    }

    if (Number(form.salvageValue) >= Number(form.purchaseCost)) {
      newErrors.push("Salvage value must be less than purchase cost")
    }

    if (!form.usefulLifeYears || isNaN(Number(form.usefulLifeYears)) || Number(form.usefulLifeYears) <= 0) {
      newErrors.push("Valid useful life years is required")
    }

    if (!form.depreciationRate || isNaN(Number(form.depreciationRate)) || Number(form.depreciationRate) < 0) {
      newErrors.push("Valid depreciation rate is required")
    }

    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    setErrors([])

    try {
      const url = asset ? `/api/assets/${asset.id}` : "/api/assets"
      const method = asset ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          assetName: form.assetName,
          assetCode: form.assetCode,
          assetType: form.assetType,
          categoryId: form.categoryId ? Number(form.categoryId) : null,
          purchaseCost: Number(form.purchaseCost),
          purchaseDate: purchaseDate?.toISOString(),
          salvageValue: Number(form.salvageValue),
          usefulLifeYears: Number(form.usefulLifeYears),
          depreciationRate: Number(form.depreciationRate),
          conditionStatus: form.conditionStatus,
          location: form.location || null,
          description: form.description || null,
          warrantyInfo: form.warrantyInfo || null,
          insuranceInfo: form.insuranceInfo || null,
        })
      })

      if (response.ok) {
        onSaved()
        onClose()
      } else {
        const result = await response.json()
        setErrors([result.error || "Failed to save asset"])
      }
    } catch (error) {
      console.error("Error saving asset:", error)
      setErrors(["Failed to save asset"])
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <ul className="text-sm text-red-600 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="assetName" className="text-sm font-medium">Asset Name *</label>
          <Input
            id="assetName"
            value={form.assetName}
            onChange={(e) => handleChange("assetName", e.target.value)}
            placeholder="e.g., Tractor, Incubator"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="assetCode" className="text-sm font-medium">Asset Code *</label>
          <Input
            id="assetCode"
            value={form.assetCode}
            onChange={(e) => handleChange("assetCode", e.target.value)}
            placeholder="e.g., AST-001"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="assetType" className="text-sm font-medium">Asset Type *</label>
          <select
            id="assetType"
            value={form.assetType}
            onChange={(e) => handleChange("assetType", e.target.value)}
            className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          >
            <option value="">Select asset type</option>
            <option value="INFRASTRUCTURE">Infrastructure</option>
            <option value="EQUIPMENT">Equipment</option>
            <option value="VEHICLES">Vehicles</option>
          </select>
        </div>
        <div className="space-y-2">
          <label htmlFor="categoryId" className="text-sm font-medium">Expense Category</label>
          <select
            id="categoryId"
            value={form.categoryId}
            onChange={(e) => handleChange("categoryId", e.target.value)}
            disabled={categoriesLoading}
            className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-600 disabled:opacity-50"
          >
            <option value="">
              {categoriesLoading ? "Loading categories..." : "Select category (optional)"}
            </option>
            {expenseCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="purchaseCost" className="text-sm font-medium">Purchase Cost (₦) *</label>
          <Input
            id="purchaseCost"
            type="number"
            step="0.01"
            min="0"
            value={form.purchaseCost}
            onChange={(e) => handleChange("purchaseCost", e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="purchaseDate" className="text-sm font-medium">Purchase Date *</label>
          <DatePicker
            value={purchaseDate}
            onChange={setPurchaseDate}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="salvageValue" className="text-sm font-medium">Salvage Value (₦) *</label>
          <Input
            id="salvageValue"
            type="number"
            step="0.01"
            min="0"
            value={form.salvageValue}
            onChange={(e) => handleChange("salvageValue", e.target.value)}
            placeholder="0.00"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="usefulLifeYears" className="text-sm font-medium">Useful Life (Years) *</label>
          <Input
            id="usefulLifeYears"
            type="number"
            min="1"
            value={form.usefulLifeYears}
            onChange={(e) => handleChange("usefulLifeYears", e.target.value)}
            placeholder="5"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="depreciationRate" className="text-sm font-medium">Depreciation Rate (%) *</label>
          <Input
            id="depreciationRate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={form.depreciationRate}
            onChange={(e) => handleChange("depreciationRate", e.target.value)}
            placeholder="20"
            required
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="conditionStatus" className="text-sm font-medium">Condition Status *</label>
          <select
            id="conditionStatus"
            value={form.conditionStatus}
            onChange={(e) => handleChange("conditionStatus", e.target.value)}
            className="w-full rounded border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          >
            <option value="EXCELLENT">Excellent</option>
            <option value="GOOD">Good</option>
            <option value="FAIR">Fair</option>
            <option value="POOR">Poor</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="location" className="text-sm font-medium">Location</label>
        <Input
          id="location"
          value={form.location}
          onChange={(e) => handleChange("location", e.target.value)}
          placeholder="e.g., Farm Section A, Warehouse"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <textarea
          id="description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          className="w-full rounded border border-gray-300 p-2 min-h-[80px] focus:outline-none focus:ring-2 focus:ring-green-600"
          placeholder="Additional details about the asset..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="warrantyInfo" className="text-sm font-medium">Warranty Information</label>
          <textarea
            id="warrantyInfo"
            value={form.warrantyInfo}
            onChange={(e) => handleChange("warrantyInfo", e.target.value)}
            className="w-full rounded border border-gray-300 p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Warranty details..."
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="insuranceInfo" className="text-sm font-medium">Insurance Information</label>
          <textarea
            id="insuranceInfo"
            value={form.insuranceInfo}
            onChange={(e) => handleChange("insuranceInfo", e.target.value)}
            className="w-full rounded border border-gray-300 p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-green-600"
            placeholder="Insurance details..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : asset ? "Update Asset" : "Create Asset"}
        </Button>
      </div>
    </form>
  )
}
