'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Send, Loader2, X, Users, Check, AlertCircle } from 'lucide-react'

interface Club {
  id: string
  name: string
  memberCount: number
}

interface BulkEmailModalProps {
  isOpen: boolean
  onClose: () => void
  clubs: Club[]
  onEmailSent?: (result: any) => void
}

export default function BulkEmailModal({ isOpen, onClose, clubs, onEmailSent }: BulkEmailModalProps) {
  const [selectedClubId, setSelectedClubId] = useState<string>('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  // Resetting form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedClubId('')
      setSubject('')
      setMessage('')
      setNotification(null)
    }
  }, [isOpen])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const selectedClub = clubs.find(club => club.id === selectedClubId)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject.trim() || !message.trim()) {
      showNotification('error', 'Please fill in both subject and message')
      return
    }

    setSending(true)

    try {
      const requestBody: any = {
        subject: subject.trim(),
        message: message.trim()
      }

      
      if (selectedClubId) {
        requestBody.clubId = selectedClubId
      }

      
      const response = await fetch('/api/email/send-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      const result = await response.json()

      if (!response.ok) {
        showNotification('error', result.error || 'Failed to prepare emails')
        return
      }

      
      // Use server-side email API instead of client-side service
      let totalSent = 0
      let totalSkipped = 0
      let totalFailed = 0
      const allResults = []

      // Send emails for each club using server-side API
      for (const [clubName, members] of Object.entries(result.membersByClub as Record<string, Array<{ id: string; name: string; email: string }>>)) {
        try {
          // Send individual emails using our new API endpoint
          let sent = 0
          let failed = 0
          const results = []

          for (const member of members) {
            try {
              const emailHtml = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                  <h2 style="color: #2563eb;">Message from ${clubName}</h2>
                  <p><strong>From:</strong> ${result.senderName}</p>
                  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    ${result.emailData.message.replace(/\n/g, '<br>')}
                  </div>
                  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
                  <p style="color: #64748b; font-size: 14px;">
                    This email was sent from the Club Management System at BRAC University.
                  </p>
                </div>
              `

              const response = await fetch('/api/email/send', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  to: member.email,
                  subject: `[${clubName}] ${result.emailData.subject}`,
                  html: emailHtml,
                  text: `From: ${result.senderName} - ${clubName}\n\n${result.emailData.message}`
                }),
              })

              const emailResult = await response.json()
              
              if (response.ok && emailResult.success) {
                sent++
                results.push({ email: member.email, success: true, provider: emailResult.provider })
              } else {
                failed++
                results.push({ email: member.email, success: false, error: emailResult.error })
              }
            } catch (error) {
              failed++
              results.push({ email: member.email, success: false, error: `Network error: ${error}` })
            }

            // Small delay between emails
            await new Promise(resolve => setTimeout(resolve, 100))
          }
          
          allResults.push({
            club: clubName,
            sent: sent,
            failed: failed,
            skipped: 0,
            results: results
          })
          
          totalSent += sent
          totalFailed += failed
        } catch (error) {
          console.error(`Failed to send emails to ${clubName}:`, error)
          allResults.push({
            club: clubName,
            sent: 0,
            failed: members.length,
            skipped: 0,
            results: members.map(member => ({
              success: false,
              email: member.email,
              error: 'Failed to send email'
            }))
          })
          
          totalFailed += members.length
        }
      }

      const finalResult = {
        message: `Bulk email completed. ${totalSent} sent, ${totalSkipped} skipped (fake emails), ${totalFailed} failed.`,
        summary: {
          total: result.totalMembers,
          sent: totalSent,
          skipped: totalSkipped,
          failed: totalFailed
        },
        results: allResults
      }

      showNotification('success', finalResult.message)
      onEmailSent?.(finalResult)
      
      // Close modal after successful send
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      console.error('Error sending bulk emails:', error)
      showNotification('error', 'Failed to send emails. Please try again.')
    } finally {
      setSending(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Send Bulk Email
                </CardTitle>
                <CardDescription>
                  Send an email to all approved members of your clubs
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={sending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {notification && (
              <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                notification.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {notification.type === 'success' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                {notification.message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Club Selection */}
              <div>
                <Label htmlFor="club-select">Send to Club (Optional)</Label>
                <select
                  id="club-select"
                  value={selectedClubId}
                  onChange={(e) => setSelectedClubId(e.target.value)}
                  disabled={sending}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Clubs You Lead</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name} ({club.memberCount} members)
                    </option>
                  ))}
                </select>
                {selectedClub && (
                  <p className="text-sm text-gray-600 mt-1">
                    This email will be sent to {selectedClub.memberCount} approved members of {selectedClub.name}
                  </p>
                )}
                {!selectedClubId && clubs.length > 1 && (
                  <p className="text-sm text-gray-600 mt-1">
                    This email will be sent to all approved members of all clubs you lead
                  </p>
                )}
              </div>

              {/* Subject */}
              <div>
                <Label htmlFor="bulk-subject">Subject</Label>
                <Input
                  id="bulk-subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject..."
                  disabled={sending}
                  required
                />
              </div>

              {/* Message */}
              <div>
                <Label htmlFor="bulk-message">Message</Label>
                <textarea
                  id="bulk-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  disabled={sending}
                  required
                  className="w-full min-h-[150px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button 
                  type="submit" 
                  disabled={sending || !subject.trim() || !message.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending....
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send to {selectedClub ? selectedClub.memberCount : 'All'} Members
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={sending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
