'use client'
import { ReactNode } from "react"
import dynamic from 'next/dynamic'
import { UIProvider } from '@/providers/ui-provider'

// Dynamically import client components to prevent hydration issues
const Sidebar = dynamic(() => import('@/components/layout/sidebar'), {
  ssr: false,
  loading: () => (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Farm Records</h1>
      </div>
    </div>
  )
})

const Header = dynamic(() => import('@/components/layout/header'), {
  ssr: false,
  loading: () => (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        <h2 className="text-lg font-semibold text-gray-900">Farm Records Admin</h2>
      </div>
    </header>
  )
})

interface ClientLayoutProps {
  children: ReactNode
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <UIProvider>
      <div className="h-screen flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 bg-gray-50 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </UIProvider>
  )
} 