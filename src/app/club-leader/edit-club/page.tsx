'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, ArrowLeft, Edit } from 'lucide-react'
import Link from 'next/link'

interface Club {
  id: string
  name: string
  description: string
  category: string
  department: string
}

export default function SelectClubToEditPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

    fetchClubs()
  }, [session, status, router])

  const fetchClubs = async () => {
    try {
      const response = await fetch('/api/club-leader/club-info')
      if (response.ok) {
        const data = await response.json()
        setClubs(data.clubs || [])
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to fetch clubs')
      }
    } catch (error) {
      console.error('Error fetching clubs:', error)
      setError('Failed to fetch clubs')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="bracu-bg min-h-screen flex items-center justify-center">
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white">Loading clubs...</p>
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
        <div className="max-w-4xl mx-auto w-full">
          {/* White frosted glass container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/60">
            
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Building2 className="h-8 w-8" />
                Select Club to Edit
              </h1>
              <p className="mt-2 text-gray-700">
                Choose which club you want to edit information for
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-100">{error}</p>
              </div>
            )}

            {/* Clubs List */}
            {clubs.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No clubs found</h3>
                <p className="text-gray-200">
                  You are not assigned as a leader of any clubs yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clubs.map((club) => (
                  <Card key={club.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                    <CardHeader>
                      <CardTitle className="text-white">{club.name}</CardTitle>
                      <CardDescription className="text-gray-300">
                        {club.department && `${club.department} • `}
                        {club.category || 'No category'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {club.description || 'No description available'}
                      </p>
                      <Button 
                        onClick={() => router.push(`/club-leader/edit-club/${club.id}`)}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Club Info
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
