'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Mail, Search, Users, Send, MessageSquare } from 'lucide-react'
import EmailForm from '@/components/email/EmailForm'
import BulkEmailModal from '@/components/email/BulkEmailModal'

interface Member {
  id: string
  membershipId: string
  name: string
  email: string
  role: string
  department: string
  semester: string
  club: {
    id: string
    name: string
  }
}

interface Club {
  id: string
  name: string
  memberCount: number
}

export default function EmailMembersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [clubs, setClubs] = useState<Club[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [showBulkEmailModal, setShowBulkEmailModal] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  //authentication
  useEffect(() => {
    if (status === 'loading') return
    if (!session || (session.user.role !== 'CLUB_LEADER' && session.user.role !== 'ADMIN')) {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  useEffect(() => {
    const fetchMembersAndClubs = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/club-leader/memberships')
        
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        
        const data = await response.json()
        
        
        const approvedMemberships = data.approvedMemberships || []
        const approvedMembers = approvedMemberships.map((membership: any) => ({
          id: membership.user?.id || membership.id, // Use user ID for email sending
          membershipId: membership.id, // Keep membership ID for unique keys
          name: membership.user?.name || 'Unknown Member',
          email: membership.user?.email || 'No email',
          role: membership.role,
          department: membership.user?.department,
          semester: membership.user?.semester,
          club: {
            id: membership.club?.id,
            name: membership.club?.name
          }
        }))
        
        //handling members who are in multiple clubs led by the leader
        const uniqueMembers = approvedMembers.filter((member: any, index: number, array: any[]) => 
          array.findIndex((m: any) => m.id === member.id) === index
        )
        
        setMembers(uniqueMembers)
        setFilteredMembers(uniqueMembers)
        
        // Get clubs with member counts
        const clubsData = data.clubs || []
        const clubsWithCounts = clubsData.map((club: any) => ({
          id: club.id,
          name: club.name,
          memberCount: approvedMembers.filter((member: Member) => member.club?.id === club.id).length
        }))
        setClubs(clubsWithCounts)
        
      } catch (error) {
        console.error('Error fetching data:', error)
        showNotification('error', 'Failed to load members and clubs')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchMembersAndClubs()
    }
  }, [session])

  // Filter members based on search keywords
  useEffect(() => {
    let filtered = members
    if (searchTerm) {
      filtered = filtered.filter(member =>
        (member.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.club?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (member.department || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    setFilteredMembers(filtered)
  }, [searchTerm, members])

  const handleEmailSent = (result: any) => {
    showNotification('success', 'Email sent successfully!')
    setSelectedMember(null)
  }

  const handleBulkEmailSent = (result: any) => {
    showNotification('success', `Bulk email completed! ${result.summary.sent} sent, ${result.summary.skipped} skipped, ${result.summary.failed} failed.`)
    setShowBulkEmailModal(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading members...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Email Club Members</h1>
          <p className="mt-2 text-gray-600">
            Send emails to individual members or broadcast to all club members
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={() => setShowBulkEmailModal(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Bulk Email
                </Button>
                <div className="text-sm text-gray-600 flex items-center">
                  Send emails to all members of your clubs or specific clubs
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Members List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Club Members ({filteredMembers.length})
                </CardTitle>
                <CardDescription>
                  Select a member to send an individual email
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search members by name, email, or club..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Members List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredMembers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {members.length === 0 ? 'No approved members' : 'No members match your search'}
                      </h3>
                      <p className="text-gray-600">
                        {members.length === 0 
                          ? 'No approved members found in your clubs.' 
                          : 'Try adjusting your search terms.'
                        }
                      </p>
                    </div>
                  ) : (
                    filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedMember?.id === member.id
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white hover:bg-gray-50 border-gray-200'
                        }`}
                        onClick={() => setSelectedMember(member)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{member.name || 'Unknown Member'}</h4>
                            <p className="text-sm text-gray-600">{member.email || 'No email'}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {member.club?.name || 'Unknown Club'}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {member.role || 'Member'}
                              </Badge>
                            </div>
                          </div>
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Email Form */}
          <div>
            <EmailForm
              memberInfo={selectedMember ? {
                id: selectedMember.id,
                name: selectedMember.name || 'Unknown Member',
                email: selectedMember.email || '',
                clubName: selectedMember.club?.name || 'Unknown Club'
              } : undefined}
              onEmailSent={handleEmailSent}
            />
          </div>
        </div>

        {/* Bulk Email Modal */}
        <BulkEmailModal
          isOpen={showBulkEmailModal}
          onClose={() => setShowBulkEmailModal(false)}
          clubs={clubs}
          onEmailSent={handleBulkEmailSent}
        />
          </div>
        </div>
      </div>
    </div>
  )
}
