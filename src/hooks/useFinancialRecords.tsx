"use client"

import { useState, useEffect } from "react"
import { isServer } from "@/utils/isServer"

interface FinancialRecordsParams {
  page?: number
  limit?: number
  transactionType?: "INCOME" | "EXPENSE" | "TRANSFER"
  startDate?: string
  endDate?: string
  categoryId?: number
}

export function useFinancialRecords(params?: FinancialRecordsParams) {
  const [records, setRecords] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer()) return
    let isMounted = true

    setLoading(true)

    const query = new URLSearchParams()
    if (params?.page) query.append("page", String(params.page))
    if (params?.limit) query.append("limit", String(params.limit))
    if (params?.transactionType) query.append("transactionType", params.transactionType)
    if (params?.startDate) query.append("startDate", params.startDate)
    if (params?.endDate) query.append("endDate", params.endDate)
    if (params?.categoryId) query.append("categoryId", String(params.categoryId))

    fetch(`/api/financial-records?${query.toString()}`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch financial records")
        return res.json()
      })
      .then((json) => {
        if (isMounted) {
          console.log("Fetched records:", json);
          setRecords(json.data.records || [])
          setTotalPages(json.data.pagination.pages || 1)
        }
      })
      .catch((err) => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))

    return () => {
      isMounted = false
    }
  }, [JSON.stringify(params)]) // ✅ runs when params change

  return { records, totalPages, loading, error }
}


// 📌 Get a single financial record
export function useFinancialRecord(id?: number) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer() || !id) return

    let isMounted = true
    setLoading(true)

    fetch(`/api/financial-records/${id}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch financial record")
        return res.json()
      })
      .then((json) => isMounted && setData(json))
      .catch((err) => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))

    return () => {
      isMounted = false
    }
  }, [id])

  return { data, loading, error }
}

// 📌 Create a financial record
export function useCreateFinancialRecord() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createRecord = async (body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/financial-records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to create record")
      return json
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createRecord, loading, error }
}

// 📌 Update a financial record
export function useUpdateFinancialRecord() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateRecord = async (id: number, body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/financial-records/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to update record")
      return json
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateRecord, loading, error }
}

// 📌 Delete a financial record
export function useDeleteFinancialRecord() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteRecord = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/financial-records/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to delete record")
      return json
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deleteRecord, loading, error }
}
