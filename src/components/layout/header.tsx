'use client'

import { useState, useEffect } from 'react'
import { User, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import LogoutConfirmationModal from '@/components/modals/logout-confirmation-modal'

function Header() {
  const [mounted, setMounted] = useState(false)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogout = async () => {
    setLogoutLoading(true)
    try {
      await signOut({ redirect: false }) // Don't auto-redirect
      setShowLogoutModal(false)
      router.push('/login') // Manually redirect
    } catch (error) {
      console.error('Logout error:', error)
      setLogoutLoading(false)
    }
  }

  const openLogoutModal = () => {
    setShowLogoutModal(true)
  }

  const closeLogoutModal = () => {
    setShowLogoutModal(false)
  }

  if (!mounted) {
    return (
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">Farm Records Admin</h2>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>Loading...</span>
          </Button>
        </div>
      </header>
    )
  }

  const userName = session?.user?.name || session?.user?.email || 'User'

  return (
    <>
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">Farm Records Admin</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>{userName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={openLogoutModal}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <LogoutConfirmationModal
        isOpen={showLogoutModal}
        onClose={closeLogoutModal}
        onConfirm={handleLogout}
        loading={logoutLoading}
      />
    </>
  )
}

export default Header 