'use client'

import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormField, FileUpload, FormActions } from '@/components/ui/form-components'
import { Edit, User} from 'lucide-react'
import { toast } from 'react-hot-toast'

interface UserProfile {
  id: string
  name: string | null
  email: string
  role: string
  studentId: string | null
  department: string | null
  semester: string | null
  phone: string | null
  image: string | null
  createdAt: string
  updatedAt: string
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    department: '',
    semester: '',
    phone: '',
    image: ''
  })

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch('/api/profile')
          if (response.ok) {
            const data = await response.json()
            setProfile(data)
            setOriginalProfile(data)
            setFormData({
              name: data.name || '',
              studentId: data.studentId || '',
              department: data.department || '',
              semester: data.semester || '',
              phone: data.phone || '',
              image: data.image || ''
            })
          }
        } catch (error) {
          console.error('Error fetching profile:', error)
        }
      }
    }

    fetchProfile()
  }, [session])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file)
  }

  const uploadFile = async (): Promise<string | null> => {
    if (!selectedFile) return null

    setIsUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', selectedFile)

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: uploadFormData
      })

      const data = await response.json()
      
      if (response.ok) {
        return data.imageUrl
      } else {
        // Handle production limitation gracefully
        if (data.error?.includes('not supported in production')) {
          toast.error('Profile image uploads are not available in production demo. Feature works in development.')
          return data.imageUrl // Use placeholder if provided
        } else {
          toast.error(data.error || 'Failed to upload image')
          return null
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Failed to upload image')
      return null
    } finally {
      setIsUploading(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      let imageUrl = formData.image

      // Upload new image if selected
      if (selectedFile) {
        const uploadedUrl = await uploadFile()
        if (uploadedUrl) {
          imageUrl = uploadedUrl
        } else {
          setIsLoading(false)
          return // Stop if upload failed
        }
      }

      const updateData = {
        name: formData.name,
        studentId: formData.studentId || null,
        department: formData.department || null,
        semester: formData.semester || null,
        phone: formData.phone || null,
        image: imageUrl || null
      }

      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setOriginalProfile(updatedProfile)
        setFormData({
          name: updatedProfile.name || '',
          studentId: updatedProfile.studentId || '',
          department: updatedProfile.department || '',
          semester: updatedProfile.semester || '',
          phone: updatedProfile.phone || '',
          image: updatedProfile.image || ''
        })
        setSelectedFile(null)
        setIsEditing(false)
        
        // Update session if name or image changed
        if (updatedProfile.name !== session?.user?.name || updatedProfile.image !== session?.user?.image) {
          await update({
            name: updatedProfile.name,
            image: updatedProfile.image
          })
        }
        
        toast.success('Profile updated successfully!')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (originalProfile) {
      setFormData({
        name: originalProfile.name || '',
        studentId: originalProfile.studentId || '',
        department: originalProfile.department || '',
        semester: originalProfile.semester || '',
        phone: originalProfile.phone || '',
        image: originalProfile.image || ''
      })
    }
    setSelectedFile(null)
    setIsEditing(false)
  }

  const hasChanges = () => {
    if (!originalProfile) return false
    return (
      formData.name !== (originalProfile.name || '') ||
      formData.studentId !== (originalProfile.studentId || '') ||
      formData.department !== (originalProfile.department || '') ||
      formData.semester !== (originalProfile.semester || '') ||
      formData.phone !== (originalProfile.phone || '') ||
      selectedFile !== null
    )
  }

  if (status === 'loading') {
    return (
      <div className="bracu-bg flex justify-center items-center h-screen relative">
        <div className="text-white relative z-10">Loading...</div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="bracu-bg flex justify-center items-center h-screen relative">
        <div className="text-white relative z-10">Access Denied. Please sign in.</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="bracu-bg flex justify-center items-center h-screen relative">
        <div className="text-white relative z-10">Loading profile...</div>
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
        <div className="container mx-auto max-w-4xl w-full">
          {/* White frosted glass container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-2xl border border-white/60 transition-all duration-300 hover:bg-white/85">
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Profile</h1>
              <p className="text-gray-700 mt-2">Your personal and account details</p>
            </div>
            
            <Card className="max-w-2xl mx-auto bg-white/95 backdrop-blur border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Avatar className="h-16 w-16 sm:h-20 sm:w-20 mx-auto sm:mx-0">
                <AvatarImage 
                  src={selectedFile ? URL.createObjectURL(selectedFile) : (profile.image || undefined)} 
                  alt={profile.name || 'User'} 
                />
                <AvatarFallback>
                  <User className="h-6 w-6 sm:h-8 sm:w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <CardTitle className="text-xl sm:text-2xl">{profile.name}</CardTitle>
                <p className="text-gray-500 text-sm sm:text-base">{profile.email}</p>
                <Badge className="mt-2 text-xs">{profile.role}</Badge>
              </div>
            </div>
            
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
              <div className="space-y-4">
                <FormField
                  id="name"
                  label="Full Name"
                  value={formData.name}
                  onChange={(value) => handleInputChange('name', value)}
                  required
                  placeholder="Enter your full name"
                />

                <FileUpload
                  id="avatar"
                  label="Profile Picture"
                  accept="image/*"
                  onChange={handleFileChange}
                  currentImage={profile.image}
                />

                <FormField
                  id="studentId"
                  label="Student ID"
                  value={formData.studentId}
                  onChange={(value) => handleInputChange('studentId', value)}
                  placeholder="e.g., 20101234"
                />

                <FormField
                  id="department"
                  label="Department"
                  value={formData.department}
                  onChange={(value) => handleInputChange('department', value)}
                  placeholder="e.g., Computer Science and Engineering"
                />

                <FormField
                  id="semester"
                  label="Semester"
                  value={formData.semester}
                  onChange={(value) => handleInputChange('semester', value)}
                  placeholder="e.g., Fall 2024"
                />

                <FormField
                  id="phone"
                  label="Phone Number"
                  type="tel"
                  value={formData.phone}
                  onChange={(value) => handleInputChange('phone', value)}
                  placeholder="e.g., +880 1234567890"
                />
              </div>

              <FormActions
                onSave={handleSave}
                onCancel={handleCancel}
                isLoading={isLoading || isUploading}
                hasChanges={hasChanges()}
              />
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-700">Student ID</h3>
                <p className="text-gray-900">{profile.studentId || 'Not Provided'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Department</h3>
                <p className="text-gray-900">{profile.department || 'Not Provided'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Semester</h3>
                <p className="text-gray-900">{profile.semester || 'Not Provided'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Phone</h3>
                <p className="text-gray-900">{profile.phone || 'Not Provided'}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700">Member Since</h3>
                <p className="text-gray-900">{new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
