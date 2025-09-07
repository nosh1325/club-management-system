'use client'

import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, Calendar, Users, Clock, MapPin, Plus, Edit,Mail } from 'lucide-react'
import { Bell, Megaphone } from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  user: {
    name: string
    email: string
    studentId: string | null
    department: string | null
    role: string
  }
  stats: {
    clubsJoined: number
    eventsAttending: number
    pendingApplications: number
    totalClubs?: number
    totalUsers?: number
    pendingClubApprovals?: number
    pendingMemberships?: number
  }
  recentEvents: Array<{
    id: string
    title: string
    venue: string
    startDate: string
    clubName: string
  }>
  myClubs: Array<{
    id: string
    name: string
    description: string
    memberCount: number
    role: string
  }>
}

export default function Dashboard() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!session?.user?.email) {
      setLoading(false)
      return
    }

    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        
        if (response.ok) {
          const data = await response.json()
          setDashboardData(data)
        } else {
          const errorData = await response.text()
          console.error('Failed to fetch dashboard data:', response.status, errorData)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [session])

  if (!session?.user) {
    return (
      <div className="bracu-bg min-h-screen flex items-center justify-center">
        <div className="text-center relative z-10">
          <p className="text-gray-700">Please sign in to access your dashboard.</p>
          <Link href="/auth/signin" className="text-blue-300 hover:text-blue-200 mt-2 inline-block">
            Sign In
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bracu-bg min-h-screen flex items-center justify-center relative">
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="bracu-bg min-h-screen flex items-center justify-center relative">
        <div className="text-center relative z-10">
          <p className="text-red-300 mb-4">Error loading dashboard data</p>
          <p className="text-gray-700 mb-4">Session: {session?.user?.email}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  // Render different dashboards based on user role
  if (dashboardData.user.role === 'ADMIN') {
    return <AdminDashboard dashboardData={dashboardData} session={session} />
  } else if (dashboardData.user.role === 'CLUB_LEADER') {
    return <ClubLeaderDashboard dashboardData={dashboardData} session={session} />
  } else {
    return <StudentDashboard dashboardData={dashboardData} session={session} />
  }
}

function AdminDashboard({ dashboardData, session }: { dashboardData: DashboardData; session: any }) {
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch('/api/notifications/stats')
        if (response.ok) {
          const data = await response.json()
          const userReadKey = `readNotifications_${session?.user?.id}`
          const readNotifications = JSON.parse(localStorage.getItem(userReadKey) || '[]')
          const unread = Math.max(0, data.total - readNotifications.length)
          setNotificationCount(unread)
        }
      } catch (error) {
        console.error('Error fetching notification count:', error)
      }
    }
    fetchNotificationCount()
  }, [])

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
          {/* White frosted glass container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/60">
            {/* Welcome Section */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 drop-shadow-lg">
                OCA Admin Dashboard
              </h1>
              <p className="mt-2 text-sm sm:text-base text-gray-700 drop-shadow">
                Welcome back, {dashboardData.user.name} • Office of Co-Curricular Activities
              </p>
            </div>

    

        {/* Admin Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Club Management</CardTitle>
              <CardDescription>Manage all university clubs and their activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Link href="/admin/clubs">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="h-4 w-4 mr-2" />
                    Manage All Clubs
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Pending Club Applications
                </Button>
                
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Event Management</CardTitle>
              <CardDescription>Oversee all club events and activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Link href="/admin/events">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    All Events
                  </Button>
                </Link>
                <Link href="/admin/event-approvals">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2" />
                    Event Approvals
                  </Button>
                </Link>
                <Link href="/admin/budget">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="h-4 w-4 mr-2" />
                    Budget Management
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification and Message Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Communication</CardTitle>
              <CardDescription>Send notifications and messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Link href="/admin/notifications">
                  <Button variant="outline" className="w-full justify-start">
                    <Megaphone className="h-4 w-4 mr-2" />
                    Send Notifications
                  </Button>
                </Link>
                <Link href="/notifications">
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                    {notificationCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {notificationCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Recent platform activity will be displayed here.</p>
          </CardContent>
        </Card>
        
          </div>
        </div>
      </div>
    </div>
  )
}

function ClubLeaderDashboard({ dashboardData, session }: { dashboardData: DashboardData; session: any }) {
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch('/api/notifications/stats')
        if (response.ok) {
          const data = await response.json()
          const userReadKey = `readNotifications_${session?.user?.id}`
          const readNotifications = JSON.parse(localStorage.getItem(userReadKey) || '[]')
          const unread = Math.max(0, data.total - readNotifications.length)
          setNotificationCount(unread)
        }
      } catch (error) {
        console.error('Error fetching notification count:', error)
      }
    }
    fetchNotificationCount()
  }, [])

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
          {/* White frosted glass container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/60">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 drop-shadow-lg">
            Club Leader Dashboard
          </h1>
          <p className="mt-2 text-gray-700">
            Welcome back, {dashboardData.user.name}
            {dashboardData.user.studentId && ` • Student ID: ${dashboardData.user.studentId}`}
            {dashboardData.user.department && ` • ${dashboardData.user.department}`}
          </p>
        </div>

        {/* Club Leader Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">My Clubs</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.myClubs.length}</div>
              <p className="text-xs text-muted-foreground">Clubs you lead</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {dashboardData.stats?.pendingMemberships}
              </div>
              <p className="text-xs text-muted-foreground">Waiting for approval</p>
            </CardContent>
          </Card>
          
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.myClubs.reduce((total, club) => total + club.memberCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Across all clubs</p>
            </CardContent>
          </Card>
        </div>

          {/* Quick Actions for Club Leaders */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your clubs and events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                <Link href="/club-leader/memberships">
                  <Button variant="outline" className="w-full justify-start">
                    <Clock className="h-4 w-4 mr-2 text-orange-600" />
                    Review Applications
                    {(dashboardData.stats?.pendingMemberships || 3) > 0 && (
                      <span className="ml-auto bg-orange-100 text-orange-600 px-2 py-1 rounded-full text-xs">
                        {dashboardData.stats?.pendingMemberships || 3}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/club-dashboard">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Members
                  </Button>
                </Link>
                <Link href="/club-leader/email-members">
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Emails
                  </Button>
                </Link>
                <Link href="/events/create">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="h-4 w-4 mr-2" />
                    Create New Event
                  </Button>
                </Link>
                <Link href="/club-leader/edit-club">
                    <Button variant="outline" className="w-full justify-start">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Club Info
                    </Button>
                </Link>
                <Link href="/notifications">
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                    {notificationCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {notificationCount}
                      </span>
                    )}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        

        {/* My Clubs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Clubs as Leader */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Clubs</CardTitle>
                  <CardDescription>Clubs you&apos;re leading</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.myClubs.map((club) => (
                  <div key={club.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{club.name}</h3>
                        <p className="text-xs text-gray-200 mt-1">{club.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {club.memberCount} members
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StudentDashboard({ dashboardData, session }: { dashboardData: DashboardData; session: any }) {
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const response = await fetch('/api/notifications/stats')
        if (response.ok) {
          const data = await response.json()
          const userReadKey = `readNotifications_${session?.user?.id}`
          const readNotifications = JSON.parse(localStorage.getItem(userReadKey) || '[]')
          const unread = Math.max(0, data.total - readNotifications.length)
          setNotificationCount(unread)
        }
      } catch (error) {
        console.error('Error fetching notification count:', error)
      }
    }
    fetchNotificationCount()
  }, [])
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
          {/* White frosted glass container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/60">
            {/* Welcome Section */}
            <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 drop-shadow-lg">
            Welcome back, {dashboardData.user.name}!
          </h1>
          <p className="mt-2 text-gray-700">
            {dashboardData.user.studentId && `Student ID: ${dashboardData.user.studentId}`}
            {dashboardData.user.department && ` • ${dashboardData.user.department}`}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clubs Joined</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.clubsJoined}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Events Attending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.eventsAttending}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.stats.pendingApplications}</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Clubs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Clubs</CardTitle>
                  
                  <CardDescription>Clubs you&apos;re currently a member of</CardDescription>
                </div>
                <Link href="/clubs">
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Discover More
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.myClubs.map((club) => (
                  <div key={club.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{club.name}</h3>
                        <p className="text-xs text-gray-200 mt-1">{club.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {club.memberCount} members
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Events you&apos;ve RSVP&apos;d to</CardDescription>
                </div>
                <Link href="/events">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentEvents.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <h3 className="font-semibold text-sm">{event.title}</h3>
                    <p className="text-xs text-gray-700 mt-1">by {event.clubName}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(event.startDate).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {event.venue}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription></CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/clubs">
                  <Button variant="outline" className="w-full justify-start">
                    <Building2 className="h-4 w-4 mr-2" />
                    Explore Clubs
                  </Button>
                </Link>
                <Link href="/events">
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="h-4 w-4 mr-2" />
                    Browse Events
                  </Button>
                </Link>
                <Link href="/notifications">
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                    {notificationCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {notificationCount}
                      </span>
                    )}
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Update Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}
