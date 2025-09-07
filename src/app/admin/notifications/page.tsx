'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Bell, 
  Plus, 
  Send, 
  Users, 
  Search,
  Calendar,
  Mail,
  X
} from 'lucide-react'

import AdminEmailForm from '@/components/email/AdminEmailForm'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  recipients: string[]
  recipientCount: number
  sentAt: string
  createdAt: string
}

interface Club {
  id: string
  name: string
  department: string
  _count: {
    memberships: number
  }
}

interface User {
  id: string
  name: string
  email: string
  role: string
  studentId?: string
  department?: string
}

export default function AdminNotificationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Form state
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('GENERAL')
  const [target, setTarget] = useState('ALL_USERS')
  const [selectedClubId, setSelectedClubId] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Email state
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userSearchTerm, setUserSearchTerm] = useState('')

  // Redirect if not admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  // Fetch notifications and clubs
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [notificationsRes, clubsRes, usersRes] = await Promise.all([
          fetch('/api/admin/notifications'),
          fetch('/api/admin/notifications/clubs'),
          fetch('/api/all-users') 
        ])

        if (notificationsRes.ok) {
          const notificationsData = await notificationsRes.json()
          setNotifications(notificationsData.notifications || [])
        }

        if (clubsRes.ok) {
          const clubsData = await clubsRes.json()
          setClubs(clubsData || [])
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(usersData || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user?.role === 'ADMIN') {
      fetchData()
    }
  }, [session])

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      const response = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          message,
          type,
          target,
          clubId: target === 'SPECIFIC_CLUB' ? selectedClubId : undefined
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setNotifications(prev => [data.notification, ...prev])
        
        // Reset form
        setTitle('')
        setMessage('')
        setType('GENERAL')
        setTarget('ALL_USERS')
        setSelectedClubId('')
        setShowForm(false)
        
        alert(`Notification sent successfully to ${data.notification.recipientCount} users!`)
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.error}`)
      }
    } catch (error) {
      console.error('Error sending notification:', error)
      alert('Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
    user.studentId?.toLowerCase().includes(userSearchTerm.toLowerCase())
  )

  const filteredNotifications = notifications.filter(notification =>
    notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.message.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <div className="max-w-7xl mx-auto w-full">
          {/* Frosted glass container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/60">
            
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 drop-shadow-lg">Notification Management</h1>
                <p className="mt-2 text-gray-700 drop-shadow">
                  Send announcements and notifications to users
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email User
                </Button>
                <Button 
                  onClick={() => setShowForm(!showForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Notification
                </Button>
              </div>
            </div>

            {/* Create Notification Form */}
            {showForm && (
              <Card className="mb-8 bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle>Send New Notification</CardTitle>
                  <CardDescription>Create and send announcements to users</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendNotification} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Notification title"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <select
                          id="type"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="GENERAL">General</option>
                          <option value="URGENT">Urgent</option>
                          <option value="EVENT">Event</option>
                          <option value="MAINTENANCE">Maintenance</option>
                          <option value="CLUB_SPECIFIC">Club Specific</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Message</Label>
                      <textarea
                        id="message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Notification message"
                        className="w-full p-2 border rounded-md h-24"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="target">Target Audience</Label>
                        <select
                          id="target"
                          value={target}
                          onChange={(e) => setTarget(e.target.value)}
                          className="w-full p-2 border rounded-md"
                          required
                        >
                          <option value="ALL_USERS">All Users</option>
                          <option value="ALL_CLUB_LEADERS">All Club Leaders</option>
                          <option value="STUDENTS_ONLY">Students Only</option>
                          <option value="ADMINS_ONLY">Admins Only</option>
                          <option value="SPECIFIC_CLUB">Specific Club</option>
                        </select>
                      </div>

                      {target === 'SPECIFIC_CLUB' && (
                        <div>
                          <Label htmlFor="club">Select Club</Label>
                          <select
                            id="club"
                            value={selectedClubId}
                            onChange={(e) => setSelectedClubId(e.target.value)}
                            className="w-full p-2 border rounded-md"
                            required
                          >
                            <option value="">Select a club...</option>
                            {clubs.map(club => (
                              <option key={club.id} value={club.id}>
                                {club.name} ({club._count.memberships} members)
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" disabled={sending}>
                        {sending ? (
                          <>Loading...</>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Notification
                          </>
                        )}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowForm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Email User Form */}
            {showEmailForm && (
              <Card className="mb-8 bg-white/90 backdrop-blur">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Send Email to User</CardTitle>
                      <CardDescription>Send a personal email to any user</CardDescription>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowEmailForm(false)
                        setSelectedUser(null)
                        setUserSearchTerm('')
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {!selectedUser ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="userSearch">Search Users</Label>
                        <Input
                          id="userSearch"
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          placeholder="Search by name, email, or student ID..."
                          className="mb-4"
                        />
                      </div>
                      
                      <div className="max-h-60 overflow-y-auto border rounded-lg">
                        {filteredUsers.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No users found. Try adjusting your search.
                          </div>
                        ) : (
                          <div className="space-y-1 p-2">
                            {filteredUsers.slice(0, 20).map((user) => (
                              <div
                                key={user.id}
                                onClick={() => setSelectedUser(user)}
                                className="p-3 rounded-lg cursor-pointer hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-colors"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium">{user.name || 'No Name'}</p>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                    {user.studentId && (
                                      <p className="text-xs text-gray-400">ID: {user.studentId}</p>
                                    )}
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    {user.role}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                            {filteredUsers.length > 20 && (
                              <div className="p-2 text-center text-gray-500 text-sm">
                                Showing first 20 results. Refine your search for more specific results.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Selected User: {selectedUser.name}</p>
                          <p className="text-sm text-gray-500">{selectedUser.email}</p>
                          <p className="text-xs text-gray-400">{selectedUser.role}</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setSelectedUser(null)}
                        >
                          Change User
                        </Button>
                      </div>
                      
                      <AdminEmailForm
                        userInfo={{
                          id: selectedUser.id,
                          name: selectedUser.name || 'User',
                          email: selectedUser.email
                        }}
                        onEmailSent={(result: any) => {
                          console.log('Email sent:', result)
                          // Optionally close the form or show success message
                        }}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-white/90"
                />
              </div>
            </div>

            {/* Notifications List */}
            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <Card className="bg-white/90 backdrop-blur">
                  <CardContent className="p-8 text-center">
                    <Bell className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                    <p className="text-gray-600">
                      {notifications.length === 0 
                        ? "Create your first notification to get started."
                        : "Try adjusting your search terms."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredNotifications.map((notification) => (
                  <Card key={notification.id} className="bg-white/90 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{notification.title}</h3>
                            <Badge variant="outline">
                              {notification.type}
                            </Badge>
                          </div>
                          
                          <p className="text-gray-600 mb-3">{notification.message}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {notification.recipientCount} recipients
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(notification.sentAt).toLocaleDateString()}
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