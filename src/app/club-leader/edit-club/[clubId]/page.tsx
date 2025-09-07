'use client'

import { useState, useEffect, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building2, Save, ArrowLeft, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface Club {
  id: string
  name: string
  description: string
  category: string
  department: string
  email: string
  phone: string
  website: string
  advisor: string
  vision: string
  mission: string
  activities: string
}

export default function EditSpecificClubPage({ params }: { params: Promise<{ clubId: string }> }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { clubId } = use(params)
  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'CLUB_LEADER') {
      router.push('/dashboard')
      return
    }

    fetchClubData()
  }, [session, status, router, clubId])

  const fetchClubData = async () => {
    try {
      
      const response = await fetch('/api/club-leader/club-info')
      if (response.ok) {
        const data = await response.json()
        const targetClub = data.clubs?.find((c: Club) => c.id === clubId)
        if (targetClub) {
          setClub(targetClub)
        } else {
          setError('Club not found or you are not authorized to edit this club.')
        }
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch club data')
      }
    } catch (error) {
      console.error('Error fetching club data:', error)
      setError('Failed to fetch club data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof Club, value: string) => {
    if (!club) return
    setClub({ ...club, [field]: value })
  }

  const handleSave = async () => {
    if (!club) return

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch(`/api/club-leader/club-info/${club.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: club.name,
          description: club.description,
          category: club.category,
          department: club.department,
          email: club.email,
          phone: club.phone,
          website: club.website,
          advisor: club.advisor,
          vision: club.vision,
          mission: club.mission,
          activities: club.activities,
        }),
      })

      if (response.ok) {
        setSuccess('Club information updated successfully!')
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update club information')
      }
    } catch (error) {
      console.error('Error updating club:', error)
      setError('Failed to update club information')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="bracu-bg min-h-screen flex items-center justify-center">
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading club information...</p>
        </div>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="bracu-bg min-h-screen flex items-center justify-center">
        <div className="text-center relative z-10">
          <p className="text-red-300 mb-4">No club found or you're not authorized to edit this club.</p>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
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
        <div className="max-w-4xl mx-auto w-full">
          {/* Frosted glass container */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 sm:p-8 shadow-2xl border border-white/20">
            
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="text-white border-white/20 hover:bg-white/10">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg flex items-center gap-3">
                <Building2 className="h-8 w-8" />
                Edit Club Information - {club.name}
              </h1>
              <p className="mt-2 text-gray-200">
                Update your club's public information and details
              </p>
            </div>

            {/* Success/Error Messages */}
            {success && (
              <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
                <p className="text-green-100">{success}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-100">{error}</p>
              </div>
            )}

            {/* Edit Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Basic Information</CardTitle>
                  <CardDescription className="text-gray-300">
                    Core details about your club
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-white">Club Name *</Label>
                    <Input
                      id="name"
                      value={club.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      placeholder="Enter club name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-white">Description *</Label>
                    <textarea
                      id="description"
                      value={club.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      className="w-full min-h-[100px] p-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 resize-vertical"
                      placeholder="Describe your club's purpose and activities"
                    />
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-white">Category</Label>
                    <Input
                      id="category"
                      value={club.category || ''}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      placeholder="e.g., Academic, Cultural, Sports"
                    />
                  </div>

                  <div>
                    <Label htmlFor="department" className="text-white">Department</Label>
                    <Input
                      id="department"
                      value={club.department || ''}
                      onChange={(e) => handleInputChange('department', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      placeholder="Associated department"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card className="bg-white/5 border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Contact Information</CardTitle>
                  <CardDescription className="text-gray-300">
                    How students can reach your club
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-white">Club Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={club.email || ''}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      placeholder="club@bracu.ac.bd"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-white">Phone Number</Label>
                    <Input
                      id="phone"
                      value={club.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      placeholder="+880 1XXXXXXXXX"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website" className="text-white">Website</Label>
                    <Input
                      id="website"
                      value={club.website || ''}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      placeholder="https://yourclub.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="advisor" className="text-white">Faculty Advisor</Label>
                    <Input
                      id="advisor"
                      value={club.advisor || ''}
                      onChange={(e) => handleInputChange('advisor', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-gray-400"
                      placeholder="Dr. Faculty Name"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Vision & Mission */}
              <Card className="bg-white/5 border-white/10 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Vision & Mission</CardTitle>
                  <CardDescription className="text-gray-300">
                    Your club's goals and aspirations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="vision" className="text-white">Vision</Label>
                    <textarea
                      id="vision"
                      value={club.vision || ''}
                      onChange={(e) => handleInputChange('vision', e.target.value)}
                      className="w-full min-h-[80px] p-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 resize-vertical"
                      placeholder="What your club aspires to achieve"
                    />
                  </div>

                  <div>
                    <Label htmlFor="mission" className="text-white">Mission</Label>
                    <textarea
                      id="mission"
                      value={club.mission || ''}
                      onChange={(e) => handleInputChange('mission', e.target.value)}
                      className="w-full min-h-[80px] p-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 resize-vertical"
                      placeholder="How your club will achieve its vision"
                    />
                  </div>

                  <div>
                    <Label htmlFor="activities" className="text-white">Activities</Label>
                    <textarea
                      id="activities"
                      value={club.activities || ''}
                      onChange={(e) => handleInputChange('activities', e.target.value)}
                      className="w-full min-h-[80px] p-3 bg-white/10 border border-white/20 rounded-md text-white placeholder-gray-400 resize-vertical"
                      placeholder="Regular activities and events your club organizes"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <Button 
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
