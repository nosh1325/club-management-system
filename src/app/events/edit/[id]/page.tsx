'use client'

import { useState, useEffect, use } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, MapPin, Users, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Club {
  id: string
  name: string
  logo?: string
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

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const [form, setForm] = useState(initialForm)
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingEvent, setLoadingEvent] = useState(true)
  const [loadingClubs, setLoadingClubs] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoadingEvent(true)
        const response = await fetch(`/api/events/${resolvedParams.id}`)
        if (response.ok) {
          const data = await response.json()
          const event = data.event
          setForm({
            title: event.title || '',
            description: event.description || '',
            venue: event.venue || '',
            startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
            endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
            capacity: event.capacity?.toString() || '',
            requirements: event.requirements || '',
            clubId: event.clubId || '',
          })
        } else {
          setError('Failed to load event details')
        }
      } catch (error) {
        setError('Error loading event')
      } finally {
        setLoadingEvent(false)
      }
    }

    fetchEvent()
  }, [resolvedParams.id])

  
  useEffect(() => {
    const fetchUserClubs = async () => {
      try {
        setLoadingClubs(true)
        const response = await fetch('/api/club-leader/club-info')
        if (response.ok) {
          const data = await response.json()
          setClubs(data.clubs || [])
        } else if (response.status === 404) {
          setClubs([])
        } else {
          setError('Failed to load your clubs')
        }
      } catch (error) {
        setError('Error loading clubs')
      } finally {
        setLoadingClubs(false)
      }
    }

    fetchUserClubs()
  }, [])

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    
    const payload = {
      ...form,
      capacity: form.capacity ? parseInt(form.capacity) : undefined,
    }

    try {
      const res = await fetch(`/api/events/${resolvedParams.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/events/manage')
        }, 2000)
      } else {
        const data = await res.json()
        setError(data.error || 'Something went wrong')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push('/events/manage')
  }

  if (loadingEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading event...</p>
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
      <div className="absolute inset-0 bg-black/10"></div>
      
      {/* Content container */}
      <div className="relative z-10 min-h-screen flex flex-col py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto w-full">
          {/* White frosted glass container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/60 transition-all duration-300 hover:bg-white/85">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
              <p className="mt-2 text-gray-700 font-medium">
                Update the details below to modify your event
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                <p className="text-green-100 font-medium">Event updated successfully! Redirecting to manage events...</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-100 font-medium">{error}</p>
              </div>
            )}

            {/* Edit Event Form */}
            <Card className="bg-white/10 border-white/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 drop-shadow-lg">
                  <Calendar className="h-5 w-5" />
                  Event Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-white font-medium drop-shadow">Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Event title"
                        value={form.title}
                        onChange={handleFormChange}
                        required
                        className="bg-white/15 border-white/30 text-white placeholder:text-gray-300 font-medium"
                      />
                    </div>

                    <div>
                      <Label htmlFor="venue" className="text-white font-medium drop-shadow">Venue *</Label>
                      <Input
                        id="venue"
                        name="venue"
                        placeholder="Event venue"
                        value={form.venue}
                        onChange={handleFormChange}
                        required
                        className="bg-white/15 border-white/30 text-white placeholder:text-gray-300 font-medium"
                      />
                    </div>

                    <div>
                      <Label htmlFor="startDate" className="text-white font-medium drop-shadow">Start Date & Time *</Label>
                      <Input
                        id="startDate"
                        name="startDate"
                        type="datetime-local"
                        value={form.startDate}
                        onChange={handleFormChange}
                        required
                        className="bg-white/15 border-white/30 text-white font-medium"
                      />
                    </div>

                    <div>
                      <Label htmlFor="endDate" className="text-white font-medium drop-shadow">End Date & Time *</Label>
                      <Input
                        id="endDate"
                        name="endDate"
                        type="datetime-local"
                        value={form.endDate}
                        onChange={handleFormChange}
                        required
                        className="bg-white/15 border-white/30 text-white font-medium"
                      />
                    </div>

                    <div>
                      <Label htmlFor="capacity" className="text-white font-medium drop-shadow">Capacity</Label>
                      <Input
                        id="capacity"
                        name="capacity"
                        type="number"
                        placeholder="Max attendees (optional)"
                        value={form.capacity}
                        onChange={handleFormChange}
                        className="bg-white/15 border-white/30 text-white placeholder:text-gray-300 font-medium"
                      />
                    </div>

                    <div>
                      <Label htmlFor="requirements" className="text-white font-medium drop-shadow">Requirements</Label>
                      <Input
                        id="requirements"
                        name="requirements"
                        placeholder="Any special requirements"
                        value={form.requirements}
                        onChange={handleFormChange}
                        className="bg-white/15 border-white/30 text-white placeholder:text-gray-300 font-medium"
                      />
                    </div>

                    <div>
                      <Label htmlFor="clubId" className="text-white font-medium drop-shadow">Select Club *</Label>
                      {loadingClubs ? (
                        <div className="text-gray-200">Loading your clubs...</div>
                      ) : clubs.length === 0 ? (
                        <div className="text-red-300">You are not a leader of any clubs</div>
                      ) : (
                        <select
                          id="clubId"
                          name="clubId"
                          value={form.clubId}
                          onChange={handleFormChange}
                          required
                          className="w-full px-3 py-2 bg-white/15 border border-white/30 rounded-md text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="" className="bg-gray-800">Select a club...</option>
                          {clubs.map((club) => (
                            <option key={club.id} value={club.id} className="bg-gray-800">
                              {club.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="description" className="text-white font-medium drop-shadow">Description</Label>
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Event description"
                        value={form.description}
                        onChange={handleFormChange}
                        rows={3}
                        className="w-full px-3 py-2 bg-white/15 border border-white/30 rounded-md text-white placeholder:text-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button 
                      type="submit" 
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                      {loading ? 'Updating...' : 'Update'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={handleCancel}
                      className="bg-white/15 border-white/30 text-white hover:bg-white/25 font-medium"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
