'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { DollarSign, Search, CheckCircle, XCircle, Clock, FileText, Building2, User, Calendar, Eye, X } from 'lucide-react'

interface BudgetRequest {
  id: string
  title: string
  description: string | null
  amount: number
  purpose: string | null
  status: string
  requestedAt: string | null
  reviewedBy: string | null
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
}

export default function AdminBudgetRequestsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [requests, setRequests] = useState<BudgetRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<BudgetRequest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<BudgetRequest | null>(null)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
    pendingAmount: 0
  })

  // Redirect if not an admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      if (statusFilter !== 'ALL') {
        queryParams.append('status', statusFilter)
      }

      const response = await fetch(`/api/admin/budget-requests?${queryParams}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch budget requests')
      }
      
      const data = await response.json()
      setRequests(data.requests)
      setFilteredRequests(data.requests)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching budget requests:', error)
      alert('Failed to load budget requests')
    } finally {
      setLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    if (session?.user) {
      fetchRequests()
    }
  }, [session, fetchRequests])

  useEffect(() => {
    let filtered = requests

    if (searchTerm) {
      filtered = filtered.filter(request =>
        request.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.club.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredRequests(filtered)
  }, [searchTerm, requests])

  const handleRequestAction = async (requestId: string, action: 'approve' | 'reject') => {
    if (processingId) return
    
    const actionText = action === 'approve' ? 'approve' : 'reject'
    if (!window.confirm(`Are you sure you want to ${actionText} this budget request?`)) {
      return
    }

    setProcessingId(requestId)
    try {
      const response = await fetch('/api/admin/budget-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId,
          action
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Failed to ${actionText} budget request`)
      }
      
      // Refresh the data
      await fetchRequests()
      
      alert(`Budget request ${action}d successfully`)
    } catch (error) {
      console.error(`Error ${actionText}ing budget request:`, error)
      alert(`Failed to ${actionText} budget request: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setProcessingId(null)
    }
  }

  const handleViewRequest = (request: BudgetRequest) => {
    setSelectedRequest(request)
    setShowRequestModal(true)
  }

  const handleCloseModal = () => {
    setSelectedRequest(null)
    setShowRequestModal(false)
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
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading budget requests...</p>
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
        <div className="max-w-7xl mx-auto w-full">
          {/* White frosted glass container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/60">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Budget Request Management</h1>
              <p className="mt-2 text-sm sm:text-base text-gray-700">
                Review and approve club budget requests
              </p>
            </div>

            {/* Filters and Stats */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search by title, description, user, or club..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/90"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="p-3 border border-gray-300 rounded-md bg-white/90 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                        <p className="text-2xl font-bold">{stats.pending}</p>
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
                        <p className="text-2xl font-bold">{stats.approved}</p>
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
                        <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white/90 backdrop-blur">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Pending Amount</p>
                        <p className="text-xl font-bold">{formatCurrency(stats.pendingAmount)}</p>
                      </div>
                      <Clock className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Requests Table */}
            <Card className="bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle>Budget Requests</CardTitle>
                <CardDescription>
                  Showing {filteredRequests.length} of {requests.length} requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredRequests.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium">Request</th>
                          <th className="text-left p-4 font-medium">Club</th>
                          <th className="text-left p-4 font-medium">Requested By</th>
                          <th className="text-left p-4 font-medium">Amount</th>
                          <th className="text-left p-4 font-medium">Status</th>
                          <th className="text-left p-4 font-medium">Date</th>
                          <th className="text-left p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map((request) => (
                          <tr key={request.id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{request.title}</div>
                                {request.description && (
                                  <div className="text-sm text-gray-500 truncate max-w-xs">
                                    {request.description}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{request.club.name}</div>
                                <div className="text-sm text-gray-500">{request.club.department}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{request.user.name || 'No Name'}</div>
                                <div className="text-sm text-gray-500">{request.user.email}</div>
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-medium text-green-600">
                                {formatCurrency(request.amount)}
                              </span>
                            </td>
                            <td className="p-4">
                              {getStatusBadge(request.status)}
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-gray-500">
                                {new Date(request.createdAt).toLocaleDateString()}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleViewRequest(request)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                {request.status === 'PENDING' && (
                                  <>
                                    <Button
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700 text-white"
                                      onClick={() => handleRequestAction(request.id, 'approve')}
                                      disabled={processingId === request.id}
                                    >
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Approve
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 border-red-300 hover:bg-red-50"
                                      onClick={() => handleRequestAction(request.id, 'reject')}
                                      disabled={processingId === request.id}
                                    >
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No budget requests found</h3>
                    <p className="text-gray-600">
                      No budget requests match your current filters.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Request Details Modal */}
            {showRequestModal && selectedRequest && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold">Budget Request Details</h2>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCloseModal}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {/* Request Information */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Request Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <p className="mt-1 text-sm text-gray-900">{selectedRequest.title}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Amount</label>
                            <p className="mt-1 text-sm text-gray-900 font-medium text-green-600">
                              {formatCurrency(selectedRequest.amount)}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedRequest.description || 'No description provided'}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Purpose</label>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedRequest.purpose || 'No purpose specified'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Status</label>
                            <div className="mt-1">
                              {getStatusBadge(selectedRequest.status)}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Request Date</label>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedRequest.requestedAt 
                                ? new Date(selectedRequest.requestedAt).toLocaleDateString()
                                : 'Not specified'
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Club Information */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Club Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Club Name</label>
                            <p className="mt-1 text-sm text-gray-900 flex items-center">
                              <Building2 className="h-4 w-4 mr-1" />
                              {selectedRequest.club.name}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Department</label>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedRequest.club.department || 'Not specified'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Requestor Information */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Requested By</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <p className="mt-1 text-sm text-gray-900 flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {selectedRequest.user.name || 'No name provided'}
                            </p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <p className="mt-1 text-sm text-gray-900">
                              {selectedRequest.user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                      {selectedRequest.status === 'PENDING' && (
                        <>
                          <Button
                            onClick={() => {
                              handleRequestAction(selectedRequest.id, 'reject')
                              handleCloseModal()
                            }}
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            disabled={processingId === selectedRequest.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => {
                              handleRequestAction(selectedRequest.id, 'approve')
                              handleCloseModal()
                            }}
                            className="bg-green-600 hover:bg-green-700"
                            disabled={processingId === selectedRequest.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCloseModal}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
