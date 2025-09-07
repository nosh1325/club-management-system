'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Search, Clock } from 'lucide-react'

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

export default function EventApprovalsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [processingEventId, setProcessingEventId] = useState<string | null>(null)

  // Redirect if not an admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchPendingEvents = async () => {
      try {
        setLoading(true)
       
        const response = await fetch('/api/admin/events?status=PENDING')
        
        if (!response.ok) {
          throw new Error('Failed to fetch pending events')
        }
        
        const data = await response.json()
        const pendingEvents = data.events || []
        setEvents(pendingEvents)
        setFilteredEvents(pendingEvents)
        
        console.log(`Fetched ${pendingEvents.length} pending events for approval`)
      } catch (error) {
        console.error('Error fetching pending events:', error)
        setEvents([])
        setFilteredEvents([])
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchPendingEvents()
    }
  }, [session])

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
      
      
      setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
      
      console.log(`Event ${action}d successfully:`, result)
      
    } catch (error) {
      console.error(`Error ${action}ing event:`, error)
      alert(`Failed to ${action} event. Please try again.`)
    } finally {
      setProcessingEventId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pending events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Event Approvals</h1>
          <p className="mt-2 text-gray-600">
            Review and approve pending club events
          </p>
        </div>

        {/* Search and Stats */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search pending events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Events</p>
                    <p className="text-2xl font-bold">{events.length}</p>
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

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Search Results</p>
                    <p className="text-2xl font-bold">{filteredEvents.length}</p>
                  </div>
                  <Search className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Events List */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Events for Approval</CardTitle>
            <CardDescription>
              Showing {filteredEvents.length} of {events.length} pending events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-6 bg-orange-50 border-orange-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{event.title}</h3>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          PENDING APPROVAL
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
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleEventAction(event.id, 'reject')}
                        disabled={processingEventId === event.id}
                      >
                        {processingEventId === event.id ? 'Processing...' : 'Reject'}
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
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No pending events</h3>
            <p className="text-gray-600">
              {events.length === 0 
                ? "All events have been reviewed. Great job!"
                : "Try adjusting your search terms to find the events you're looking for."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
