'use client'

import { createContext, useContext, useState, ReactNode } from "react"

interface UIContextProps {
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const UIContext = createContext<UIContextProps | undefined>(undefined)

export function UIProvider({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  return (
    <UIContext.Provider value={{ modalOpen, setModalOpen, theme, setTheme, sidebarOpen, setSidebarOpen }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)
  if (!context) throw new Error("useUI must be used within a UIProvider")
  return context
} 