'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  ChevronDown,
  ChevronRight,
  PawPrint, // icon for animals
} from 'lucide-react'

interface SubItem {
  title: string
  href: string
  subItems?: SubItem[]
}

interface SidebarItem {
  title: string
  href: string
  icon: React.ReactNode
  subItems?: SubItem[]
}

function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sidebarItems: SidebarItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: 'Financials',
      href: '/financials',
      icon: <FileText className="w-5 h-5" />,
      subItems: [
        { title: 'Financial Records', href: '/financials/records' },
        { title: 'Invoices', href: '/financials/invoices' },
        { title: 'Purchase Orders', href: '/financials/purchase-orders' },
        { title: 'Sales & Expense Categories', href: '/financials/categories' },
      ],
    },
    {
      title: 'Assets & Inventory',
      href: '/assets-inventory',
      icon: <FileText className="w-5 h-5" />,
      subItems: [
        { title: 'Inventory', href: '/assets-inventory/inventory' },
        { title: 'Assets (PP&E)', href: '/assets-inventory/assets' },
        {
          title: 'Animals',
          href: '/assets-inventory/animals',
          subItems: [
            { title: 'Animal Batches', href: '/assets-inventory/animals/batches' },
            { title: 'Individual Animals', href: '/assets-inventory/animals/individuals' },
            { title: 'Animal Records', href: '/assets-inventory/animals/records' },
          ],
        },
      ],
    },
    {
      title: 'Contacts',
      href: '/contacts',
      icon: <FileText className="w-5 h-5" />,
      subItems: [
        { title: 'Customers', href: '/contacts/customers' },
        { title: 'Suppliers', href: '/contacts/suppliers' },
      ],
    },
  ]

  const toggleExpanded = (key: string) => {
    setExpandedItems(prev =>
      prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key]
    )
  }

  const isActive = (href: string) => pathname === href
  const isSubItemActive = (href: string) => pathname === href

  // recursive renderer
  const renderSubItems = (items: SubItem[], parentKey: string, depth = 1) => {
    return (
      <div className={cn('mt-1 space-y-1', depth === 1 ? 'ml-8' : 'ml-12')}>
        {items.map(subItem => {
          const key = `${parentKey}-${subItem.title}`
          const isExpanded = expandedItems.includes(key)
          const hasSubItems = subItem.subItems && subItem.subItems.length > 0

          return (
            <div key={key}>
              <div
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors',
                  isSubItemActive(subItem.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
                onClick={() => {
                  if (hasSubItems) toggleExpanded(key)
                }}
              >
                <Link
                  href={subItem.href}
                  className="flex-1"
                  onClick={e => {
                    if (hasSubItems) e.preventDefault()
                  }}
                >
                  {subItem.title}
                </Link>
                {hasSubItems && (
                  <button className="p-1">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {hasSubItems && isExpanded && renderSubItems(subItem.subItems!, key, depth + 1)}
            </div>
          )
        })}
      </div>
    )
  }

  if (!mounted) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 h-full">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">Farm Records</h1>
        </div>
        <nav className="px-4 space-y-2">
          {sidebarItems.map(item => (
            <div key={item.title} className="px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-3">
                {item.icon}
                <span className="font-medium">{item.title}</span>
              </div>
            </div>
          ))}
        </nav>
      </div>
    )
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full">
      <div className="p-6">
        <h1 className="text-xl font-bold text-gray-900">Farm Records</h1>
      </div>

      <nav className="px-4 space-y-2">
        {sidebarItems.map(item => {
          const isExpanded = expandedItems.includes(item.title)
          const hasSubItems = item.subItems && item.subItems.length > 0

          return (
            <div key={item.title}>
              <div
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors',
                  isActive(item.href)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-50'
                )}
                onClick={() => {
                  if (hasSubItems) toggleExpanded(item.title)
                }}
              >
                <Link
                  href={item.href}
                  className="flex items-center space-x-3 flex-1"
                  onClick={e => {
                    if (hasSubItems) e.preventDefault()
                  }}
                >
                  {item.icon}
                  <span className="font-medium">{item.title}</span>
                </Link>
                {hasSubItems && (
                  <button className="p-1">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>

              {hasSubItems && isExpanded && renderSubItems(item.subItems!, item.title)}
            </div>
          )
        })}
      </nav>
    </div>
  )
}

export default Sidebar
