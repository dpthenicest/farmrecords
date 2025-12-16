"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { DatePicker } from "@/components/ui/date-picker"

interface AssetFormProps {
  asset?: any
  onClose: () => void
  onSaved: () => void
}

interface Category {
  id: number
  categoryName: string
}

export function AssetForm({ asset, onClose, onSaved }: AssetFormProps) {
  const [form, setForm] = useState({
    assetName: asset?.assetName || "",
    assetCode: asset?.assetCode || "",
    assetType: asset?.assetType || "",
    categoryId: asset?.categoryId?.toString() || "",
    purchaseCost: asset?.purchaseCost?.toString() || "",
    purchaseDate: asset?.purchaseDate ? new Date(asset.purchaseDate) : new Date(),
    salvageValue: asset?.salvageValue?.toString() || "",
    usefulLifeYears: asset?.usefulLifeYears?.toString() || "",
    depreciationRate: asset?.depreciationRate?.toString() || "",
    conditionStatus: asset?.conditionStatus || "GOOD",
    location: asset?.location || "",
    description: asset?.description || "",
    warrantyInfo: asset?.warrantyInfo || "",
    insuranceInfo: asset?.insuranceInfo || "",
  })
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    // Fetch categories for the dropdown
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories", {
          credentials: "include"
        })
        if (response.ok) {
          const result = await response.json()
          setCategories(result.data || [])
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }

    fetchCategories()
  }, [])

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
          purchaseDate: form.purchaseDate.toISOString(),
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

  const assetTypes = [
    { value: "INFRASTRUCTURE", label: "Infrastructure" },
    { value: "EQUIPMENT", label: "Equipment" },
    { value: "VEHICLES", label: "Vehicles" }
  ]

  const conditionOptions = [
    { value: "EXCELLENT", label: "Excellent" },
    { value: "GOOD", label: "Good" },
    { value: "FAIR", label: "Fair" },
    { value: "POOR", label: "Poor" },
    { value: "CRITICAL", label: "Critical" }
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[80vh] overflow-y-auto">
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
        <div>
          <Label htmlFor="assetName">Asset Name *</Label>
          <Input
            id="assetName"
            value={form.assetName}
            onChange={(e) => handleChange("assetName", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="assetCode">Asset Code *</Label>
          <Input
            id="assetCode"
            value={form.assetCode}
            onChange={(e) => handleChange("assetCode", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="assetType">Asset Type *</Label>
          <Select
            value={form.assetType}
            onValueChange={(value) => handleChange("assetType", value)}
            required
          >
            <option value="">Select asset type</option>
            {assetTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="categoryId">Category</Label>
          <Select
            value={form.categoryId}
            onValueChange={(value) => handleChange("categoryId", value)}
          >
            <option value="">Select category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.categoryName}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="purchaseCost">Purchase Cost *</Label>
          <Input
            id="purchaseCost"
            type="number"
            step="0.01"
            min="0"
            value={form.purchaseCost}
            onChange={(e) => handleChange("purchaseCost", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="purchaseDate">Purchase Date *</Label>
          <DatePicker
            date={form.purchaseDate}
            onDateChange={(date) => handleChange("purchaseDate", date)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="salvageValue">Salvage Value *</Label>
          <Input
            id="salvageValue"
            type="number"
            step="0.01"
            min="0"
            value={form.salvageValue}
            onChange={(e) => handleChange("salvageValue", e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="usefulLifeYears">Useful Life (Years) *</Label>
          <Input
            id="usefulLifeYears"
            type="number"
            min="1"
            value={form.usefulLifeYears}
            onChange={(e) => handleChange("usefulLifeYears", e.target.value)}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="depreciationRate">Depreciation Rate (%)</Label>
          <Input
            id="depreciationRate"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={form.depreciationRate}
            onChange={(e) => handleChange("depreciationRate", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="conditionStatus">Condition Status</Label>
          <Select
            value={form.conditionStatus}
            onValueChange={(value) => handleChange("conditionStatus", value)}
          >
            {conditionOptions.map((condition) => (
              <option key={condition.value} value={condition.value}>
                {condition.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={form.location}
          onChange={(e) => handleChange("location", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="warrantyInfo">Warranty Information</Label>
          <Textarea
            id="warrantyInfo"
            value={form.warrantyInfo}
            onChange={(e) => handleChange("warrantyInfo", e.target.value)}
            rows={2}
          />
        </div>
        <div>
          <Label htmlFor="insuranceInfo">Insurance Information</Label>
          <Textarea
            id="insuranceInfo"
            value={form.insuranceInfo}
            onChange={(e) => handleChange("insuranceInfo", e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : "Save Asset"}
        </Button>
      </div>
    </form>
  )
}
