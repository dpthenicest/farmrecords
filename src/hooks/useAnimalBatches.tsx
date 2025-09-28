"use client"

import { useState, useEffect, useCallback } from "react"
import { isServer } from "@/utils/isServer"

interface AnimalBatchFilters {
  page?: number
  limit?: number
  species?: string
  breed?: string
  batchStatus?: string
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// 📌 Get all batches with filters + pagination
export function useAnimalBatches(filters?: AnimalBatchFilters) {
  const [batches, setBatches] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchBatches = useCallback(async () => {
    if (isServer()) return
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams()
      if (filters?.page) query.append("page", String(filters.page))
      if (filters?.limit) query.append("limit", String(filters.limit))
      if (filters?.species) query.append("species", filters.species)
      if (filters?.breed) query.append("breed", filters.breed)
      if (filters?.batchStatus) query.append("batchStatus", filters.batchStatus)
      if (filters?.startDate) query.append("startDate", filters.startDate)
      if (filters?.endDate) query.append("endDate", filters.endDate)
      if (filters?.sortBy) query.append("sortBy", filters.sortBy)
      if (filters?.sortOrder) query.append("sortOrder", filters.sortOrder)

      const res = await fetch(`/api/animal-batches?${query.toString()}`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch animal batches")

      const json = await res.json()
      setBatches(json.data || json.data?.batches || [])
      setTotalPages(json.pagination?.pages || 1)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchBatches()
  }, [fetchBatches])

  return { batches, totalPages, loading, error, setBatches, refetch: fetchBatches }
}

// 📌 Get single batch
export function useAnimalBatch(id?: number) {
  const [batch, setBatch] = useState<any>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer() || !id) return
    let isMounted = true
    setLoading(true)

    fetch(`/api/animal-batches/${id}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch animal batch")
        return res.json()
      })
      .then(json => isMounted && setBatch(json.data || json))
      .catch(err => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))

    return () => { isMounted = false }
  }, [id])

  return { batch, loading, error, setBatch }
}

// 📌 Create batch
export function useCreateAnimalBatch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createBatch = async (body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/animal-batches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to create batch")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createBatch, loading, error }
}

// 📌 Update batch
export function useUpdateAnimalBatch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateBatch = async (id: number, body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/animal-batches/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to update batch")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateBatch, loading, error }
}

// 📌 Delete batch
export function useDeleteAnimalBatch() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteBatch = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/animal-batches/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to delete batch")
      return json
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deleteBatch, loading, error }
}

// 📌 Get batch performance
export function useBatchPerformance(id?: number) {
  const [performance, setPerformance] = useState<any>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer() || !id) return
    let isMounted = true
    setLoading(true)

    fetch(`/api/animal-batches/${id}/performance`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch batch performance")
        return res.json()
      })
      .then(json => isMounted && setPerformance(json.data || json))
      .catch(err => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))

    return () => { isMounted = false }
  }, [id])

  return { performance, loading, error }
}
