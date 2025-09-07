'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'

import { 
  Users, 
  Calendar, 
  Settings, 
  LogOut, 
  Home,
  Building2,
  Shield,
  Clock,
  User,
  Menu,
  X,
  Book
} from 'lucide-react'

export default function Navigation() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const studentLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/clubs', label: 'Discover Clubs', icon: Building2 },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  const clubLeaderLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/club-leader/memberships', label: 'Applications', icon: Clock },
    { href: '/events/manage', label: 'Manage Events', icon: Calendar },
    { href: '/club-database', label: 'Club Database', icon: Book },
    { href: 'budget-requests', label: 'Budget', icon: Settings },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  const adminLinks = [
    { href: '/admin', label: 'Admin Dashboard', icon: Shield },
    { href: '/admin/clubs', label: 'Clubs', icon: Building2 },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/memberships', label: 'Memberships', icon: Users },
    { href: '/admin/budget', label: 'Budget Requests', icon: Settings },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  const getNavLinks = () => {
    if (!session) return []
    
    switch (session.user.role) {
      case 'STUDENT':
        return studentLinks
      case 'CLUB_LEADER':
        return clubLeaderLinks
      case 'ADMIN':
        return adminLinks
      default:
        return studentLinks
    }
  }

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span className="text-lg sm:text-xl font-bold text-gray-900">Club Connect</span>
            </Link>
          </div>

          {session && (
            <>
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center space-x-4">
                <div className="flex space-x-2">
                  {getNavLinks().map((link) => {
                    const Icon = link.icon
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden lg:inline">{link.label}</span>
                      </Link>
                    )
                  })}
                </div>

                <div className="flex items-center space-x-2 border-l pl-4">
                  
                  <span className="text-sm text-gray-700 hidden lg:inline">
                    {session.user.name || session.user.email}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => signOut()}
                    className="flex items-center space-x-1"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </Button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden flex items-center space-x-2">
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2"
                >
                  {mobileMenuOpen ? (
                    <X className="h-5 w-5" />
                  ) : (
                    <Menu className="h-5 w-5" />
                  )}
                </Button>
              </div>
            </>
          )}

          {!session && (
            <div className="flex items-center space-x-2">
              <Link href="/auth/signin">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {session && mobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {getNavLinks().map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={handleMobileLinkClick}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <Icon className="h-5 w-5" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}
              
              <div className="border-t pt-2">
                <div className="px-3 py-2">
                  <p className="text-sm text-gray-600">
                    {session.user.name || session.user.email}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {session.user.role?.toLowerCase().replace('_', ' ')}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    signOut()
                  }}
                  className="w-full justify-start px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
