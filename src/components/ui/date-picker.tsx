"use client"

import * as React from "react"
import { DayPicker, CaptionProps } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { CalendarIcon } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

// 🔽 Custom caption with month + year selectors
function YearMonthCaption({ displayMonth, onMonthChange }: CaptionProps) {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const years = []
  const currentYear = new Date().getFullYear()
  for (let year = currentYear - 50; year <= currentYear + 20; year++) {
    years.push(year)
  }

  return (
    <div className="flex justify-center gap-2 mb-2">
      <select
        className="border rounded px-1 py-0.5 text-sm"
        value={displayMonth.getMonth()}
        onChange={(e) =>
          onMonthChange(new Date(displayMonth.getFullYear(), Number(e.target.value)))
        }
      >
        {months.map((m, idx) => (
          <option key={m} value={idx}>
            {m}
          </option>
        ))}
      </select>
      <select
        className="border rounded px-1 py-0.5 text-sm"
        value={displayMonth.getFullYear()}
        onChange={(e) =>
          onMonthChange(new Date(Number(e.target.value), displayMonth.getMonth()))
        }
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </div>
  )
}

export function DatePicker({
  value,
  onChange,
}: {
  value?: Date
  onChange: (date: Date | undefined) => void
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !value && "text-gray-400"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? value.toDateString() : "Pick a date"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2 bg-white rounded-md shadow-md border">
        <DayPicker
          mode="single"
          selected={value}
          onSelect={onChange}
          captionLayout="dropdown" // ✅ enables custom caption layout
          components={{
            Caption: YearMonthCaption, // ✅ custom caption
          }}
          footer={
            value ? `Selected: ${value.toLocaleDateString()}` : "Pick a day."
          }
        />
      </PopoverContent>
    </Popover>
  )
}
