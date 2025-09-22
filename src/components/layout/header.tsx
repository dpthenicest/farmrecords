'use client'

import { useState, useEffect } from 'react'
import { User, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Modal } from '@/components/ui/modal'

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
      await signOut({ redirect: false })
      setShowLogoutModal(false)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      setLogoutLoading(false)
    }
  }

  const userName = session?.user?.name || session?.user?.email || 'User'

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
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowLogoutModal(true)}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Logout Modal */}
      <Modal
        open={showLogoutModal}
        onOpenChange={setShowLogoutModal}
        title="Confirm Logout"
        description="Are you sure you want to log out of your account?"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setShowLogoutModal(false)}
              disabled={logoutLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={logoutLoading}
            >
              {logoutLoading ? 'Logging out...' : 'Logout'}
            </Button>
          </>
        }
      >
        <p className="text-sm text-gray-600">
          Logging out will end your session and redirect you to the login page.
        </p>
      </Modal>
    </>
  )
}

export default Header
