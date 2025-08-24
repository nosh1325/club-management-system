'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Send, Loader2 } from 'lucide-react'

interface EmailFormProps {
  onEmailSent?: (result: any) => void
  memberInfo?: {
    id: string
    name: string
    email: string
    clubName: string
  }
}

export default function EmailForm({ onEmailSent, memberInfo }: EmailFormProps) {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject.trim() || !message.trim()) {
      showNotification('error', 'Please fill in both subject and message')
      return
    }

    if (!memberInfo) {
      showNotification('error', 'No member selected')
      return
    }

    setSending(true)

    try {
       //email form validation
      const validateResponse = await fetch('/api/email/send-to-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId: memberInfo.id,
          subject: subject.trim(),
          message: message.trim()
        })
      })

      const validateResult = await validateResponse.json()

      if (!validateResponse.ok) {
        showNotification('error', validateResult.error || 'Failed to validate member')
        return
      }

    
      const { default: emailService } = await import('@/lib/emailService')
      
      const emailResult = await emailService.sendEmailToMember(
        validateResult.memberData.email,
        validateResult.memberData.name,
        validateResult.emailData.subject,
        validateResult.emailData.message,
        validateResult.memberData.clubName,
        validateResult.memberData.senderName
      )

      if (emailResult.success) {
        const message = emailResult.error === 'Skipped fake email' 
          ? 'Email skipped (fake email address)' 
          : 'Email sent successfully!'
        showNotification('success', message)
        setSubject('')
        setMessage('')
        onEmailSent?.(emailResult)
      } else {
        showNotification('error', emailResult.error || 'Failed to send email')
      }
    } catch (error) {
      console.error('Error sending email:', error)
      showNotification('error', 'Failed to send email. Please try again.')
    } finally {
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Send Email
        </CardTitle>
        <CardDescription>
          {memberInfo 
            ? `Send an email to ${memberInfo.name} (${memberInfo.email}) from ${memberInfo.clubName}`
            : 'Select a member to send an email'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notification && (
          <div className={`mb-4 p-3 rounded-lg ${
            notification.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {notification.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject..."
              disabled={sending || !memberInfo}
              required
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              disabled={sending || !memberInfo}
              required
              className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
            />
          </div>

          <Button 
            type="submit" 
            disabled={sending || !memberInfo || !subject.trim() || !message.trim()}
            className="w-full"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Email
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
