'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Filter, Search, Calendar } from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string
  venue: string
  startDate: string
  endDate: string
  capacity?: number
  attendeeCount: number
  requirements?: string
  club: {
    id: string
    name: string
    logo?: string
  }
  userRsvpStatus?: string | null
  spotsRemaining?: number | null
}

export default function EventsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchEvents = async () => {
      // Don't fetch if not authenticated
      if (status === 'loading' || !session) return
      
      try {
        setLoading(true)
        const response = await fetch(`/api/events?search=${searchTerm}&time=upcoming`)
        
        console.log('Response status:', response.status)
        console.log('Response headers:', response.headers.get('content-type'))
        
        if (response.ok) {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json()
            setEvents(data.events)
            setFilteredEvents(data.events)
          } else {
            const text = await response.text()
            console.error('Expected JSON but got:', text.substring(0, 200))
          }
        } else {
          const text = await response.text()
          console.error('Failed to fetch events. Status:', response.status, 'Response:', text.substring(0, 200))
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [searchTerm, session, status])

  useEffect(() => {
    let filtered = events
    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.club.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    if (statusFilter !== 'All') {
      if (statusFilter === 'My Events') {
        filtered = filtered.filter(event => event.userRsvpStatus === 'ATTENDING')
      }
    }
    setFilteredEvents(filtered)
  }, [searchTerm, statusFilter, events])

  const handleRSVP = async (eventId: string) => {
    try {
      const response = await fetch('/api/events/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action: 'rsvp' })
      })
      if (response.ok) {
        const eventsResponse = await fetch(`/api/events?search=${searchTerm}&time=upcoming`)
        if (eventsResponse.ok) {
          const data = await eventsResponse.json()
          setEvents(data.events)
        }
      }
    } catch (error) {
      console.error('Error handling RSVP:', error)
    }
  }

  const handleCancelRSVP = async (eventId: string) => {
    try {
      const response = await fetch('/api/events/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action: 'cancel' })
      })
      if (response.ok) {
        const eventsResponse = await fetch(`/api/events?search=${searchTerm}&time=upcoming`)
        if (eventsResponse.ok) {
          const data = await eventsResponse.json()
          setEvents(data.events)
        }
      }
    } catch (error) {
      console.error('Error canceling RSVP:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (status === 'loading') {
    return (
      <div className="bracu-bg min-h-screen flex items-center justify-center relative">
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="bracu-bg min-h-screen flex items-center justify-center relative">
        <div className="text-center relative z-10">
          <p className="text-white mb-4">Please sign in to view events</p>
          <Button onClick={() => router.push('/auth/signin')}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bracu-bg min-h-screen flex items-center justify-center relative">
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading events...</p>
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
      <div className="absolute inset-0 bg-black/50"></div>
      <div className="relative z-10 min-h-screen flex flex-col py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 sm:p-8 shadow-2xl border border-white/20 transition-all duration-300 hover:bg-white/15">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">Events</h1>
              <p className="mt-2 text-gray-200 drop-shadow">
                Discover and participate in exciting events hosted by university clubs
              </p>
            </div>
            <div className="mb-8 space-y-4 md:space-y-0 md:flex md:items-center md:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search events, clubs, or descriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm"
                >
                  <option value="All">All Events</option>
                  <option value="My Events">My Events</option>
                  <option value="APPROVED">Approved</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="h-full flex flex-col p-4">
                  <div className="flex items-center mb-2">
                    {event.club.logo && (
                      <img src={event.club.logo} alt={event.club.name} className="h-8 w-8 rounded-full mr-2" />
                    )}
                    <span className="font-semibold text-white">{event.club.name}</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mb-1">{event.title}</h2>
                  <div className="text-gray-200 mb-2">{event.description}</div>
                  <div className="text-gray-300 text-sm mb-1">
                    <span>{formatDate(event.startDate)} {formatTime(event.startDate)}</span>
                    {' '}to{' '}
                    <span>{formatDate(event.endDate)} {formatTime(event.endDate)}</span>
                  </div>
                  <div className="text-gray-300 text-sm mb-1">Venue: {event.venue}</div>
                  {event.capacity && (
                    <div className="text-gray-300 text-sm mb-1">
                      Capacity: {event.capacity} | Attending: {event.attendeeCount}
                    </div>
                  )}
                  {event.requirements && (
                    <div className="text-gray-300 text-sm mb-1">Requirements: {event.requirements}</div>
                  )}
                  <div className="mt-auto flex gap-2">
                    {event.userRsvpStatus === 'ATTENDING' ? (
                      <Button variant="destructive" onClick={() => handleCancelRSVP(event.id)}>
                        Cancel RSVP
                      </Button>
                    ) : (
                      <Button onClick={() => handleRSVP(event.id)}>
                        RSVP
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No events found</h3>
                <p className="text-gray-200">
                  Try adjusting your search terms or filters to find events that interest you.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}