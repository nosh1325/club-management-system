'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Filter, Search, Calendar, Clock, MapPin, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
interface Event {
  id: string
  title: string
  description: string
  venue: string
  startDate: string
  endDate: string
  capacity?: number
  requirements?: string
  attendeeCount: number
  userRsvpStatus?: string | null
  status?: string // <-- Add this line
  club: {
    id: string
    name: string
    logo?: string
  }
}

const initialForm = {
  title: '',
  description: '',
  venue: '',
  startDate: '',
  endDate: '',
  capacity: '',
  requirements: '',
  clubId: '',
}

export default function ManageEventsPage() {
  const router = useRouter()
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>(initialForm)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  

const fetchEvents = async () => {
    setLoading(true)
    try {
      
      const response = await fetch('/api/events?clubLeader=true')
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        console.error('Failed to fetch events')
        setEvents([])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchEvents()
  }, [])
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
    filtered = filtered.filter(event => event.status === statusFilter)
  }
  setFilteredEvents(filtered)
}, [searchTerm, statusFilter, events])


  const openCreate = () => {
    setForm(initialForm)
    setEditingId(null)
    setShowForm(true)
    setError(null)
  }

  const openEdit = (event: Event) => {
    router.push(`/events/edit/${event.id}`)
  }

  const handleDelete = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await fetch(`/api/events/${eventId}`, { method: 'DELETE' })
      fetchEvents()
    }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const payload = {
      ...form,
      capacity: form.capacity ? parseInt(form.capacity) : undefined,
    }
    let res
    if (editingId) {
      res = await fetch(`/api/events/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } else {
      res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }
    if (res.ok) {
      setShowForm(false)
      fetchEvents()
    } else {
      const data = await res.json()
      setError(data.error || 'Something went wrong')
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
  if (loading) {
    return (
      <div className="bracu-bg min-h-screen flex items-center justify-center relative">
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-700 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading events...</p>
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
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/60 transition-all duration-300 hover:bg-white/90">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 drop-shadow-lg">Events</h1>
              <p className="mt-2 text-gray-700 drop-shadow">
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
                  <option value="PENDING">Pending Approval</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              <Button onClick={() => router.push('/events/create')} className="ml-4">Create New Event</Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredEvents.map((event) => (
                <Card key={event.id} className="h-full flex flex-col">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
                        <CardDescription className="mt-1">by {event.club.name}</CardDescription>
                      </div>
                      <Badge 
                        variant={
                          event.status === 'APPROVED' ? 'default' :
                          event.status === 'PENDING' ? 'secondary' :
                          event.status === 'REJECTED' ? 'destructive' : 'outline'
                        }
                        className="ml-2"
                      >
                        {event.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col">
                    <p className="text-sm text-black-600 mb-4 line-clamp-3">
                      {event.description}
                    </p>
                    <div className="space-y-2 mb-4 text-sm">
                      <div className="flex items-center gap-2 text-black-600">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-black-600">
                        <Clock className="h-4 w-4" />
                        <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-black-600">
                        <MapPin className="h-4 w-4" />
                        <span>{event.venue}</span>
                      </div>
                    
                    </div>
                    {event.requirements && (
                      <div className="mb-4">
                        <p className="text-xs font-medium text-black-700 mb-1">Requirements:</p>
                        <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          {event.requirements}
                        </p>
                      </div>
                    )}
                    <div className="mt-auto flex gap-2">
                      <Button size="sm" onClick={() => openEdit(event)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>Delete</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {filteredEvents.length === 0 && (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                <p className="text-gray-700">
                  Try adjusting your search terms or filters to find events that interest you.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg space-y-4"
          >
            <h2 className="text-lg font-bold mb-2">{editingId ? 'Edit Event' : 'Create Event'}</h2>
            {error && <div className="text-red-600">{error}</div>}
            <Input name="title" placeholder="Title" value={form.title} onChange={handleFormChange} required />
            <Input name="venue" placeholder="Venue" value={form.venue} onChange={handleFormChange} required />
            <Input name="startDate" type="datetime-local" value={form.startDate} onChange={handleFormChange} required />
            <Input name="endDate" type="datetime-local" value={form.endDate} onChange={handleFormChange} required />
            <Input name="capacity" type="number" placeholder="Capacity" value={form.capacity} onChange={handleFormChange} />
            <Input name="requirements" placeholder="Requirements" value={form.requirements} onChange={handleFormChange} />
            <Input name="clubId" placeholder="Club ID" value={form.clubId} onChange={handleFormChange} required />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleFormChange}
              className="w-full border rounded p-2"
              rows={3}
            />
            <div className="flex gap-2 mt-2">
              <Button type="submit">{editingId ? 'Update' : 'Create'}</Button>
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}