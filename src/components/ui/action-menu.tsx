"use client"

import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu"
// IMPORTED: Send, CheckCircle (for Mark Paid), Settings (for Adjust), and existing icons
import { MoreHorizontal, Pencil, Trash, View, Send, CheckCircle, Settings } from "lucide-react"
import { Button } from "./button"

// UPDATED: Added props for Send, MarkPaid, and Adjust actions and visibility flags
interface ActionMenuProps {
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onSend?: () => void
  onMarkPaid?: () => void
  onReceive?: () => void
  onAdjust?: () => void
  
  showView?: boolean
  showEdit?: boolean
  showDelete?: boolean
  showSend?: boolean
  showMarkPaid?: boolean
  showReceive?: boolean
  showAdjust?: boolean
}

export function ActionMenu({
  onView,
  onEdit,
  onDelete,
  onSend,
  onMarkPaid,
  onReceive,
  onAdjust,
  
  showView = true,
  showEdit = true,
  showDelete = true,
  showSend = false, // Defaulting to false since these are invoice-specific
  showMarkPaid = false, // Defaulting to false since these are invoice-specific
  showReceive = false,
  showAdjust = false,
}: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        
        {/* View Action (Existing) */}
        {showView && (
          <DropdownMenuItem onClick={onView} className="flex justify-start">
            <View className="mr-2 h-4 w-4" /> View
          </DropdownMenuItem>
        )}
        
        {/* Send Action (NEW) */}
        {showSend && (
          <DropdownMenuItem onClick={onSend} className="flex justify-start text-blue-600 focus:bg-blue-50">
            <Send className="mr-2 h-4 w-4" /> Send
          </DropdownMenuItem>
        )}

        {/* Mark Paid Action (NEW) */}
        {showMarkPaid && (
          <DropdownMenuItem onClick={onMarkPaid} className="flex justify-start text-green-700 focus:bg-green-100">
            <CheckCircle className="mr-2 h-4 w-4" /> Mark Paid
          </DropdownMenuItem>
        )}

        {/* Receive Action */}
        {showReceive && (
          <DropdownMenuItem onClick={onReceive} className="flex justify-start text-purple-600 focus:bg-purple-50">
            <CheckCircle className="mr-2 h-4 w-4" /> Receive
          </DropdownMenuItem>
        )}

        {/* Adjust Action */}
        {showAdjust && (
          <DropdownMenuItem onClick={onAdjust} className="flex justify-start text-blue-600 focus:bg-blue-50">
            <Settings className="mr-2 h-4 w-4" /> Adjust Stock
          </DropdownMenuItem>
        )}

        {/* Edit Action (Existing) */}
        {showEdit && (
          <DropdownMenuItem onClick={onEdit} className="flex justify-start text-green-600 focus:bg-green-50">
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
        )}
        
        {/* Delete Action (Existing) */}
        {showDelete && (
          <DropdownMenuItem
            onClick={onDelete}
            className="text-red-600 focus:bg-red-50 flex justify-start"
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}