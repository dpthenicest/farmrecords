"use client"

import { useState, useEffect, useCallback } from "react"
import { isServer } from "@/utils/isServer"

interface InvoiceFilters {
  page?: number
  limit?: number
  status?: "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED"
  customerId?: number
  startDate?: string
  endDate?: string
}

export function useInvoices(filters?: InvoiceFilters) {
  const [invoices, setInvoices] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchInvoices = useCallback(async () => {
    if (isServer()) return
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams()
      if (filters?.page) query.append("page", String(filters.page))
      if (filters?.limit) query.append("limit", String(filters.limit))
      if (filters?.status) query.append("status", filters.status)
      if (filters?.customerId) query.append("customerId", String(filters.customerId))
      if (filters?.startDate) query.append("startDate", filters.startDate)
      if (filters?.endDate) query.append("endDate", filters.endDate)

      const res = await fetch(`/api/invoices?${query.toString()}`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch invoices")

      const json = await res.json()
      setInvoices(json.data || json.data?.invoices || [])
      setTotalPages(json.pagination?.pages || 1)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)]) // dependency on filters

  useEffect(() => {
    let isMounted = true
    fetchInvoices()
    return () => {
      isMounted = false
    }
  }, [fetchInvoices])

  return { invoices, totalPages, loading, error, setInvoices, refetch: fetchInvoices }
}

// 📌 Get a single invoice
export function useInvoice(id?: number) {
  const [invoice, setInvoice] = useState<any>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer() || !id) return
    let isMounted = true
    setLoading(true)

    fetch(`/api/invoices/${id}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch invoice")
        return res.json()
      })
      .then(json => isMounted && setInvoice(json.data))
      .catch(err => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))

    return () => { isMounted = false }
  }, [id])

  return { invoice, loading, error, setInvoice }
}

// 📌 Create an invoice
export function useCreateInvoice() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createInvoice = async (body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to create invoice")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createInvoice, loading, error }
}

// 📌 Update an invoice
export function useUpdateInvoice() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateInvoice = async (id: number, body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to update invoice")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateInvoice, loading, error }
}

// 📌 Delete an invoice
export function useDeleteInvoice() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteInvoice = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to delete invoice")
      return json
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deleteInvoice, loading, error }
}

// 📌 Send an invoice
export function useSendInvoice() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const sendInvoice = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/invoices/${id}/send`, {
        method: "POST",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to send invoice")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { sendInvoice, loading, error }
}

// 📌 Mark an invoice as paid
export function useMarkInvoicePaid() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const markPaid = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/invoices/${id}/mark-paid`, {
        method: "POST",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to mark invoice as paid")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { markPaid, loading, error }
}
