'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Plus, FileText, Building2, User, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'

interface Club {
  id: string
  name: string
  description?: string
  category?: string
  department: string | null
}

interface BudgetRequest {
  id: string
  title: string
  description: string | null
  amount: number
  purpose: string | null
  status: string
  requestedAt: string | null
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
  club: {
    id: string
    name: string
    department: string | null
  }
  isOwnRequest: boolean
}

export default function BudgetRequestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [clubs, setClubs] = useState<Club[]>([])
  const [requests, setRequests] = useState<BudgetRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingClubs, setLoadingClubs] = useState(true)
  const [isLeader, setIsLeader] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    purpose: '',
    clubId: ''
  })

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    const fetchUserClubs = async () => {
      try {
        setLoadingClubs(true)
        const response = await fetch('/api/club-leader/club-info')
        if (response.ok) {
          const data = await response.json()
          setClubs(data.clubs || [])
          setIsLeader(data.clubs && data.clubs.length > 0)
        } else if (response.status === 404) {
          setClubs([])
          setIsLeader(false)
        } else {
          setError('Failed to load your clubs')
        }
      } catch (error) {
        setError('Error loading clubs')
      } finally {
        setLoadingClubs(false)
      }
    }

    if (session?.user) {
      fetchUserClubs()
    }
  }, [session])

  useEffect(() => {
    const fetchBudgetRequests = async () => {
      if (!isLeader) return
      
      try {
        setLoading(true)
        const response = await fetch('/api/budget-requests')
        
        if (response.ok) {
          const data = await response.json()
          setRequests(data.requests || [])
        } else {
          setError('Failed to load budget requests')
        }
      } catch (error) {
        setError('Error loading budget requests')
      } finally {
        setLoading(false)
      }
    }

    fetchBudgetRequests()
  }, [isLeader])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!formData.title || !formData.amount || !formData.clubId) {
      alert('Please fill in all required fields.')
      return
    }

    if (parseFloat(formData.amount) <= 0) {
      alert('Amount must be greater than 0.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/budget-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create budget request')
      }

      const result = await response.json()
      
      // Add new request to the list
      setRequests(prev => [result.request, ...prev])
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        amount: '',
        purpose: '',
        clubId: ''
      })
      setShowCreateForm(false)
      
      alert('Budget request created successfully!')
    } catch (error) {
      console.error('Error creating budget request:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case 'PENDING':
        return <Badge className="bg-orange-100 text-orange-800">Pending</Badge>
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'PENDING':
        return <Clock className="h-5 w-5 text-orange-600" />
      case 'REJECTED':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <FileText className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url('/images/bracu-campus.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        ></div>
  <div className="absolute inset-0 bg-white/30"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-700 mx-auto"></div>
          <p className="mt-4 text-gray-700 text-lg">Loading budget requests...</p>
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
      {/* Light overlay for better contrast without darkening the page */}
      <div className="absolute inset-0 bg-white/30"></div>
      
      {/* Content container */}
      <div className="relative z-10 min-h-screen flex flex-col py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto w-full">
          {/* White frosted glass container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/60">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Budget Requests</h1>
                <p className="mt-2 text-sm sm:text-base text-gray-700">
                  Manage budget requests for your clubs 
                </p>
              </div>
              {!loadingClubs && clubs.length > 0 && (
                <Button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Request
                </Button>
              )}
            </div>

            {/* Loading State */}
            {(loadingClubs || loading) && (
              <div className="text-center py-8">
                <div className="text-gray-700">Loading...</div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Stats Cards */}
            {requests.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <Card className="bg-white/90 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Requests</p>
                        <p className="text-2xl font-bold">{requests.length}</p>
                      </div>
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/90 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending</p>
                        <p className="text-2xl font-bold">
                          {requests.filter(r => r.status === 'PENDING').length}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/90 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Approved</p>
                        <p className="text-2xl font-bold">
                          {requests.filter(r => r.status === 'APPROVED').length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/90 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Amount</p>
                        <p className="text-xl font-bold">
                          {formatCurrency(requests.reduce((sum, r) => sum + r.amount, 0))}
                        </p>
                      </div>
                      <DollarSign className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* No Leadership Message */}
            {!loadingClubs && !loading && clubs.length === 0 && (
              <Card className="bg-white/90 backdrop-blur">
                <CardContent className="p-8 text-center">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Leadership Roles</h3>
                  <p className="text-gray-600">
                    You need to have a leadership role (Executive or Senior Executive) in a club to create and manage budget requests.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Budget Requests List */}
            {!loadingClubs && !loading && requests.length > 0 && (
              <Card className="bg-white/90 backdrop-blur">
                <CardHeader>
                  <CardTitle>Club Budget Requests</CardTitle>
                  <CardDescription>
                    Budget requests for clubs you lead ({requests.length} request{requests.length !== 1 ? 's' : ''})
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {requests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-6 bg-white/80 backdrop-blur">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(request.status)}
                              <h3 className="text-lg font-semibold">{request.title}</h3>
                              {getStatusBadge(request.status)}
                              {request.isOwnRequest && (
                                <Badge variant="outline" className="text-blue-600">
                                  Your Request
                                </Badge>
                              )}
                            </div>
                            
                            {request.description && (
                              <p className="text-gray-600 mb-3">{request.description}</p>
                            )}
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Club:</span> {request.club.name}
                              </div>
                              <div>
                                <span className="font-medium">Amount:</span> 
                                <span className="font-semibold text-green-600 ml-1">
                                  {formatCurrency(request.amount)}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Requested:</span> {new Date(request.createdAt).toLocaleDateString()}
                              </div>
                              <div>
                                <span className="font-medium">Purpose:</span> {request.purpose || 'Not specified'}
                              </div>
                            </div>
                            
                            {!request.isOwnRequest && (
                              <div className="mt-2 text-sm text-gray-500">
                                <span className="font-medium">Requested by:</span> {request.user.name || request.user.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* No Requests Message */}
            {clubs.length > 0 && requests.length === 0 && (
              <Card className="bg-white/90 backdrop-blur">
                <CardContent className="p-8 text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Budget Requests</h3>
                  <p className="text-gray-600 mb-4">
                    No budget requests have been created for your clubs yet.
                  </p>
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Request
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Create Request Modal */}
            {showCreateForm && (
              <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 sm:p-6">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
                  <form onSubmit={handleSubmit}>
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold">Create Budget Request</h2>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCreateForm(false)}
                        >
                          ×
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="clubId">Club *</Label>
                          <select
                            id="clubId"
                            name="clubId"
                            value={formData.clubId}
                            onChange={handleInputChange}
                            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select a club</option>
                            {clubs.map(club => (
                              <option key={club.id} value={club.id}>
                                {club.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="title">Title *</Label>
                          <Input
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Enter request title"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="amount">Amount *</Label>
                          <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={formData.amount}
                            onChange={handleInputChange}
                            placeholder="0.00"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="purpose">Purpose</Label>
                          <Input
                            id="purpose"
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleInputChange}
                            placeholder="Brief purpose of the request"
                          />
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Detailed description of the budget request"
                            className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowCreateForm(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={isSubmitting || !formData.title.trim() || !formData.amount || !formData.clubId}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          {isSubmitting ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creating...
                            </>
                          ) : (
                            <>
                              <Plus className="h-4 w-4 mr-2" />
                              Create Request
                            </>
                          )}
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
