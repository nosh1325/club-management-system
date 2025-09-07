'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

import { 
  Users, 
  Settings, 
  LogOut, 
  Home,
  Building2,
  Shield,
  Clock,
  User,
  Menu,
  X
} from 'lucide-react'

export default function EnhancedNavbar() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const studentLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/clubs', label: 'Discover Clubs', icon: Building2 },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  const clubLeaderLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/club-leader/memberships', label: 'Applications', icon: Clock },
    { href: '/clubs', label: 'Discover Clubs', icon: Building2 },
    { href: '/budget-requests', label: 'Budget', icon: Settings },
    { href: '/profile', label: 'Profile', icon: User },
  ]

  const adminLinks = [
    { href: '/admin', label: 'Admin Dashboard', icon: Shield },
    { href: '/admin/clubs', label: 'Clubs', icon: Building2 },
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'badge-error'
      case 'CLUB_LEADER':
        return 'badge-warning'
      default:
        return 'badge-info'
    }
  }

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="navbar bg-base-100 shadow-lg sticky top-0 z-50"
    >
      <div className="navbar-start">
        <div className="dropdown">
          <div 
            tabIndex={0} 
            role="button" 
            className="btn btn-ghost lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </div>
          {mobileMenuOpen && session && (
            <motion.ul
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              tabIndex={0}
              className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
            >
              {getNavLinks().map((link) => {
                const Icon = link.icon
                return (
                  <li key={link.href} onClick={handleMobileLinkClick}>
                    <Link href={link.href} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </motion.ul>
          )}
        </div>
        <Link href="/" className="btn btn-ghost text-xl">
          <Building2 className="h-6 w-6 text-primary mr-2" />
          <span className="hidden sm:inline">Club Connect</span>
        </Link>
      </div>

      {session && (
        <>
          <div className="navbar-center hidden lg:flex">
            <ul className="menu menu-horizontal px-1">
              {getNavLinks().map((link) => {
                const Icon = link.icon
                return (
                  <li key={link.href}>
                    <Link href={link.href} className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="hidden xl:inline">{link.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="navbar-end">
           

            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-10 rounded-full">
                  <img
                    alt="User avatar"
                    src={session.user.image || "/placeholder-avatar.png"}
                    className="rounded-full"
                  />
                </div>
              </div>
              <motion.ul
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                tabIndex={0}
                className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
              >
                <li className="menu-title">
                  <span className="text-sm font-semibold">{session.user.name}</span>
                  <span className={`badge badge-sm ${getRoleBadgeColor(session.user.role)}`}>
                    {session.user.role}
                  </span>
                </li>
                <li>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </li>
                <li>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-2 text-error"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </li>
              </motion.ul>
            </div>
          </div>
        </>
      )}

      {!session && (
        <div className="navbar-end">
          <div className="flex gap-2">
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      )}
    </motion.div>
  )
}
