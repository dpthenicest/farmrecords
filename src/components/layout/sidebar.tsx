'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  PieChart,
  Users,
  ChevronDown,
  ChevronRight
} from 'lucide-react'

interface SidebarItem {
  title: string
  href: string
  icon: React.ReactNode
  subItems?: {
    title: string
    href: string
  }[]
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />
  },
  {
    title: 'Records',
    href: '/records',
    icon: <FileText className="w-5 h-5" />,
    subItems: [
      { title: 'All Records', href: '/records' },
      { title: 'Income', href: '/records/income' },
      { title: 'Expenses', href: '/records/expenses' },
      { title: 'Profit/Loss', href: '/records/profit-loss' }
    ]
  },
  {
    title: 'Animals',
    href: '/animals',
    icon: <Users className="w-5 h-5" />,
    subItems: [
      { title: 'All Animals', href: '/animals' },
      { title: 'Goats', href: '/animals/goats' },
      { title: 'Fowls', href: '/animals/fowls' },
      { title: 'Catfish', href: '/animals/catfish' }
    ]
  }
]

function Sidebar() {
  const pathname = usePathname()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    )
  }

  const isActive = (href: string) => pathname === href
  const isSubItemActive = (href: string) => pathname === href

  if (!mounted) {
    return (
      <div className="w-64 bg-white border-r border-gray-200 h-full">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900">Farm Records</h1>
        </div>
        <nav className="px-4 space-y-2">
          {sidebarItems.map((item) => (
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
        {sidebarItems.map((item) => {
          const isExpanded = expandedItems.includes(item.title)
          const hasSubItems = item.subItems && item.subItems.length > 0
          
          return (
            <div key={item.title}>
              <div
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors",
                  isActive(item.href) 
                    ? "bg-blue-50 text-blue-700" 
                    : "text-gray-700 hover:bg-gray-50"
                )}
                onClick={() => {
                  if (hasSubItems) {
                    toggleExpanded(item.title)
                  }
                }}
              >
                <Link 
                  href={item.href}
                  className="flex items-center space-x-3 flex-1"
                  onClick={(e) => {
                    if (hasSubItems) {
                      e.preventDefault()
                    }
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
              
              {hasSubItems && isExpanded && (
                <div className="ml-8 mt-2 space-y-1">
                  {item.subItems!.map((subItem) => (
                    <Link
                      key={subItem.href}
                      href={subItem.href}
                      className={cn(
                        "block px-3 py-2 rounded-lg text-sm transition-colors",
                        isSubItemActive(subItem.href)
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50"
                      )}
                    >
                      {subItem.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  )
}

export default Sidebar 