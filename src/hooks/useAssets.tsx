"use client"

import { useState, useEffect, useCallback } from "react"
import { isServer } from "@/utils/isServer"

interface AssetFilters {
  page?: number
  limit?: number
  assetType?: string // INFRASTRUCTURE, EQUIPMENT, VEHICLES
  conditionStatus?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// 📌 Get all assets
export function useAssets(filters?: AssetFilters) {
  const [assets, setAssets] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAssets = useCallback(async () => {
    if (isServer()) return
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams()
      if (filters?.page) query.append("page", String(filters.page))
      if (filters?.limit) query.append("limit", String(filters.limit))
      if (filters?.assetType) query.append("assetType", filters.assetType)
      if (filters?.conditionStatus) query.append("conditionStatus", filters.conditionStatus)
      if (filters?.startDate) query.append("startDate", filters.startDate)
      if (filters?.endDate) query.append("endDate", filters.endDate)
      if (filters?.sortBy) query.append("sortBy", filters.sortBy)
      if (filters?.sortOrder) query.append("sortOrder", filters.sortOrder)

      const res = await fetch(`/api/assets?${query.toString()}`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch assets")

      const json = await res.json()
      setAssets(json.data || json.data.assets || [])
      setTotalPages(json.pagination?.pages || 1)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchAssets()
  }, [fetchAssets])

  return { assets, totalPages, loading, error, setAssets, refetch: fetchAssets }
}

// 📌 Get single asset
export function useAsset(id?: number) {
  const [asset, setAsset] = useState<any>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer() || !id) return
    let isMounted = true
    setLoading(true)

    fetch(`/api/assets/${id}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch asset")
        return res.json()
      })
      .then(json => isMounted && setAsset(json.data))
      .catch(err => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))

    return () => { isMounted = false }
  }, [id])

  return { asset, loading, error, setAsset }
}

// 📌 Create asset
export function useCreateAsset() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createAsset = async (body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/assets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to create asset")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createAsset, loading, error }
}

// 📌 Update asset
export function useUpdateAsset() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateAsset = async (id: number, body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/assets/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to update asset")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateAsset, loading, error }
}

// 📌 Delete asset
export function useDeleteAsset() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteAsset = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/assets/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to delete asset")
      return json
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deleteAsset, loading, error }
}

// 📌 Asset depreciation
export function useAssetDepreciation(id?: number) {
  const [depreciation, setDepreciation] = useState<any>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer() || !id) return
    let isMounted = true
    setLoading(true)

    fetch(`/api/assets/${id}/depreciation`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch depreciation")
        return res.json()
      })
      .then(json => isMounted && setDepreciation(json.data))
      .catch(err => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))

    return () => { isMounted = false }
  }, [id])

  return { depreciation, loading, error }
}
