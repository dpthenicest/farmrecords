"use client"

import { useState, useEffect, useCallback } from "react"
import { isServer } from "@/utils/isServer"

interface CustomerFilters {
  page?: number
  limit?: number
  customerName?: string
  customerCode?: string
  customerType?: string
  startDate?: string
  endDate?: string
}

// 📌 Fetch multiple customers
export function useCustomers(filters?: CustomerFilters) {
  const [customers, setCustomers] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCustomers = useCallback(async () => {
    if (isServer()) return
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams()
      if (filters?.page) query.append("page", String(filters.page))
      if (filters?.limit) query.append("limit", String(filters.limit))
      if (filters?.customerName) query.append("customerName", filters.customerName)
      if (filters?.customerCode) query.append("customerCode", filters.customerCode)
      if (filters?.customerType) query.append("customerType", filters.customerType)
      if (filters?.startDate) query.append("startDate", filters.startDate)
      if (filters?.endDate) query.append("endDate", filters.endDate)

      const res = await fetch(`/api/customers?${query.toString()}`, { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch customers")
      const json = await res.json()
      setCustomers(json.data?.customers || json.data || [])
      setTotalPages(json.pagination?.pages || 1)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  return { customers, totalPages, loading, error, setCustomers, refetch: fetchCustomers }
}

// 📌 Fetch a single customer
export function useCustomer(id?: number) {
  const [customer, setCustomer] = useState<any>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer() || !id) return
    let isMounted = true
    setLoading(true)

    fetch(`/api/customers/${id}`, { credentials: "include" })
      .then(res => { if (!res.ok) throw new Error("Failed to fetch customer"); return res.json() })
      .then(json => isMounted && setCustomer(json.data))
      .catch(err => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))

    return () => { isMounted = false }
  }, [id])

  return { customer, loading, error, setCustomer }
}

// 📌 Create a customer
export function useCreateCustomer() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createCustomer = async (body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to create customer")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createCustomer, loading, error }
}

// 📌 Update a customer
export function useUpdateCustomer() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateCustomer = async (id: number, body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to update customer")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateCustomer, loading, error }
}

// 📌 Delete a customer
export function useDeleteCustomer() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteCustomer = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/customers/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to delete customer")
      return json
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deleteCustomer, loading, error }
}

// 📌 Customer payment history with refetch
export function useCustomerPayments(id?: number, page: number = 1, limit: number = 20) {
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  const fetchPayments = useCallback(async () => {
    if (!id || isServer()) return
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) })
      const res = await fetch(`/api/customers/${id}/payment-history?${query.toString()}`, { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch payments")
      const json = await res.json()
      setPayments(json.data || [])
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id, page, limit])

  useEffect(() => {
    fetchPayments()
  }, [fetchPayments])

  return { payments, loading, error, setPayments, refetch: fetchPayments }
}

// 📌 Customer invoices with refetch
export function useCustomerInvoices(id?: number, page: number = 1, limit: number = 20) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  const fetchInvoices = useCallback(async () => {
    if (!id || isServer()) return
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams({ page: String(page), limit: String(limit) })
      const res = await fetch(`/api/customers/${id}/invoices?${query.toString()}`, { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch customer invoices")
      const json = await res.json()
      setInvoices(json.data?.invoices || [])
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id, page, limit])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  return { invoices, loading, error, setInvoices, refetch: fetchInvoices }
}
