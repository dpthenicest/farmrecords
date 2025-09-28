"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function CategoryTabs({
  value,
  onChange,
}: {
  value: "SALES" | "EXPENSE"
  onChange: (val: "SALES" | "EXPENSE") => void
}) {
  return (
    <Tabs value={value} onValueChange={(val) => onChange(val as any)}>
      <TabsList>
        <TabsTrigger value="SALES">Sales Categories</TabsTrigger>
        <TabsTrigger value="EXPENSE">Expense Categories</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
