'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, Search, UserCheck, UserX, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  studentId?: string
  department?: string
  phone?: string
}

interface Club {
  id: string
  name: string
  description?: string
}

interface Membership {
  id: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  createdAt: string
  user: User
  club: Club
}

interface Stats {
  total: number
  active: number
  pending: number
  rejected: number
}

export default function AdminMembershipsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, pending: 0, rejected: 0 })
  const [clubs, setClubs] = useState<Club[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [clubFilter, setClubFilter] = useState('all')

  // Redirect if not an admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchMemberships = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (clubFilter !== 'all') params.append('clubId', clubFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/admin/memberships?${params}`)
      if (!response.ok) throw new Error('Failed to fetch memberships')
      
      const data = await response.json()
      setMemberships(data.memberships)
      setStats(data.stats)
      setClubs(data.clubs)
    } catch (error) {
      console.error('Error fetching memberships:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMemberships()
  }, [statusFilter, clubFilter, searchTerm, fetchMemberships])

  const handleMembershipAction = async (membershipId: string, action: 'approve' | 'reject' | 'remove') => {
    if (processingId) return
    
    console.log('Handling membership action:', { membershipId, action })
    setProcessingId(membershipId)
    try {
      const requestBody = {
        membershipId,
        action
      }
      console.log('Sending request with body:', requestBody)
      
      const response = await fetch('/api/admin/memberships', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (!response.ok) {
        console.error('Request failed:', responseData)
        throw new Error(responseData.error || 'Failed to update membership')
      }
      
      // Refresh the data
      await fetchMemberships()
    } catch (error) {
      console.error('Error updating membership:', error)
      alert(`Failed to update membership: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACCEPTED':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'PENDING':
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading memberships...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url('/images/background.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Very light overlay for maximum contrast */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Content container */}
      <div className="relative z-10 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* White frosted glass container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/60">
            {/* Header */}
            <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Membership Management</h1>
          <p className="mt-2 text-gray-600">
            Oversee all club memberships and applications
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Members</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                </div>
                <UserCheck className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rejected</p>
                  <p className="text-2xl font-bold">{stats.rejected}</p>
                </div>
                <UserX className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, email, or student ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Active</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                value={clubFilter}
                onChange={(e) => setClubFilter(e.target.value)}
                className="px-3 py-2 border rounded-md bg-white text-sm"
              >
                <option value="all">All Clubs</option>
                {clubs.map((club) => (
                  <option key={club.id} value={club.id}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Memberships Table */}
        <Card>
          <CardHeader>
            <CardTitle>Memberships ({memberships.length})</CardTitle>
            <CardDescription>
              Manage all club memberships and applications
            </CardDescription>
          </CardHeader>
          <CardContent>
            {memberships.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No memberships found</h3>
                <p className="text-gray-600">
                  No memberships match your current filters.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Member</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Club</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Applied</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberships.map((membership) => (
                      <tr key={membership.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium text-gray-900">{membership.user.name}</div>
                            <div className="text-sm text-gray-500">{membership.user.email}</div>
                            {membership.user.studentId && (
                              <div className="text-sm text-gray-500">ID: {membership.user.studentId}</div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{membership.club.name}</div>
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(membership.status)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-500">
                            {new Date(membership.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {membership.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleMembershipAction(membership.id, 'approve')}
                                  disabled={processingId === membership.id}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleMembershipAction(membership.id, 'reject')}
                                  disabled={processingId === membership.id}
                                  className="text-red-600 border-red-300 hover:bg-red-50"
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMembershipAction(membership.id, 'remove')}
                              disabled={processingId === membership.id}
                              className="text-red-600 border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
