import { createContext, useContext, useState, ReactNode } from "react"

interface UIContextProps {
  // Example: modal state, theme, etc.
  modalOpen: boolean
  setModalOpen: (open: boolean) => void
}

const UIContext = createContext<UIContextProps | undefined>(undefined)

export function UIProvider({ children }: { children: ReactNode }) {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <UIContext.Provider value={{ modalOpen, setModalOpen }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)
  if (!context) throw new Error("useUI must be used within a UIProvider")
  return context
} 