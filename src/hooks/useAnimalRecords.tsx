"use client"

import { useState, useEffect, useCallback } from "react"
import { isServer } from "@/utils/isServer"

interface AnimalRecordFilters {
  page?: number
  limit?: number
  recordType?: string
  batchId?: number
  animalId?: number
  startDate?: string
  endDate?: string
  healthStatus?: string
}

// 📌 Fetch multiple animal records
export function useAnimalRecords(filters?: AnimalRecordFilters) {
  const [records, setRecords] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRecords = useCallback(async () => {
    if (isServer()) return
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams()
      if (filters?.page) query.append("page", String(filters.page))
      if (filters?.limit) query.append("limit", String(filters.limit))
      if (filters?.recordType) query.append("recordType", filters.recordType)
      if (filters?.batchId) query.append("batchId", String(filters.batchId))
      if (filters?.animalId) query.append("animalId", String(filters.animalId))
      if (filters?.startDate) query.append("startDate", filters.startDate)
      if (filters?.endDate) query.append("endDate", filters.endDate)
      if (filters?.healthStatus) query.append("healthStatus", filters.healthStatus)

      const res = await fetch(`/api/animal-records?${query.toString()}`, { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch animal records")

      const json = await res.json()
      setRecords(json.data || [])
      setTotalPages(json.pagination?.pages || 1)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  return { records, totalPages, loading, error, setRecords, refetch: fetchRecords }
}

// 📌 Fetch single animal record
export function useAnimalRecord(id?: number) {
  const [record, setRecord] = useState<any>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer() || !id) return
    let mounted = true
    setLoading(true)

    fetch(`/api/animal-records/${id}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch animal record")
        return res.json()
      })
      .then(json => mounted && setRecord(json.data))
      .catch(err => mounted && setError(err))
      .finally(() => mounted && setLoading(false))

    return () => { mounted = false }
  }, [id])

  return { record, loading, error, setRecord }
}

// 📌 Create a new animal record
export function useCreateAnimalRecord() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createRecord = async (body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/animal-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to create animal record")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createRecord, loading, error }
}

// 📌 Update an animal record
export function useUpdateAnimalRecord() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateRecord = async (id: number, body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/animal-records/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to update animal record")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateRecord, loading, error }
}

// 📌 Delete an animal record
export function useDeleteAnimalRecord() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteRecord = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/animal-records/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to delete animal record")
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
