"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/dist/style.css"
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover"
import { CalendarIcon } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

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
          footer={
            value ? `Selected: ${value.toLocaleDateString()}` : "Pick a day."
          }
        />
      </PopoverContent>
    </Popover>
  )
}
