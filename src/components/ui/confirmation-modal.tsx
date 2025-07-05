'use client'

import { AlertTriangle, Trash2 } from 'lucide-react'
import { Modal } from './modal'
import { Button } from './button'

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false
}: ConfirmationModalProps) {
  const variantStyles = {
    danger: {
      icon: <Trash2 className="h-6 w-6 text-red-600" />,
      button: 'bg-red-600 hover:bg-red-700 text-white',
      bg: 'bg-red-50'
    },
    warning: {
      icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
      button: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      bg: 'bg-yellow-50'
    },
    info: {
      icon: <AlertTriangle className="h-6 w-6 text-blue-600" />,
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
      bg: 'bg-blue-50'
    }
  }

  const styles = variantStyles[variant]

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      showCloseButton={false}
    >
      <div className="space-y-4">
        <div className={`flex items-center space-x-3 p-3 rounded-lg ${styles.bg}`}>
          {styles.icon}
          <p className="text-gray-700">{message}</p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className={styles.button}
          >
            {isLoading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
} 