import { ReactNode } from "react"
import { create } from "zustand"

// --- Types based on schema.prisma ---
export type CategoryType = "INCOME" | "EXPENSE"

export interface Category {
  id: string
  name: string
  type: CategoryType
  description?: string | null
  color?: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface AnimalType {
  id: string
  type: string
}

export interface Animal {
  id: string
  name: string
  animalTypeId: string
  description?: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Record {
  id: string
  type: CategoryType
  categoryId: string
  unitPrice: string
  quantity: number
  note?: string | null
  date: string
  animalId?: string | null
  userId: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name?: string | null
  createdAt: string
  updatedAt: string
}

// --- Zustand Store ---
interface MainDataState {
  animals: Animal[]
  animalTypes: AnimalType[]
  records: Record[]
  categories: Category[]
  user: User | null
  // Loading/error states
  loading: boolean
  error: string | null
  // Actions
  fetchAnimals: () => Promise<void>
  fetchAnimalTypes: () => Promise<void>
  fetchRecords: () => Promise<void>
  fetchCategories: () => Promise<void>
  fetchUser: () => Promise<void>
  // Add, update, delete actions (placeholders)
  addAnimal: (animal: Partial<Animal>) => Promise<void>
  updateAnimal: (id: string, animal: Partial<Animal>) => Promise<void>
  deleteAnimal: (id: string) => Promise<void>
  // Repeat for other entities as needed
}

export const useMainData = create<MainDataState>((set, get) => ({
  animals: [],
  animalTypes: [],
  records: [],
  categories: [],
  user: null,
  loading: false,
  error: null,
  // --- Fetch actions (implement API calls here) ---
  fetchAnimals: async () => {
    set({ loading: true, error: null })
    try {
      // TODO: Replace with real API call
      set({ animals: [], loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  fetchAnimalTypes: async () => {
    set({ loading: true, error: null })
    try {
      set({ animalTypes: [], loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  fetchRecords: async () => {
    set({ loading: true, error: null })
    try {
      set({ records: [], loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  fetchCategories: async () => {
    set({ loading: true, error: null })
    try {
      set({ categories: [], loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  fetchUser: async () => {
    set({ loading: true, error: null })
    try {
      set({ user: null, loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  // --- CRUD actions (placeholders) ---
  addAnimal: async (animal) => {},
  updateAnimal: async (id, animal) => {},
  deleteAnimal: async (id) => {},
  // Repeat for other entities as needed
}))

export function MainDataProvider({ children }: { children: ReactNode }) {
  // Zustand is global, so just render children
  return children
} 