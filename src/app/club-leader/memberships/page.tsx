'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Users, Search, Check, X, Clock, Mail, GraduationCap,Building2,Calendar,UserCog, Send} from 'lucide-react'
// import BulkEmailModal from '@/components/email/BulkEmailModal'
import dynamic from 'next/dynamic'

// Dynamic import to fix module loading issue
const BulkEmailModal = dynamic(() => import('@/components/email/BulkEmailModal'), {
  ssr: false
})

interface PendingMembership {
  id: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    studentId: string
    department: string
    semester: string
  }
  club: {
    id: string
    name: string
    department: string
  }
}

export default function ClubLeaderMembershipsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [memberships, setMemberships] = useState<PendingMembership[]>([]) //pending memberships array
  const [approvedMemberships, setApprovedMemberships] = useState<any[]>([]) //approved memberships array
  const [filteredMemberships, setFilteredMemberships] = useState<PendingMembership[]>([]) //filtered results
  const [clubs, setClubs] = useState<any[]>([]) //clubs managed by leader
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedMemberships, setSelectedMemberships] = useState<Set<string>>(new Set())
  const [processing, setProcessing] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const [roleAssignments, setRoleAssignments] = useState<Map<string, string>>(new Map())//key-value pair for roles
  const [showRoleSelection, setShowRoleSelection] = useState(false)
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false)

  //redirecting if not a club leader or admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user.role !== 'CLUB_LEADER' && session.user.role !== 'ADMIN')) {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchPendingMemberships = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/club-leader/memberships')
        
        if (!response.ok) {
          throw new Error('Failed to fetch memberships')
        }
        const data = await response.json() //converting server response to json object and storing actual membership data
        setMemberships(data.pendingMemberships || [])
        setFilteredMemberships(data.pendingMemberships || [])
        setApprovedMemberships(data.approvedMemberships || [])
        setClubs(data.clubs || [])
      } catch (error) {
        console.error('Error fetching memberships:', error)
        showNotification('error', 'Failed to load membership applications')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchPendingMemberships()
    }
  }, [session])

  useEffect(() => {
    let filtered = memberships //copy of memberships
    //filtering based on search terms
    if (searchTerm) {
      filtered = filtered.filter(membership =>
        membership.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        membership.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        membership.user.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (membership.club?.name && membership.club.name.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }
    setFilteredMemberships(filtered) //filtered memberships
  }, [searchTerm, memberships])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }
  //function for selecting applications
  const handleSelectMembership = (membershipId: string) => {
    const newSelected = new Set(selectedMemberships) //copy of selected memberships
    if (newSelected.has(membershipId)) {
      newSelected.delete(membershipId)
    } else {
      newSelected.add(membershipId)
    }
    setSelectedMemberships(newSelected)
  }
  //function for selecting all applications
  const handleSelectAll = () => {
    if (!filteredMemberships || filteredMemberships.length === 0) {
      setSelectedMemberships(new Set())
      return
    }
    
    if (selectedMemberships.size === filteredMemberships.length) {
      setSelectedMemberships(new Set()) // Deselect all if already selected
    } else {
      setSelectedMemberships(new Set(filteredMemberships.map(m => m.id))) //selecting extracting IDs
    }
  }
  //function to approve or reject all at once
  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedMemberships.size === 0) {
      showNotification('error', 'Please select at least one membership to process')
      return
    }
    setProcessing(true)
    // assigning roles
    try {
      //converting selected memberships set to an array of role assignments
      const roleAssignmentsArray = Array.from(selectedMemberships).map(membershipId => ({ //object with id and role
        membershipId,
        role: roleAssignments.get(membershipId) || 'General Member'
      })).filter(assignment => assignment.role !== 'General Member') //sending non-default roles

      const requestBody: any = {
        membershipIds: Array.from(selectedMemberships),
        action: action
      }

      //sending approved membership ID and role to server
      if (action === 'approve' && roleAssignmentsArray.length > 0) {
        requestBody.roleAssignments = roleAssignmentsArray
      }

      const response = await fetch('/api/club-leader/memberships', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody), //converting object to JSON string
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to process memberships')
      }

      const result = await response.json()
      //removing processed memberships from the state and updating memberships array
      setMemberships(prev => 
        prev.filter(m => !selectedMemberships.has(m.id))
      )
      //clearing selected memberships and roles
      setSelectedMemberships(new Set())
      setRoleAssignments(new Map()) 
      setShowRoleSelection(false)
      showNotification('success', result.message)

      //redirecting to club dashboard after approval/rejection
      router.push('/club-dashboard')
    } catch (error) {
      console.error('Error processing memberships:', error)
      showNotification('error', error instanceof Error ? error.message : 'Failed to process memberships')
    } finally {
      setProcessing(false)
    }
  }
  //function for role assigning
  const handleRoleChange = (membershipId: string, role: string) => {
    setRoleAssignments(prev => {
      const newMap = new Map(prev) //creating copy of current roles
      if (role === 'General Member') {
        newMap.delete(membershipId) 
      } else {
        newMap.set(membershipId, role)
      }
      return newMap
    })
  }

  const handleApproveWithRoles = () => {
    if (selectedMemberships.size === 0) {
      showNotification('error', 'Please select at least one membership to approve')
      return
    }
    setShowRoleSelection(true) //show role assignment popup
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading membership applications...</p>
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
          {/* White frosted glass container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/60">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Membership Applications</h1>
              <p className="mt-2 text-gray-700">
                Review and approve student applications to join your clubs
              </p>
              {clubs.length > 1 && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-medium">Managing {clubs.length} clubs:</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {clubs.map((club) => (
                      <span key={club.id} className="inline-block px-3 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                        {club.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

        

        {/* Search and Bulk Actions */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by name, email, student ID, or club..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)} //updates search term with changes
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleSelectAll}
                disabled={!filteredMemberships || filteredMemberships.length === 0}
              >
                {filteredMemberships && selectedMemberships.size === filteredMemberships.length ? 'Deselect All' : 'Select All'}
              </Button>
              
              <Button
                onClick={handleApproveWithRoles}
                disabled={selectedMemberships.size === 0 || processing}
                className="bg-green-600 hover:bg-green-700"
              >
                <UserCog className="h-4 w-4 mr-2" />
                Approve with Roles ({selectedMemberships.size})
              </Button>
              
              <Button
                variant="outline"
                onClick={() => handleBulkAction('reject')}
                disabled={selectedMemberships.size === 0 || processing}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Reject ({selectedMemberships.size})
              </Button>
              
              <Button
                onClick={() => setShowBulkEmailModal(true)}
                disabled={approvedMemberships.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Email Members
              </Button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Applications</p>
                  <p className="text-2xl font-bold">{memberships?.length || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Selected</p>
                  <p className="text-2xl font-bold">{selectedMemberships.size}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unique Clubs</p>
                  <p className="text-2xl font-bold">
                    {clubs.length > 0 ? clubs.length : 'N/A'}
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role Assignment Modal */}
        {showRoleSelection && (
          <Card className="mb-8 border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-800">Assign Roles for Selected Members</CardTitle>
              <CardDescription className="text-green-700">
                Choose roles for each member before approving their applications. Default role is "General Member".
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from(selectedMemberships).map(membershipId => {
                  const membership = memberships.find(m => m.id === membershipId)
                  if (!membership) return null
                  
                  return (
                    <div key={membershipId} className="flex items-center justify-between p-4 bg-white rounded-lg border">
                      <div>
                        <h4 className="font-medium">{membership.user.name}</h4>
                        <p className="text-sm text-gray-600">{membership.user.email}</p>
                        <p className="text-sm text-green-600">Club: {membership.club.name}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`role-${membershipId}`} className="text-sm font-medium">
                          Role:
                        </Label>
                        <select
                          id={`role-${membershipId}`}
                          value={roleAssignments.get(membershipId) || 'General Member'}
                          onChange={(e) => handleRoleChange(membershipId, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        >
                          <option value="General Member">General Member</option>
                          <option value="Executive">Executive</option>
                          <option value="Senior Executive">Senior Executive</option>
                        </select>
                      </div>
                    </div>
                  )
                })}
              </div>
              
              <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                <Button
                  onClick={() => handleBulkAction('approve')}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="h-4 w-4 mr-2" />
                  {processing ? 'Processing...' : 'Confirm Approval'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRoleSelection(false)
                    setRoleAssignments(new Map())
                  }}
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Membership Applications */}
        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredMemberships?.length || 0})</CardTitle>
            <CardDescription>
              Students waiting for approval to join clubs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!filteredMemberships || filteredMemberships.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {!memberships || memberships.length === 0 ? 'No pending applications' : 'No applications match your search'}
                </h3>
                <p className="text-gray-600">
                  {!memberships || memberships.length === 0 
                    ? 'All caught up! No students are waiting for approval at the moment.'
                    : 'Try adjusting your search terms to find specific applications.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMemberships.map((membership) => (
                  <div 
                    key={membership.id} 
                    className={`border rounded-lg p-6 transition-colors ${
                      selectedMemberships.has(membership.id) 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedMemberships.has(membership.id)}
                          onChange={() => handleSelectMembership(membership.id)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-lg font-semibold">{membership.user.name}</h3>
                            <Badge variant="outline" className="text-orange-600">
                              <Clock className="h-3 w-3 mr-1" />
                              Pending
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{membership.user.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4" />
                              <span>{membership.user.studentId}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <span>{membership.user.department}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>{membership.user.semester}</span>
                            </div>
                          </div>
                          
                          <div className="mt-3 pt-3 border-t border-gray-200">
                            <div className="flex items-center justify-between text-sm">
                              <div>
                                <span className="font-medium">Applying to:</span> {membership.club?.name || 'Unknown Club'}
                                {membership.club?.department && (
                                <Badge variant="secondary" className="ml-2">
                                  {membership.club.department}
                                </Badge>
                                )}
                              </div>
                              <div className="text-gray-500">
                                Applied {formatDate(membership.createdAt)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedMemberships(new Set([membership.id]))
                            handleApproveWithRoles()
                          }}
                          disabled={processing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <UserCog className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedMemberships(new Set([membership.id]))
                            handleBulkAction('reject')
                          }}
                          disabled={processing}
                          className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Email Modal */}
        <BulkEmailModal
          isOpen={showBulkEmailModal}
          onClose={() => setShowBulkEmailModal(false)}
          clubs={clubs.map(club => ({
            id: club.id,
            name: club.name,
            memberCount: approvedMemberships.filter(m => m.club.id === club.id).length
          }))}
          onEmailSent={(result) => {
            showNotification('success', `Bulk email completed! ${result.summary.sent} sent, ${result.summary.skipped} skipped, ${result.summary.failed} failed.`)
            setShowBulkEmailModal(false)
          }}
        />
          </div>
        </div>
      </div>
    </div>
  )
}