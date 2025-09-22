"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface SignupForm {
  username: string
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export function useSignup() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const signup = async (form: SignupForm) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data?.error?.message || "Signup failed")
        return null
      }

      // redirect to login with success message
      router.push("/login?signup=success")
      return data
    } catch (err: any) {
      console.error("Signup error:", err)
      setError("Something went wrong. Please try again.")
      return null
    } finally {
      setLoading(false)
    }
  }

  return { signup, loading, error }
}
