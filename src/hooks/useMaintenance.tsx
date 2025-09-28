"use client"

import { useState, useEffect, useCallback } from "react"
import { isServer } from "@/utils/isServer"

// --------------------
// Types
// --------------------
interface MaintenanceFilters {
  page?: number
  limit?: number
  status?: "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  maintenanceType?: "MAINTENANCE" | "REPAIR" | "CLEANING" | "INSPECTION"
  startDate?: string
  endDate?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

// --------------------
// Fetch all maintenance
// --------------------
export function useMaintenance(filters?: MaintenanceFilters) {
  const [maintenance, setMaintenance] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchMaintenance = useCallback(async () => {
    if (isServer()) return
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams()
      if (filters?.page) query.append("page", String(filters.page))
      if (filters?.limit) query.append("limit", String(filters.limit))
      if (filters?.status) query.append("status", filters.status)
      if (filters?.maintenanceType) query.append("maintenanceType", filters.maintenanceType)
      if (filters?.startDate) query.append("startDate", filters.startDate)
      if (filters?.endDate) query.append("endDate", filters.endDate)
      if (filters?.sortBy) query.append("sortBy", filters.sortBy)
      if (filters?.sortOrder) query.append("sortOrder", filters.sortOrder)

      const res = await fetch(`/api/maintenance?${query.toString()}`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch maintenance records")

      const json = await res.json()
      setMaintenance(json.data || json.data?.records || [])
      setTotalPages(json.pagination?.pages || 1)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchMaintenance()
  }, [fetchMaintenance])

  return { maintenance, totalPages, loading, error, setMaintenance, refetch: fetchMaintenance }
}

// --------------------
// Fetch a single maintenance record
// --------------------
export function useMaintenanceRecord(id?: number) {
  const [record, setRecord] = useState<any>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer() || !id) return
    let isMounted = true
    setLoading(true)

    fetch(`/api/maintenance/${id}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch maintenance record")
        return res.json()
      })
      .then(json => isMounted && setRecord(json.data))
      .catch(err => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))

    return () => {
      isMounted = false
    }
  }, [id])

  return { record, loading, error, setRecord }
}

// --------------------
// Create maintenance
// --------------------
export function useCreateMaintenance() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createMaintenance = async (body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to create maintenance record")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createMaintenance, loading, error }
}

// --------------------
// Update maintenance
// --------------------
export function useUpdateMaintenance() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateMaintenance = async (id: number, body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/maintenance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to update maintenance record")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateMaintenance, loading, error }
}

// --------------------
// Delete maintenance
// --------------------
export function useDeleteMaintenance() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteMaintenance = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/maintenance/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to delete maintenance record")
      return json
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deleteMaintenance, loading, error }
}

// --------------------
// Complete maintenance
// --------------------
export function useCompleteMaintenance() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const complete = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/maintenance/${id}/complete`, {
        method: "POST",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to complete maintenance")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { complete, loading, error }
}

// --------------------
// Schedule maintenance
// --------------------
export function useScheduleMaintenance() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const schedule = async (id: number, body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/maintenance/${id}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to schedule maintenance")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { schedule, loading, error }
}