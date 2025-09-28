"use client"

import { useState, useEffect, useCallback } from "react"
import { isServer } from "@/utils/isServer"

// --------------------
// 📌 Suppliers List
// --------------------
interface SupplierFilters {
  page?: number
  limit?: number
  supplierName?: string
  supplierCode?: string
  supplierType?: string
  startDate?: string
  endDate?: string
}

export function useSuppliers(filters?: SupplierFilters) {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchSuppliers = useCallback(async () => {
    if (isServer()) return
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams()
      if (filters?.page) query.append("page", String(filters.page))
      if (filters?.limit) query.append("limit", String(filters.limit))
      if (filters?.supplierName) query.append("supplierName", filters.supplierName)
      if (filters?.supplierCode) query.append("supplierCode", filters.supplierCode)
      if (filters?.supplierType) query.append("supplierType", filters.supplierType)
      if (filters?.startDate) query.append("startDate", filters.startDate)
      if (filters?.endDate) query.append("endDate", filters.endDate)

      const res = await fetch(`/api/suppliers?${query.toString()}`, { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch suppliers")
      const json = await res.json()
      setSuppliers(json.data || json.data?.suppliers || [])
      setTotalPages(json.pagination?.pages || 1)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  return { suppliers, totalPages, loading, error, setSuppliers, refetch: fetchSuppliers }
}

// --------------------
// 📌 Single Supplier
// --------------------
export function useSupplier(id?: number) {
  const [supplier, setSupplier] = useState<any>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer() || !id) return
    let isMounted = true
    setLoading(true)

    fetch(`/api/suppliers/${id}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch supplier")
        return res.json()
      })
      .then(json => isMounted && setSupplier(json.data))
      .catch(err => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))

    return () => { isMounted = false }
  }, [id])

  return { supplier, loading, error, setSupplier }
}

// --------------------
// 📌 Create Supplier
// --------------------
export function useCreateSupplier() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createSupplier = async (body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/suppliers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to create supplier")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createSupplier, loading, error }
}

// --------------------
// 📌 Update Supplier
// --------------------
export function useUpdateSupplier() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateSupplier = async (id: number, body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to update supplier")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateSupplier, loading, error }
}

// --------------------
// 📌 Delete Supplier
// --------------------
export function useDeleteSupplier() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteSupplier = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to delete supplier")
      return json
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deleteSupplier, loading, error }
}

// --------------------
// 📌 Supplier Purchase Orders
// --------------------
export function useSupplierPurchaseOrders(id?: number, page: number = 1, limit: number = 20) {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  const fetchOrders = useCallback(async () => {
    if (!id || isServer()) return
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) })
      const res = await fetch(`/api/suppliers/${id}/purchase-orders?${query.toString()}`, { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch purchase orders")
      const json = await res.json()
      setOrders(json.data?.orders || [])
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id, page, limit])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  return { orders, loading, error, setOrders, refetch: fetchOrders }
}

// --------------------
// 📌 Supplier Payment History
// --------------------
export function useSupplierPayments(id?: number, page: number = 1, limit: number = 20) {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  const fetchPayments = useCallback(async () => {
    if (!id || isServer()) return
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) })
      const res = await fetch(`/api/suppliers/${id}/payment-history?${query.toString()}`, { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch payments")
      const json = await res.json()
      setPayments(json.data || [])
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id, page, limit])

  useEffect(() => { fetchPayments() }, [fetchPayments])

  return { payments, loading, error, setPayments, refetch: fetchPayments }
}
