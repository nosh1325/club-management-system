'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Search, Edit, Clock } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  venue: string
  startDate: string
  endDate: string
  capacity: number
  status: string
  club: {
    name: string
    id: string
  }
  _count: {
    rsvps: number
  }
}

export default function AdminEventsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [processingEventId, setProcessingEventId] = useState<string | null>(null)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    venue: '',
    startDate: '',
    endDate: '',
    capacity: 0
  })

 
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        
        
        const params = new URLSearchParams()
        if (statusFilter && statusFilter !== 'ALL') {
          params.append('status', statusFilter)
        }
        
        const response = await fetch(`/api/admin/events?${params.toString()}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch events')
        }
        
        const data = await response.json()
        setEvents(data.events || [])
        setFilteredEvents(data.events || [])
      } catch (error) {
        console.error('Error fetching events:', error)
        setEvents([])
        setFilteredEvents([])
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchEvents()
    }
  }, [session, statusFilter])

  useEffect(() => {
    let filtered = events

    
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.club.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredEvents(filtered)
  }, [searchTerm, events])

  const handleEventAction = async (eventId: string, action: 'approve' | 'reject') => {
    try {
      setProcessingEventId(eventId)
      
      const response = await fetch(`/api/admin/events/${eventId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${action} event`)
      }

      const result = await response.json()
      
      
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, status: action === 'approve' ? 'APPROVED' : 'REJECTED' }
            : event
        )
      )

      console.log(`Event ${action}d successfully:`, result)
      
    } catch (error) {
      console.error(`Error ${action}ing event:`, error)
      alert(`Failed to ${action} event. Please try again.`)
    } finally {
      setProcessingEventId(null)
    }
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setEditFormData({
      title: event.title,
      description: event.description || '',
      venue: event.venue || '',
      startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      capacity: event.capacity || 0
    })
  }

  const handleSaveEdit = async () => {
    if (!editingEvent) return

    try {
      setProcessingEventId(editingEvent.id)
      
      const response = await fetch(`/api/admin/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editFormData.title,
          description: editFormData.description,
          venue: editFormData.venue,
          startDate: new Date(editFormData.startDate).toISOString(),
          endDate: new Date(editFormData.endDate).toISOString(),
          capacity: parseInt(editFormData.capacity.toString())
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update event')
      }

      const result = await response.json()
      
     
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === editingEvent.id 
            ? { ...event, ...editFormData, startDate: editFormData.startDate, endDate: editFormData.endDate }
            : event
        )
      )

      setEditingEvent(null)
      console.log('Event updated successfully:', result)
      
    } catch (error) {
      console.error('Error updating event:', error)
      alert('Failed to update event. Please try again.')
    } finally {
      setProcessingEventId(null)
    }
  }

  const handleCancelEdit = () => {
    setEditingEvent(null)
    setEditFormData({
      title: '',
      description: '',
      venue: '',
      startDate: '',
      endDate: '',
      capacity: 0
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading events...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">All Events Management</h1>
              <p className="mt-2 text-gray-600">
                View and manage all club events across all statuses
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => router.push('/admin/event-approvals')}
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                View Pending Approvals
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="mb-8">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search events by title, description, venue, or club..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold">{events.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved Events</p>
                    <p className="text-2xl font-bold">
                      {events.filter(event => event.status === 'APPROVED').length}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                    <p className="text-2xl font-bold">
                      {events.filter(event => event.status === 'PENDING').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total RSVPs</p>
                    <p className="text-2xl font-bold">
                      {events.reduce((total, event) => total + (event._count?.rsvps || 0), 0)}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>All Events</CardTitle>
            <CardDescription>
              Showing {filteredEvents.length} of {events.length} events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <Badge 
                          variant={
                            event.status === 'APPROVED' ? 'default' : 
                            event.status === 'PENDING' ? 'secondary' : 'destructive'
                          }
                        >
                          {event.status}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{event.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.startDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.venue}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event._count?.rsvps || 0} / {event.capacity} RSVPs
                        </div>
                        <div>
                          <span className="font-medium">Club:</span> {event.club.name}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {event.status === 'PENDING' && (
                        <>
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleEventAction(event.id, 'approve')}
                            disabled={processingEventId === event.id}
                          >
                            {processingEventId === event.id ? 'Processing...' : 'Approve'}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-red-600"
                            onClick={() => handleEventAction(event.id, 'reject')}
                            disabled={processingEventId === event.id}
                          >
                            {processingEventId === event.id ? 'Processing...' : 'Reject'}
                          </Button>
                        </>
                      )}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditEvent(event)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {filteredEvents.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-600">
              {events.length === 0 
                ? "No events have been created yet."
                : "Try adjusting your search terms to find the events you're looking for."
              }
            </p>
          </div>
        )}
      </div>

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Edit Event</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <Input
                  value={editFormData.title}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Event title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full p-2 border border-gray-300 rounded-md resize-none"
                  rows={3}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Event description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue *
                </label>
                <Input
                  value={editFormData.venue}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, venue: e.target.value }))}
                  placeholder="Event venue"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date *
                  </label>
                  <Input
                    type="datetime-local"
                    value={editFormData.startDate}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date *
                  </label>
                  <Input
                    type="datetime-local"
                    value={editFormData.endDate}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Capacity
                </label>
                <Input
                  type="number"
                  value={editFormData.capacity}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) || 0 }))}
                  placeholder="Maximum attendees"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button 
                variant="outline" 
                onClick={handleCancelEdit}
                disabled={processingEventId === editingEvent.id}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveEdit}
                disabled={processingEventId === editingEvent.id || !editFormData.title || !editFormData.venue}
              >
                {processingEventId === editingEvent.id ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  )
}