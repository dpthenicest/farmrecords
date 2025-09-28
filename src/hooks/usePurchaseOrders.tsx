"use client"

import { useState, useEffect, useCallback } from "react"
import { isServer } from "@/utils/isServer"

interface PurchaseOrderFilters {
  page?: number
  limit?: number
  poNumber?: string
  status?: "DRAFT" | "SENT" | "RECEIVED" | "PARTIAL" | "CANCELLED"
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// 📌 Get list of purchase orders
export function usePurchaseOrders(filters?: PurchaseOrderFilters) {
  const [orders, setOrders] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchOrders = useCallback(async () => {
    if (isServer()) return
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams()
      if (filters?.page) query.append("page", String(filters.page))
      if (filters?.limit) query.append("limit", String(filters.limit))
      if (filters?.poNumber) query.append("poNumber", filters.poNumber)
      if (filters?.status) query.append("status", filters.status)
      if (filters?.startDate) query.append("startDate", filters.startDate)
      if (filters?.endDate) query.append("endDate", filters.endDate)
      if (filters?.sortBy) query.append("sortBy", filters.sortBy)
      if (filters?.sortOrder) query.append("sortOrder", filters.sortOrder)

      const res = await fetch(`/api/purchase-orders?${query.toString()}`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch purchase orders")

      const json = await res.json()
      setOrders(json.data || json.data?.orders || [])
      setTotalPages(json.pagination?.pages || 1)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return { orders, totalPages, loading, error, setOrders, refetch: fetchOrders }
}

// 📌 Get single purchase order
export function usePurchaseOrder(id?: number) {
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer() || !id) return
    let active = true
    setLoading(true)

    fetch(`/api/purchase-orders/${id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch purchase order")
        return res.json()
      })
      .then((json) => active && setOrder(json.data))
      .catch((err) => active && setError(err))
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [id])

  return { order, loading, error, setOrder }
}

// 📌 Create purchase order
export function useCreatePurchaseOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createOrder = async (body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to create purchase order")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createOrder, loading, error }
}

// 📌 Update purchase order
export function useUpdatePurchaseOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateOrder = async (id: number, body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to update purchase order")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateOrder, loading, error }
}

// 📌 Delete purchase order
export function useDeletePurchaseOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteOrder = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/purchase-orders/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to delete purchase order")
      return json
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deleteOrder, loading, error }
}

// 📌 Send purchase order
export function useSendPurchaseOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const sendOrder = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/purchase-orders/${id}/send`, {
        method: "POST",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to send purchase order")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { sendOrder, loading, error }
}

// 📌 Receive purchase order
export function useReceivePurchaseOrder() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const receiveOrder = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/purchase-orders/${id}/receive`, {
        method: "POST",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to receive purchase order")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { receiveOrder, loading, error }
}
