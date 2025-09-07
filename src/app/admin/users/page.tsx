'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, Search, Mail, Phone, GraduationCap, Building2, User, Eye, X, Trash2 } from 'lucide-react'

interface UserMembership {
  id: string
  status: string
  role: string
  joinedAt: string | null
  club: {
    id: string
    name: string
    department: string
    status: string
  }
}

interface UserAccount {
  id: string
  name: string | null
  email: string
  role: string
  studentId: string | null
  department: string | null
  semester: string | null
  phone: string | null
  createdAt: string
  emailVerified: string | null
  memberships: UserMembership[]
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<UserAccount[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserAccount[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  // Redirect if not an admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/users')
        
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }
        
        const data = await response.json()
        setUsers(data.users)
        setFilteredUsers(data.users)
      } catch (error) {
        console.error('Error fetching users:', error)
        alert('Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchUsers()
    }
  }, [session])

  useEffect(() => {
    let filtered = users

    // Filter by role
    if (roleFilter !== 'ALL') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.studentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.department?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }, [searchTerm, roleFilter, users])

  const handleViewUser = (user: UserAccount) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const handleCloseModal = () => {
    setSelectedUser(null)
    setShowUserModal(false)
  }

  const handleDeleteUser = async (userId: string, userName: string | null, userEmail: string) => {
    const displayName = userName || userEmail
    if (!window.confirm(`Are you sure you want to delete the user "${displayName}"? This action cannot be undone and will remove all their memberships.`)) {
      return
    }

    setDeletingUserId(userId)
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }

      // Remove user from local state
      setUsers(prevUsers => prevUsers.filter(u => u.id !== userId))
      setFilteredUsers(prevUsers => prevUsers.filter(u => u.id !== userId))
      
      alert('User deleted successfully')
    } catch (error) {
      console.error('Error deleting user:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeletingUserId(null)
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>
      case 'STUDENT':
        return <Badge className="bg-blue-100 text-blue-800">Student</Badge>
      case 'CLUB_LEADER':
        return <Badge className="bg-purple-100 text-purple-800">Club Leader</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const getMembershipStatusBadge = (status: string) => {
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
      <div className="min-h-screen flex items-center justify-center relative">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url('/images/bracu-campus.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        ></div>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading users...</p>
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
      {/* Very light overlay for maximum contrast */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Content container */}
      <div className="relative z-10 min-h-screen flex flex-col py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          {/* White frosted glass container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/60">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-700">
                View and manage all registered users
              </p>
            </div>

            {/* Filters and Stats */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by name, email, student ID, or department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/90"
                  />
                </div>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md bg-white/90 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value="STUDENT">Students</option>
                  <option value="CLUB_LEADER">Club Leaders</option>
                  <option value="ADMIN">Admins</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/90 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                        <p className="text-2xl font-bold">{users.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/90 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Students</p>
                        <p className="text-2xl font-bold">
                          {users.filter(user => user.role === 'STUDENT').length}
                        </p>
                      </div>
                      <GraduationCap className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/90 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Club Leaders</p>
                        <p className="text-2xl font-bold">
                          {users.filter(user => user.role === 'CLUB_LEADER').length}
                        </p>
                      </div>
                      <Building2 className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/90 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Admins</p>
                        <p className="text-2xl font-bold">
                          {users.filter(user => user.role === 'ADMIN').length}
                        </p>
                      </div>
                      <User className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Users Table */}
            <Card className="bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle>All Users</CardTitle>
                <CardDescription>
                  Showing {filteredUsers.length} of {users.length} users
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredUsers.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium">User</th>
                          <th className="text-left p-4 font-medium">Role</th>
                          <th className="text-left p-4 font-medium">Student ID</th>
                          <th className="text-left p-4 font-medium">Department</th>
                          <th className="text-left p-4 font-medium">Memberships</th>
                          <th className="text-left p-4 font-medium">Joined</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{user.name || 'No Name'}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              {getRoleBadge(user.role)}
                            </td>
                            <td className="p-4">
                              <span className="text-sm">{user.studentId || 'N/A'}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-sm">{user.department || 'N/A'}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-sm font-medium">
                                {user.memberships.length} club{user.memberships.length !== 1 ? 's' : ''}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-gray-500">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewUser(user)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View Details
                                </Button>
                                {user.role !== 'ADMIN' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-red-600 border-red-300 hover:bg-red-50"
                                    onClick={() => handleDeleteUser(user.id, user.name, user.email)}
                                    disabled={deletingUserId === user.id}
                                  >
                                    {deletingUserId === user.id ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                                    ) : (
                                      <Trash2 className="h-4 w-4 mr-1" />
                                    )}
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                    <p className="text-gray-600">
                      Try adjusting your search terms or filters.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold">User Details</h2>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCloseModal}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {/* Personal Information */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedUser.name || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <p className="mt-1 text-sm text-gray-900 flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {selectedUser.email}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <div className="mt-1">
                              {getRoleBadge(selectedUser.role)}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Student ID</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedUser.studentId || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Department</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedUser.department || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Semester</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedUser.semester || 'Not provided'}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <p className="mt-1 text-sm text-gray-900 flex items-center">
                              {selectedUser.phone ? (
                                <>
                                  <Phone className="h-4 w-4 mr-1" />
                                  {selectedUser.phone}
                                </>
                              ) : (
                                'Not provided'
                              )}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email Verified</label>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedUser.emailVerified ? 'Yes' : 'No'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Club Memberships */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Club Memberships ({selectedUser.memberships.length})</h3>
                        {selectedUser.memberships.length > 0 ? (
                          <div className="space-y-3">
                            {selectedUser.memberships.map((membership) => (
                              <div key={membership.id} className="border rounded-lg p-4 bg-gray-50">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium">{membership.club.name}</h4>
                                    <p className="text-sm text-gray-600">{membership.club.department}</p>
                                  </div>
                                  <div className="text-right">
                                    {getMembershipStatusBadge(membership.status)}
                                    <p className="text-sm text-gray-500 mt-1">{membership.role}</p>
                                  </div>
                                </div>
                                {membership.joinedAt && (
                                  <p className="text-sm text-gray-500 mt-2">
                                    Joined: {new Date(membership.joinedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">Not a member of any clubs</p>
                        )}
                      </div>

                      {/* Account Information */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Account Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Account Created</label>
                            <p className="mt-1 text-sm text-gray-900">
                              {new Date(selectedUser.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">User ID</label>
                            <p className="mt-1 text-sm text-gray-500 font-mono">{selectedUser.id}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end mt-6 pt-4 border-t">
                      <Button
                        type="button"
                        onClick={handleCloseModal}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
