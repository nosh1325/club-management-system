'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Mail, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function EmailTestPage() {
  const [testEmail, setTestEmail] = useState('test@example.com')
  const [subject, setSubject] = useState('Test Email from Club Management System')
  const [message, setMessage] = useState('This is a test email to verify our email system is working correctly.')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleTest = async () => {
    setLoading(true)
    setResult(null)

    try {
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Test Email</h2>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${message.replace(/\n/g, '<br>')}
          </div>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #64748b; font-size: 14px;">
            This email was sent from the Club Management System test page.
          </p>
        </div>
      `

      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testEmail,
          subject: subject,
          html: emailHtml,
          text: message
        })
      })

      const data = await response.json()
      setResult({
        success: response.ok && data.success,
        data: data,
        status: response.status
      })
    } catch (error: any) {
      setResult({
        success: false,
        data: { error: error?.message || 'Unknown error' },
        status: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const handleApiStatus = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/email/send', {
        method: 'GET'
      })

      const data = await response.json()
      setResult({
        success: response.ok,
        data: data,
        status: response.status
      })
    } catch (error: any) {
      setResult({
        success: false,
        data: { error: error?.message || 'Unknown error' },
        status: 0
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email System Test
            </CardTitle>
            <CardDescription>
              Test the email functionality with Resend and Nodemailer fallback
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="testEmail">Test Email Address</Label>
                  <Input
                    id="testEmail"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="Enter test email address"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject"
                  />
                </div>
                <div>
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Email message"
                    className="w-full p-2 border rounded-md min-h-[100px]"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={handleTest} 
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Test Email
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleApiStatus} 
                    disabled={loading}
                    variant="outline"
                  >
                    Check API Status
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold">Result</h3>
                {result ? (
                  <div className={`p-4 rounded-lg border ${
                    result.success 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <AlertCircle className="h-5 w-5" />
                      )}
                      <span className="font-medium">
                        {result.success ? 'Success' : 'Failed'}
                      </span>
                      <span className="text-sm">
                        (Status: {result.status})
                      </span>
                    </div>
                    <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-96 bg-white/50 p-2 rounded">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-600">
                    No result yet. Click a button above to test.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Configuration Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Resend Configuration</h4>
                <ul className="space-y-1">
                  <li>API Key: {process.env.NEXT_PUBLIC_RESEND_API_KEY ? '✅ Set' : '❌ Not set'}</li>
                  <li>From Email: {process.env.NEXT_PUBLIC_RESEND_FROM_EMAIL || 'noreply@clubconnect.bracu.ac.bd'}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">EmailJS Configuration</h4>
                <ul className="space-y-1">
                  <li>Public Key: {process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? '✅ Set' : '❌ Not set'}</li>
                  <li>Service ID: {process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ? '✅ Set' : '❌ Not set'}</li>
                  <li>Template ID: {process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ? '✅ Set' : '❌ Not set'}</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
