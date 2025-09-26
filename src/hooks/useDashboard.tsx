"use client"

import { useEffect, useState } from "react"
import { isServer } from "@/utils/isServer"

// Dashboard Overview
export function useDashboardOverview() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer()) return // ✅ skip on server

    let isMounted = true
    setLoading(true)

    fetch("/api/dashboard/overview", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch dashboard overview")
        return res.json()
      })
      .then((json) => isMounted && setData(json))
      .catch((err) => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))

    return () => {
      isMounted = false
    }
  }, [])

  return { data, loading, error }
}

// Recent Transactions
export function useRecentTransactions(limit = 5) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer()) return // ✅ skip on server

    let isMounted = true
    setLoading(true)

    fetch(`/api/financial-records?limit=${limit}&orderBy=date DESC`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch recent transactions")
        return res.json()
      })
      .then((json) => isMounted && setData(json))
      .catch((err) => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))

    return () => {
      isMounted = false
    }
  }, [limit])

  return { data, loading, error }
}

// Low Stock Alerts
export function useLowStockAlerts() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer()) return

    let isMounted = true
    setLoading(true)

    fetch("/api/inventory/low-stock", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch low stock alerts")
        return res.json()
      })
      .then((json) => isMounted && setData(json))
      .catch((err) => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))

    return () => {
      isMounted = false
    }
  }, [])

  return { data, loading, error }
}

// Pending Tasks
export function usePendingTasks() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer()) return

    let isMounted = true
    setLoading(true)

    fetch("/api/tasks?status=PENDING&assignedTo=current_user&limit=5", {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch tasks")
        return res.json()
      })
      .then((json) => isMounted && setData(json))
      .catch((err) => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))

    return () => {
      isMounted = false
    }
  }, [])

  return { data, loading, error }
}

// Dashboard Alerts
export function useDashboardAlerts() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (isServer()) return

    let isMounted = true
    setLoading(true)

    fetch("/api/dashboard/alerts", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch alerts")
        return res.json()
      })
      .then((json) => isMounted && setData(json))
      .catch((err) => isMounted && setError(err))
      .finally(() => isMounted && setLoading(false))

    return () => {
      isMounted = false
    }
  }, [])

  return { data, loading, error }
}
