'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Calendar, 
  Eye, 
  AlertCircle,
  CheckCircle,
  Info,
  Megaphone
} from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  recipients: string[]
  sentAt: string
  createdAt: string
  isRead: boolean
}

export default function NotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch('/api/notifications')
        if (response.ok) {
          const data = await response.json()
          
          // Get read status from localStorage (user-specific key)
          const userReadKey = `readNotifications_${session?.user?.id}`
          const readNotifications = JSON.parse(localStorage.getItem(userReadKey) || '[]')
          
          const notificationsWithReadStatus = data.notifications.map((notification: any) => ({
            ...notification,
            isRead: readNotifications.includes(notification.id)
          }))
          
          setNotifications(notificationsWithReadStatus)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session) {
      fetchNotifications()
    }
  }, [session])

  const markAsRead = (notificationId: string) => {
    const userReadKey = `readNotifications_${session?.user?.id}`
    const readNotifications = JSON.parse(localStorage.getItem(userReadKey) || '[]')
    if (!readNotifications.includes(notificationId)) {
      readNotifications.push(notificationId)
      localStorage.setItem(userReadKey, JSON.stringify(readNotifications))
      
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, isRead: true }
            : notification
        )
      )
    }
  }

  const markAllAsRead = () => {
    const userReadKey = `readNotifications_${session?.user?.id}`
    const allNotificationIds = notifications.map(n => n.id)
    localStorage.setItem(userReadKey, JSON.stringify(allNotificationIds))
    
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    )
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'URGENT':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'EVENT':
        return <Calendar className="h-5 w-5 text-blue-500" />
      case 'MAINTENANCE':
        return <Info className="h-5 w-5 text-yellow-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'URGENT':
        return 'bg-red-100 text-red-800'
      case 'EVENT':
        return 'bg-blue-100 text-blue-800'
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800'
      case 'CLUB_SPECIFIC':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredNotifications = notifications.filter(notification => 
    filter === 'all' || !notification.isRead
  )

  const unreadCount = notifications.filter(n => !n.isRead).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('/images/bracu-campus.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Content container */}
      <div className="relative z-10 min-h-screen flex flex-col py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto w-full">
          {/* Frosted glass container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/60 transition-all duration-300">
            
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 drop-shadow-lg">Notifications</h1>
                <p className="mt-2 text-gray-700 drop-shadow">
                  Stay updated with announcements and important information
                </p>
              </div>
              <div className="flex items-center gap-4">
                {unreadCount > 0 && (
                  <Button 
                    onClick={markAllAsRead}
                    variant="outline"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark All Read
                  </Button>
                )}
                <Badge variant="outline" className="bg-blue-100 border-blue-300 text-blue-800">
                  {unreadCount} unread
                </Badge>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-blue-600 text-white' : 'bg-white/20 border-white/30 text-white hover:bg-white/30'}
              >
                All ({notifications.length})
              </Button>
              <Button
                variant={filter === 'unread' ? 'default' : 'outline'}
                onClick={() => setFilter('unread')}
                className={filter === 'unread' ? 'bg-blue-600 text-white' : 'bg-white/90 border-gray-300 text-gray-800 hover:bg-white/100'}
              >
                Unread ({unreadCount})
              </Button>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <Card className="bg-white/90 backdrop-blur">
                  <CardContent className="p-8 text-center">
                    <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {filter === 'unread' ? 'No unread notifications' : 'No notifications found'}
                    </h3>
                    <p className="text-gray-600">
                      {filter === 'unread' 
                        ? "You're all caught up! Check back later for new updates."
                        : "You haven't received any notifications yet."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`bg-white/90 backdrop-blur cursor-pointer transition-all duration-200 hover:bg-white/95 ${
                      !notification.isRead ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className={`text-lg font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            <Badge className={getNotificationBadgeColor(notification.type)}>
                              {notification.type}
                            </Badge>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            )}
                          </div>
                          
                          <p className={`mb-3 ${!notification.isRead ? 'text-gray-800' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(notification.sentAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}