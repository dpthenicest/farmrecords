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
  // --- Fetch actions ---
  fetchAnimals: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch("/api/animals")
      const animals = await res.json()
      set({ animals, loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  fetchAnimalTypes: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch("/api/animal-type")
      const animalTypes = await res.json()
      set({ animalTypes, loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  fetchRecords: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch("/api/records")
      const data = await res.json()
      set({ records: data.records || [], loading: false })
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  fetchCategories: async () => {
    set({ loading: true, error: null })
    try {
      const res = await fetch("/api/categories")
      const categories = await res.json()
      set({ categories, loading: false })
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
  // --- CRUD actions ---
  addAnimal: async (animal) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch("/api/animals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(animal),
      })
      if (!res.ok) throw new Error("Failed to add animal")
      await get().fetchAnimals()
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  updateAnimal: async (id, animal) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/animals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(animal),
      })
      if (!res.ok) throw new Error("Failed to update animal")
      await get().fetchAnimals()
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  deleteAnimal: async (id) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/animals/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete animal")
      await get().fetchAnimals()
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  addRecord: async (record: Partial<Record>) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      })
      if (!res.ok) throw new Error("Failed to add record")
      await get().fetchRecords()
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  updateRecord: async (id: string, record: Partial<Record>) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      })
      if (!res.ok) throw new Error("Failed to update record")
      await get().fetchRecords()
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  deleteRecord: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/records/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete record")
      await get().fetchRecords()
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  addCategory: async (category: Partial<Category>) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      })
      if (!res.ok) throw new Error("Failed to add category")
      await get().fetchCategories()
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  updateCategory: async (id: string, category: Partial<Category>) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(category),
      })
      if (!res.ok) throw new Error("Failed to update category")
      await get().fetchCategories()
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  deleteCategory: async (id: string) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete category")
      await get().fetchCategories()
    } catch (e: any) {
      set({ error: e.message, loading: false })
    }
  },
  // Repeat for records and categories as needed
}))

export function MainDataProvider({ children }: { children: ReactNode }) {
  // Zustand is global, so just render children
  return children
} 