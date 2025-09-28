"use client"

import { useState, useEffect, useCallback } from "react"
import { isServer } from "@/utils/isServer"

interface CategoryFilters {
  page?: number
  limit?: number
  type?: "SALES" | "EXPENSE"
  isActive?: boolean
  startDate?: string
  endDate?: string
}

export function useSalesExpenseCategories(filters?: CategoryFilters) {
  const [categories, setCategories] = useState<any[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchCategories = useCallback(async () => {
    if (isServer()) return
    setLoading(true)
    setError(null)

    try {
      const query = new URLSearchParams()
      if (filters?.page) query.append("page", String(filters.page))
      if (filters?.limit) query.append("limit", String(filters.limit))
      if (filters?.type) query.append("type", filters.type)
      if (filters?.isActive !== undefined) query.append("isActive", String(filters.isActive))
      if (filters?.startDate) query.append("startDate", filters.startDate)
      if (filters?.endDate) query.append("endDate", filters.endDate)

      const res = await fetch(`/api/categories?${query.toString()}`, {
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to fetch categories")

      const json = await res.json()
      setCategories(json.data || json.data?.categories || [])
      setTotalPages(json.pagination?.pages || 1)
    } catch (err: any) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [JSON.stringify(filters)])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return { categories, totalPages, loading, error, setCategories, refetch: fetchCategories }
}

// 📌 Get a single category
export function useSalesExpenseCategory(id?: number) {
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(!!id)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer() || !id) return
    let isMounted = true
    setLoading(true)

    fetch(`/api/categories/${id}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch category")
        return res.json()
      })
      .then(json => isMounted && setCategory(json.data))
      .catch(err => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))

    return () => { isMounted = false }
  }, [id])

  return { category, loading, error, setCategory }
}

// 📌 Create category
export function useCreateSalesExpenseCategory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const createCategory = async (body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to create category")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { createCategory, loading, error }
}

// 📌 Update category
export function useUpdateSalesExpenseCategory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const updateCategory = async (id: number, body: any) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to update category")
      return json.data
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { updateCategory, loading, error }
}

// 📌 Delete category
export function useDeleteSalesExpenseCategory() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const deleteCategory = async (id: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to delete category")
      return json
    } catch (err: any) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { deleteCategory, loading, error }
}
