import { ReactNode } from "react"
import { State, createStore, StoreApi } from "zustand"
import { useStore } from "zustand"

// Example main data store (expand with your schema)
type MainDataState = {
  // Add your main data here, e.g. user, animals, records, etc.
}

const mainDataStore = createStore<MainDataState>(() => ({}))

export function MainDataProvider({ children }: { children: ReactNode }) {
  // You can add context or just rely on Zustand hooks
  return children
}

export { mainDataStore } 