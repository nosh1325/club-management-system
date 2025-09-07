'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Building2, Users, Search, Edit, Trash2, Plus, X, User2 } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string;
  name: string;
  email: string;
}

interface Club {
  id: string
  name: string
  description: string
  department: string
  status: string
  foundedYear: number
  memberCount: number
  eventCount: number
  leader: {
    name: string
    email: string
  }
}

export default function AdminClubsPage() {
  
  const [showLeaderModal, setShowLeaderModal] = useState<null | string>(null); // clubId
  const [users, setUsers] = useState<User[]>([]);
  const [selectedLeader, setSelectedLeader] = useState<string>('');
  const [isLeaderUpdating, setIsLeaderUpdating] = useState(false);

  //Showing club members for changing leader
  useEffect(() => {
    if (showLeaderModal) {
      fetch(`/api/admin/clubs/${showLeaderModal}/members`)
        .then(async res => {
          try {
            console.log('Fetching members for clubId:', showLeaderModal, 'Status:', res.status);
            if (!res.ok) {
              const errorText = await res.text();
              console.error('Fetch error:', res.status, errorText);
              throw new Error('Failed to fetch members');
            }
            const data = await res.json();
            console.log('Fetched members:', data);
            setUsers(data.members || []);
          } catch (err) {
            console.error('Error in fetch:', err);
            setUsers([]);
          }
        })
        .catch(err => {
          console.error('Network or fetch error:', err);
          setUsers([]);
        });
    }
  }, [showLeaderModal]);

  const handleOpenLeaderModal = (clubId: string) => {
    setShowLeaderModal(clubId);
    setSelectedLeader('');
  };

  const handleCloseLeaderModal = () => {
    setShowLeaderModal(null);
    setSelectedLeader('');
  };

  const handleSetLeader = async () => {
    if (!showLeaderModal || !selectedLeader) return;
    setIsLeaderUpdating(true);
    try {
      const res = await fetch(`/api/admin/clubs/${showLeaderModal}/set-leader`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderId: selectedLeader })
      });
      if (!res.ok) throw new Error('Failed to set leader');
     
      setClubs(prev => prev.map(club => {
        if (club.id === showLeaderModal) {
          const user = users.find(u => u.id === selectedLeader);
          return {
            ...club,
            leader: user ? { name: user.name, email: user.email } : club.leader
          };
        }
        return club;
      }));
      handleCloseLeaderModal();
    } catch (e) {
      alert('Error setting leader');
    } finally {
      setIsLeaderUpdating(false);
    }
  };
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clubs, setClubs] = useState<Club[]>([])
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingClub, setEditingClub] = useState<Club | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    department: '',
    status: '',
    foundedYear: '',
    vision: '',
    mission: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/clubs')
        
        if (!response.ok) {
          throw new Error('Failed to fetch clubs')
        }
        
        const data = await response.json()
        setClubs(data.clubs)
        setFilteredClubs(data.clubs)
      } catch (error) {
        console.error('Error fetching clubs:', error)
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchClubs()
    }
  }, [session])

  useEffect(() => {
    let filtered = clubs

    if (searchTerm) {
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.department.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredClubs(filtered)
  }, [searchTerm, clubs])

  const handleEditClub = (club: Club) => {
    setEditingClub(club)
    setEditForm({
      name: club.name,
      description: club.description || '',
      department: club.department,
      status: club.status || 'ACTIVE',
      foundedYear: club.foundedYear?.toString() || '',
      vision: '',
      mission: ''
    })
  }

  const handleCloseEdit = () => {
    setEditingClub(null)
    setEditForm({
      name: '',
      description: '',
      department: '',
      status: '',
      foundedYear: '',
      vision: '',
      mission: ''
    })
  }

  const handleUpdateClub = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingClub) return

    setIsSubmitting(true)

    // Basic validation
    if (!editForm.name || !editForm.department || !editForm.status) {
        alert('Please fill in all required fields.')
        setIsSubmitting(false)
        return
    }

    try {
        const response = await fetch(`/api/admin/clubs/${editingClub.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                ...editForm,
                foundedYear: editForm.foundedYear ? parseInt(editForm.foundedYear, 10) : null
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Failed to update club')
        }

        const updatedClub = await response.json()

        setClubs(prevClubs =>
            prevClubs.map(c => (c.id === updatedClub.id ? { ...c, ...updatedClub } : c))
        )
        setEditingClub(null)
    } catch (error) {
        console.error('Error updating club:', error)
        alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
        setIsSubmitting(false)
    }
  }

  const handleDeleteClub = async (clubId: string, clubName: string) => {
    if (!window.confirm(`Are you sure you want to delete the club "${clubName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/clubs`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ clubId })
      })

      if (!response.ok) {
        const errorData: { error: string } = await response.json()
        throw new Error(errorData.error || 'Failed to delete club')
      }

      setClubs(prevClubs => prevClubs.filter(c => c.id !== clubId))
    } catch (error) {
      console.error('Error deleting club:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        {/* Background with blur */}
        <div 
          className="absolute inset-0"
          
        ></div>
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading clubs...</p>
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
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 sm:p-8 shadow-2xl border border-white/20 transition-all duration-300 hover:bg-white/15">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white drop-shadow-lg">Club Management</h1>
                <p className="mt-2 text-gray-200 drop-shadow">
                  Manage all university clubs and their status
                </p>
              </div>
              <Link href="/admin/clubs/add">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Club
                </Button>
              </Link>
            </div>

        {/* Search and Stats */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search clubs by name, description, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card className="bg-white/90 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Clubs</p>
                    <p className="text-2xl font-bold">{clubs.length}</p>
                  </div>
                  <Building2 className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Clubs</p>
                    <p className="text-2xl font-bold">
                      {clubs.filter(club => club.status === 'ACTIVE').length}
                    </p>
                  </div>
                  <Building2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold">
                      {clubs.reduce((total, club) => total + club.memberCount, 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/90 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Categories</p>
                    <p className="text-2xl font-bold">
                      {new Set(clubs.map(club => club.department)).size}
                    </p>
                  </div>
                  <Building2 className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Clubs Table */}
        <Card className="bg-white/90 backdrop-blur">
          <CardHeader>
            <CardTitle>All Clubs</CardTitle>
            <CardDescription>
              Showing {filteredClubs.length} of {clubs.length} clubs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClubs.map((club) => (
                <div key={club.id} className="border rounded-lg p-6 bg-white/80 backdrop-blur">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{club.name}</h3>
                        <Badge 
                          variant={club.status === 'ACTIVE' ? 'default' : 'secondary'}
                        >
                          {club.status}
                        </Badge>
                        <Badge variant="outline">
                          {club.department}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-3">{club.description}</p>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div>
                          <span className="font-medium">Leader:</span> {club.leader?.name || 'No Leader'}
                        </div>
                        <div>
                          <span className="font-medium">Members:</span> {club.memberCount}
                        </div>
                        <div>
                          <span className="font-medium">Events:</span> {club.eventCount}
                        </div>
                        <div>
                          <span className="font-medium">Founded:</span> {club.foundedYear}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditClub(club)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenLeaderModal(club.id)}
                      >
                        <User2 className="h-4 w-4 mr-1" />
                        Change Leader
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-red-600 border-red-300 hover:bg-red-50"
                        onClick={() => handleDeleteClub(club.id, club.name)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
             
              {showLeaderModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold">Set Club Leader</h2>
                      <Button type="button" variant="ghost" size="sm" onClick={handleCloseLeaderModal}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mb-4">
                      <label className="block mb-2 font-medium">Select a user to set as leader:</label>
                      {users.length === 0 ? (
                        <div className="text-gray-500 text-sm">No members found for this club.</div>
                      ) : (
                        <select
                          className="w-full border rounded px-3 py-2"
                          value={selectedLeader}
                          onChange={e => setSelectedLeader(e.target.value)}
                          disabled={isLeaderUpdating}
                        >
                          <option value="">-- Select User --</option>
                          {users.map(user => (
                            <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={handleCloseLeaderModal} disabled={isLeaderUpdating}>Cancel</Button>
                      <Button type="button" onClick={handleSetLeader} disabled={!selectedLeader || isLeaderUpdating}>
                        {isLeaderUpdating ? 'Saving...' : 'Set Leader'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {filteredClubs.length === 0 && (
          <div className="text-center py-12 bg-white/90 backdrop-blur rounded-lg">
            <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No clubs found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms to find the clubs you&apos;re looking for.
            </p>
          </div>
        )}

        {/* Edit Club Modal */}
        {editingClub && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleUpdateClub}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">Edit Club</h2>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCloseEdit}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="edit-name">Club Name</Label>
                      <Input
                        id="edit-name"
                        value={editForm.name}
                        onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter club name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-description">Description</Label>
                      <textarea
                        id="edit-description"
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter club description"
                        className="w-full p-2 border border-gray-300 rounded-md resize-none"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-department">Department/Category</Label>
                        <select
                          id="edit-department"
                          value={editForm.department}
                          onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="">Select category</option>
                          <option value="Academic">Academic</option>
                          <option value="Extra-Curricular">Extra-Curricular</option>
                          <option value="Sports">Sports</option>
                        </select>
                      </div>

                      <div>
                        <Label htmlFor="edit-status">Status</Label>
                        <select
                          id="edit-status"
                          value={editForm.status}
                          onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          required
                        >
                          <option value="PENDING">Pending</option>
                          <option value="ACTIVE">Active</option>
                          <option value="INACTIVE">Inactive</option>
                          <option value="SUSPENDED">Suspended</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit-foundedYear">Founded Year</Label>
                      <Input
                        id="edit-foundedYear"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={editForm.foundedYear}
                        onChange={(e) => setEditForm(prev => ({ ...prev, foundedYear: e.target.value }))}
                        placeholder="Enter founded year"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-vision">Vision</Label>
                      <textarea
                        id="edit-vision"
                        value={editForm.vision}
                        onChange={(e) => setEditForm(prev => ({ ...prev, vision: e.target.value }))}
                        placeholder="Enter club vision"
                        className="w-full p-2 border border-gray-300 rounded-md resize-none"
                        rows={3}
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-mission">Mission</Label>
                      <textarea
                        id="edit-mission"
                        value={editForm.mission}
                        onChange={(e) => setEditForm(prev => ({ ...prev, mission: e.target.value }))}
                        placeholder="Enter club mission"
                        className="w-full p-2 border border-gray-300 rounded-md resize-none"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseEdit}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !editForm.name.trim() || !editForm.department}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

      </div> 
      </div>  
      </div>    
    </div>    
  )
} 