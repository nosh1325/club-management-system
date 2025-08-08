'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Users, Calendar, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface DashboardTemplateProps {
  role: 'STUDENT' | 'CLUB_LEADER' | 'ADMIN'
  userName: string
  stats: {
    primary: { label: string; value: number; change?: string }
    secondary: { label: string; value: number; change?: string }
    tertiary: { label: string; value: number; change?: string }
    quaternary: { label: string; value: number; change?: string }
  }
  recentItems: Array<{
    id: string
    title: string
    subtitle: string
    status?: string
    date?: string
  }>
  quickActions: Array<{
    title: string
    description: string
    href: string
    icon: any
    color: string
  }>
}

export default function DashboardTemplate({
  role,
  userName,
  stats,
  recentItems,
  quickActions
}: DashboardTemplateProps) {
  const roleConfig = {
    STUDENT: {
      title: 'Student Dashboard',
      subtitle: 'Discover clubs and events',
      theme: 'from-blue-500 to-purple-600'
    },
    CLUB_LEADER: {
      title: 'Club Leader Dashboard', 
      subtitle: 'Manage your club and events',
      theme: 'from-green-500 to-blue-600'
    },
    ADMIN: {
      title: 'Admin Dashboard',
      subtitle: 'Oversee university clubs',
      theme: 'from-red-500 to-pink-600'
    }
  }

  const config = roleConfig[role]

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={`hero bg-gradient-to-r ${config.theme} text-white py-16`}
      >
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold mb-4">
              Welcome back, {userName}!
            </h1>
            <p className="text-lg opacity-90 mb-6">{config.subtitle}</p>
            <div className={`badge badge-lg badge-outline text-white border-white`}>
              {role.replace('_', ' ')}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-figure text-primary">
              <Users className="h-8 w-8" />
            </div>
            <div className="stat-title">{stats.primary.label}</div>
            <div className="stat-value text-primary">{stats.primary.value}</div>
            {stats.primary.change && (
              <div className="stat-desc">{stats.primary.change}</div>
            )}
          </div>

          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-figure text-secondary">
              <Calendar className="h-8 w-8" />
            </div>
            <div className="stat-title">{stats.secondary.label}</div>
            <div className="stat-value text-secondary">{stats.secondary.value}</div>
            {stats.secondary.change && (
              <div className="stat-desc">{stats.secondary.change}</div>
            )}
          </div>

          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-figure text-accent">
              <TrendingUp className="h-8 w-8" />
            </div>
            <div className="stat-title">{stats.tertiary.label}</div>
            <div className="stat-value text-accent">{stats.tertiary.value}</div>
            {stats.tertiary.change && (
              <div className="stat-desc">{stats.tertiary.change}</div>
            )}
          </div>

          <div className="stat bg-base-100 shadow rounded-lg">
            <div className="stat-figure text-info">
              <Clock className="h-8 w-8" />
            </div>
            <div className="stat-title">{stats.quaternary.label}</div>
            <div className="stat-value text-info">{stats.quaternary.value}</div>
            {stats.quaternary.change && (
              <div className="stat-desc">{stats.quaternary.change}</div>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Recent Activity</h2>
                <div className="space-y-4">
                  {recentItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 bg-base-200 rounded-lg hover:bg-base-300 transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold">{item.title}</h3>
                        <p className="text-sm text-base-content/70">{item.subtitle}</p>
                        {item.date && (
                          <p className="text-xs text-base-content/50 mt-1">{item.date}</p>
                        )}
                      </div>
                      {item.status && (
                        <Badge variant="outline">{item.status}</Badge>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title">Quick Actions</h2>
                <div className="space-y-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon
                    return (
                      <motion.div
                        key={action.title}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Link href={action.href}>
                          <div className={`btn btn-block btn-outline hover:btn-${action.color} justify-start gap-3`}>
                            <Icon className="h-5 w-5" />
                            <div className="text-left">
                              <div className="font-semibold">{action.title}</div>
                              <div className="text-xs opacity-70">{action.description}</div>
                            </div>
                            <ArrowRight className="h-4 w-4 ml-auto" />
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
