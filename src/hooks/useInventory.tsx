"use client"

import { useState, useEffect, useCallback } from "react"
import { isServer } from "@/utils/isServer"

// 🔹 Filters for fetching inventory items
interface InventoryFilters {
  page?: number
  limit?: number
  category?: string
  lowStock?: boolean
  search?: string
}

// 📌 Get all inventory items
export function useInventory(filters?: InventoryFilters) {
  const [items, setItems] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchInventory = useCallback(async () => {
    if (isServer()) return
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams()
      if (filters?.page) query.append("page", String(filters.page))
      if (filters?.limit) query.append("limit", String(filters.limit))
      if (filters?.category) query.append("category", filters.category)
      if (filters?.lowStock) query.append("lowStock", "true")
      if (filters?.search) query.append("search", filters.search)

      const res = await fetch(`/api/inventory?${query.toString()}`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch inventory")

      const json = await res.json()
      setItems(json.data?.items || json.data || [])
      setTotalPages(json.data?.pagination?.pages || 1)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchInventory()
  }, [fetchInventory])

  return { items, totalPages, loading, error, setItems, refetch: fetchInventory }
}

// 📌 Get a single inventory item
export function useInventoryItem(id?: number) {
  const [item, setItem] = useState<any>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer() || !id) return
    setLoading(true)

    fetch(`/api/inventory/${id}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch inventory item")
        return res.json()
      })
      .then(json => setItem(json.data))
      .catch(err => setError(err))
      .finally(() => setLoading(false))
  }, [id])

  return { item, loading, error, setItem }
}

// 📌 Create an inventory item
export function useCreateInventory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createItem = async (body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to create inventory item")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createItem, loading, error }
}

// 📌 Update an inventory item
export function useUpdateInventory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateItem = async (id: number, body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to update inventory item")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateItem, loading, error }
}

// 📌 Delete an inventory item
export function useDeleteInventory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteItem = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/inventory/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to delete inventory item")
      return json
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deleteItem, loading, error }
}

// 📌 Adjust quantity of an inventory item
export function useAdjustInventoryQuantity() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const adjustQuantity = async (
    id: number,
    quantity: number,
    movementType: "IN" | "OUT",
    notes?: string
  ) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/inventory/${id}/adjust-quantity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ quantity, movementType, notes }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to adjust quantity")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { adjustQuantity, loading, error }
}
