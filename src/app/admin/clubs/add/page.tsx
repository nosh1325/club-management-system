'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Plus } from 'lucide-react'

export default function AddClubPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
    status: 'ACTIVE',
    foundedYear: '',
    vision: '',
    mission: ''
  })

  // Redirect if not an admin
  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/dashboard')
      return
    }
  }, [session, status, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!formData.name || !formData.department) {
      alert('Please fill in all required fields.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/clubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          foundedYear: formData.foundedYear ? parseInt(formData.foundedYear, 10) : null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create club')
      }

      const result = await response.json()
      alert('Club created successfully!')
      router.push('/admin/clubs')
    } catch (error) {
      console.error('Error creating club:', error)
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (status === 'loading') {
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
          <p className="mt-4 text-white text-lg">Loading...</p>
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
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/60">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/admin/clubs')}
                  className="bg-white/60 border-white/70 text-gray-700 hover:bg-white/70"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Clubs
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 drop-shadow-lg">Add New Club</h1>
                  <p className="mt-2 text-gray-700 drop-shadow">
                    Create a new club in the system
                  </p>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <Card className="bg-white/90 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Club Information
                </CardTitle>
                <CardDescription>
                  Fill in the details for the new club
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Club Name */}
                    <div className="md:col-span-2">
                      <Label htmlFor="name">Club Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter club name"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="md:col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter club description"
                        className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                      />
                    </div>

                    {/* Department */}
                    <div>
                      <Label htmlFor="department">Department/Category *</Label>
                      <select
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select category</option>
                        <option value="Academic">Academic</option>
                        <option value="Extra-Curricular">Extra-Curricular</option>
                        <option value="Sports">Sports</option>
                        <option value="Cultural">Cultural</option>
                        <option value="Technology">Technology</option>
                        <option value="Social Service">Social Service</option>
                        <option value="Professional">Professional</option>
                      </select>
                    </div>

                    {/* Founded Year */}
                    <div>
                      <Label htmlFor="foundedYear">Founded Year</Label>
                      <Input
                        id="foundedYear"
                        name="foundedYear"
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={formData.foundedYear}
                        onChange={handleInputChange}
                        placeholder="Enter founded year"
                      />
                    </div>

                    {/* Vision */}
                    <div className="md:col-span-2">
                      <Label htmlFor="vision">Vision</Label>
                      <textarea
                        id="vision"
                        name="vision"
                        value={formData.vision}
                        onChange={handleInputChange}
                        placeholder="Enter club vision"
                        className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>

                    {/* Mission */}
                    <div className="md:col-span-2">
                      <Label htmlFor="mission">Mission</Label>
                      <textarea
                        id="mission"
                        name="mission"
                        value={formData.mission}
                        onChange={handleInputChange}
                        placeholder="Enter club mission"
                        className="w-full p-3 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Submit buttons */}
                  <div className="flex items-center justify-end gap-3 pt-6 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/admin/clubs')}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting || !formData.name.trim() || !formData.department}
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
                          Create Club
                        </>
                      )}
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
