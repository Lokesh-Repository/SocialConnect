'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useNotifications } from '@/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, Home, Search, User, Shield } from 'lucide-react'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, supabase } = useAuth()
  const { unreadCount, requestPermission } = useNotifications()
  const [isAdmin, setIsAdmin] = useState(false)

  const isActive = (path: string) => pathname === path

  useEffect(() => {
    // Request notification permission on mount
    requestPermission()
  }, [])

  useEffect(() => {
    if (user) {
      checkAdminStatus()
    }
  }, [user])

  const checkAdminStatus = async () => {
    try {
      const res = await fetch('/api/users/me')
      const data = await res.json()
      if (data.success && data.data.role === 'ADMIN') {
        setIsAdmin(true)
      }
    } catch (error) {
      console.error('Check admin status error:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <nav className="bg-background border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-primary">
              SocialConnect
            </Link>
            
            {user && (
              <div className="hidden md:flex space-x-2">
                <Button
                  variant={isActive('/feed') ? 'default' : 'ghost'}
                  asChild
                >
                  <Link href="/feed">
                    <Home className="w-4 h-4 mr-2" />
                    Feed
                  </Link>
                </Button>
                <Button
                  variant={isActive('/explore') ? 'default' : 'ghost'}
                  asChild
                >
                  <Link href="/explore">
                    <Search className="w-4 h-4 mr-2" />
                    Explore
                  </Link>
                </Button>
                <Button
                  variant={isActive('/notifications') ? 'default' : 'ghost'}
                  asChild
                  className="relative"
                >
                  <Link href="/notifications">
                    <Bell className="w-4 h-4 mr-2" />
                    Notifications
                    {unreadCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </Badge>
                    )}
                  </Link>
                </Button>
                {isAdmin && (
                  <Button
                    variant={isActive('/admin') ? 'default' : 'ghost'}
                    asChild
                  >
                    <Link href="/admin">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </Link>
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/profile">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
