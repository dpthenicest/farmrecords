"use client"

import { useState, useEffect, useCallback } from "react"
import { isServer } from "@/utils/isServer"

interface AnimalFilters {
  page?: number
  limit?: number
  species?: string
  breed?: string
  gender?: string
  healthStatus?: string
  isActive?: boolean
  startDate?: string
  endDate?: string
}

// 📌 Fetch animals list
export function useAnimals(filters?: AnimalFilters) {
  const [animals, setAnimals] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAnimals = useCallback(async () => {
    if (isServer()) return
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams()
      if (filters?.page) query.append("page", String(filters.page))
      if (filters?.limit) query.append("limit", String(filters.limit))
      if (filters?.species) query.append("species", filters.species)
      if (filters?.breed) query.append("breed", filters.breed)
      if (filters?.gender) query.append("gender", filters.gender)
      if (filters?.healthStatus) query.append("healthStatus", filters.healthStatus)
      if (filters?.isActive !== undefined) query.append("isActive", String(filters.isActive))
      if (filters?.startDate) query.append("startDate", filters.startDate)
      if (filters?.endDate) query.append("endDate", filters.endDate)

      const res = await fetch(`/api/animals?${query.toString()}`, { credentials: "include" })
      if (!res.ok) throw new Error("Failed to fetch animals")

      const json = await res.json()
      setAnimals(json.data || json.data?.animals || [])
      setTotalPages(json.pagination?.pages || 1)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchAnimals()
  }, [fetchAnimals])

  return { animals, totalPages, loading, error, setAnimals, refetch: fetchAnimals }
}

// 📌 Fetch single animal
export function useAnimal(id?: number) {
  const [animal, setAnimal] = useState<any>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer() || !id) return
    let mounted = true
    setLoading(true)

    fetch(`/api/animals/${id}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch animal")
        return res.json()
      })
      .then(json => mounted && setAnimal(json.data))
      .catch(err => mounted && setError(err))
      .finally(() => mounted && setLoading(false))

    return () => { mounted = false }
  }, [id])

  return { animal, loading, error, setAnimal }
}

// 📌 Fetch animals by batch
export function useAnimalsByBatch(batchId?: number) {
  const [animals, setAnimals] = useState<any[]>([])
  const [loading, setLoading] = useState(!!batchId)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer() || !batchId) return
    let mounted = true
    setLoading(true)

    fetch(`/api/animals/by-batch/${batchId}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch animals by batch")
        return res.json()
      })
      .then(json => mounted && setAnimals(json.data || []))
      .catch(err => mounted && setError(err))
      .finally(() => mounted && setLoading(false))

    return () => { mounted = false }
  }, [batchId])

  return { animals, loading, error, setAnimals }
}

// 📌 Create an animal
export function useCreateAnimal() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createAnimal = async (body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/animals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to create animal")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createAnimal, loading, error }
}

// 📌 Update an animal
export function useUpdateAnimal() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateAnimal = async (id: number, body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/animals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to update animal")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateAnimal, loading, error }
}

// 📌 Delete an animal
export function useDeleteAnimal() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteAnimal = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/animals/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to delete animal")
      return json
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deleteAnimal, loading, error }
}
