// app/dashboard/_components/QuickActions.tsx
"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function QuickActions() {
  const router = useRouter()

  const actions = [
    { label: "+ New Invoice", href: "/financials/invoices/new", color: "bg-blue-600 hover:bg-blue-700" },
    { label: "+ Add Record", href: "/assets-inventory/animals/records/new", color: "bg-green-600 hover:bg-green-700" },
    { label: "+ Create Task", href: "/tasks/new", color: "bg-purple-600 hover:bg-purple-700" },
    { label: "Check Inventory", href: "/assets-inventory/inventory", color: "bg-orange-600 hover:bg-orange-700" },
  ]

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            onClick={() => router.push(action.href)}
            className={`${action.color} text-white px-4 py-2 rounded-md text-sm font-medium`}
          >
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  )
}