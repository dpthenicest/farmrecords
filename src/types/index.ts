import { CategoryType, AnimalType } from '@prisma/client'

export interface User {
  id: string
  email: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CategoryType {
  id: string
  name: string
  description: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  categoryTypeId: string
  categoryType: CategoryType
  description: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface AnimalType {
  id: string
  type: string
  emoji: string
  createdAt: Date
  updatedAt: Date
}

export interface Animal {
  id: string
  name: string
  animalTypeId: string
  animalType: AnimalType
  description: string | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Record {
  id: string
  categoryId: string
  category: Category
  unitPrice: number
  quantity: number
  note: string | null
  date: Date | null
  animalId: string | null
  animal: Animal | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface DashboardStats {
  totalIncome: number
  totalExpense: number
  netProfit: number
  totalAnimals: number
  totalCategories: number
  recentRecords: Record[]
}

export interface CreateRecordData {
  categoryId: string
  unitPrice: number
  quantity: number
  note?: string
  date?: Date
  animalId?: string
  userId: string
}

export interface CreateCategoryData {
  name: string
  categoryTypeId: string
  description?: string
}

export interface CreateAnimalData {
  name: string
  animalTypeId: string
  description?: string
}

// Predefined categories
export const EXPENSE_CATEGORIES = [
  { name: 'Animal Purchase', description: 'Buying new goats, fowls, catfish' },
  { name: 'Feed', description: 'Maize, pellets, or other feed' },
  { name: 'Drugs & Vaccines', description: 'Veterinary treatments' },
  { name: 'Workers\' Salary', description: 'Monthly payments to farm workers' },
  { name: 'Facility Costs', description: 'Repairs, water supply, tools' },
  { name: 'Transportation', description: 'Fuel, logistics' },
  { name: 'Utilities', description: 'Electricity, water bills' },
  { name: 'Maintenance', description: 'Cage/tank repair, fencing, etc.' },
  { name: 'Miscellaneous', description: 'Anything not covered in above' }
] as const

export const INCOME_CATEGORIES = [
  { name: 'Sale of Goats', description: 'Revenue from goat sales' },
  { name: 'Sale of Fowls', description: 'Revenue from chicken sales' },
  { name: 'Sale of Catfish', description: 'Revenue from catfish sales' },
  { name: 'Manure Sales', description: 'Selling animal waste as fertilizer' },
  { name: 'Subsidies/Support', description: 'Gov\'t support, aid (if any)' },
  { name: 'Other Income', description: 'Rentals, byproducts, etc.' }
] as const 