"use client"

import * as React from "react"
import * as Dialog from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "default",
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: "default" | "large" | "xlarge"
}) {
  const sizeClasses = {
    default: "max-w-lg",
    large: "max-w-4xl",
    xlarge: "max-w-6xl",
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white shadow-lg",
            "max-h-[90vh] flex flex-col",
            sizeClasses[size]
          )}
        >
          <div className="flex items-center justify-between px-6 py-4 border-b shrink-0">
            {title && (
              <Dialog.Title className="text-lg font-semibold">{title}</Dialog.Title>
            )}
            <Dialog.Close className="rounded p-1 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          {description && (
            <div className="px-6 pt-2 shrink-0">
              <Dialog.Description className="text-sm text-gray-600">
                {description}
              </Dialog.Description>
            </div>
          )}
          <div className="overflow-y-auto px-6 py-4 flex-1">
            {children}
          </div>
          {footer && (
            <div className="px-6 py-4 border-t flex justify-end gap-2 shrink-0">
              {footer}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
