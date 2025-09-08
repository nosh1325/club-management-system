import emailjs from '@emailjs/browser'

interface EmailResult {
  success: boolean
  email: string
  error?: string
  provider?: string
}

interface Member {
  id: string
  name: string
  email: string
}

interface ServerEmailParams {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

class EmailService {
  private publicKey: string
  private serviceId: string
  private templateId: string
  private isServer: boolean

  constructor() {
    this.publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || ''
    this.serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || ''
    this.templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID || ''
    this.isServer = typeof window === 'undefined'
  }

  // Send email using server-side API (Resend or Nodemailer fallback)
  private async sendViaAPI(params: ServerEmailParams): Promise<EmailResult> {
    try {
      const response = await fetch('/api/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        return {
          success: true,
          email: Array.isArray(params.to) ? params.to[0] : params.to,
          provider: result.provider || 'api'
        }
      } else {
        throw new Error(result.error || 'API email sending failed')
      }
    } catch (error: any) {
      console.error('API email sending failed:', error)
      return {
        success: false,
        email: Array.isArray(params.to) ? params.to[0] : params.to,
        error: error.message
      }
    }
  }

  // Check if EmailJS is properly configured
  private isEmailJSConfigured(): boolean {
    return !!(this.publicKey && this.serviceId && this.templateId && 
             this.publicKey !== 'your-emailjs-public-key' &&
             this.serviceId !== 'your-emailjs-service-id' &&
             this.templateId !== 'your-emailjs-template-id')
  }

  // Helper function to validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Helper function to check if email is fake/test email or potentially problematic
  private isFakeEmail(email: string): boolean {
    const fakePatterns = [
      /fake/i,
      /test/i,
      /example/i,
      /dummy/i,
      /placeholder/i,
      /@test\./i,
      /@fake\./i,
      /@example\./i,
      /@dummy\./i,
      /noreply/i,
      /no-reply/i,
      /donotreply/i,
      /invalid/i,
      /@localhost/i,
      /@127\.0\.0\.1/i,
      /@0\.0\.0\.0/i
    ]
    
    return fakePatterns.some(pattern => pattern.test(email))
  }

  // Helper function to check if email domain might be problematic
  private isPotentiallyProblematicEmail(email: string): boolean {
    const problematicDomains = [
      '@tempmail',
      '@guerrillamail',
      '@10minutemail',
      '@mailinator',
      '@disposable',
      '@throwaway',
      'temp',
      'temporary'
    ]
    
    const emailLower = email.toLowerCase()
    return problematicDomains.some(domain => emailLower.includes(domain))
  }

  // Simulate email sending for development
  private async simulateEmailSending(email: string, subject: string, message: string): Promise<EmailResult> {
    // Log to both server console and browser console
    const logMessage = `
=== 📧 EMAIL SIMULATION (EmailJS not configured) ===
To: ${email}
Subject: ${subject}
Message: ${message}
Time: ${new Date().toLocaleString()}
===============================================`
    
    console.log(logMessage)
    
    // Also log to browser console if available
    if (typeof window !== 'undefined') {
      console.log('📧 EMAIL SIMULATION:', {
        to: email,
        subject: subject,
        message: message,
        timestamp: new Date().toISOString()
      })
    }
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return {
      success: true,
      email: email
    }
  }

  async sendEmailToMember(
    memberEmail: string, 
    memberName: string, 
    subject: string, 
    message: string,
    clubName: string,
    senderName: string,
    useServerAPI: boolean = false
  ): Promise<EmailResult> {
    try {
      // Validate email format
      if (!this.isValidEmail(memberEmail)) {
        return {
          success: true, 
          email: memberEmail,
          error: 'Skipped invalid email format'
        }
      }

      if (this.isFakeEmail(memberEmail)) {
        return {
          success: true,
          email: memberEmail,
          error: 'Skipped fake email'
        }
      }

      
      if (this.isPotentiallyProblematicEmail(memberEmail)) {
        return {
          success: true,
          email: memberEmail,
          error: 'Skipped potentially problematic email'
        }
      }

      // Use server-side API if requested or if on server
      if (useServerAPI || this.isServer) {
        const htmlMessage = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Message from ${clubName}</h2>
            <p><strong>From:</strong> ${senderName}</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
            <p style="color: #64748b; font-size: 14px;">
              This email was sent from the Club Management System at BRAC University.
            </p>
          </div>
        `

        return await this.sendViaAPI({
          to: memberEmail,
          subject: `[${clubName}] ${subject}`,
          html: htmlMessage,
          text: `From: ${senderName} - ${clubName}\n\n${message}`
        })
      }

      // If EmailJS is not configured, simulate email sending
      if (!this.isEmailJSConfigured()) {
        console.warn('EmailJS not configured. Simulating email sending for development.')
        const result = await this.simulateEmailSending(memberEmail, subject, message)
        
        // Add a visual indicator for simulation
        if (typeof window !== 'undefined') {
          // Create a temporary notification in the browser
          const notification = document.createElement('div')
          notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #3b82f6;
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            z-index: 10000;
            font-family: system-ui, -apple-system, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          `
          notification.innerHTML = `📧 Email Simulated: ${memberEmail}`
          document.body.appendChild(notification)
          
          // Remove after 3 seconds
          setTimeout(() => {
            if (notification.parentNode) {
              notification.parentNode.removeChild(notification)
            }
          }, 3000)
        }
        
        return result
      }

      const templateParams = {
        to_email: memberEmail,
        to_name: memberName,
        subject: subject,
        message: message,
        club_name: clubName,
        sender_name: senderName,
        from_name: `${senderName} - ${clubName}`
      }

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      )

      return {
        success: true,
        email: memberEmail,
        provider: 'emailjs'
      }
    } catch (error: any) {
      console.error(`Failed to send email to ${memberEmail}:`, error)
      
      
      if (error?.status === 400 || error?.status === 422) {
        return {
          success: true, // Mark as success but skip to handle errors with false  address
          email: memberEmail,
          error: 'Skipped email with delivery issues'
        }
      }
      
      
      return {
        success: true, 
        email: memberEmail,
        error: `Skipped due to error: ${error?.message || 'Unknown error'}`
      }
    }
  }

  async sendBulkEmails(
    members: Member[], 
    subject: string, 
    message: string,
    clubName: string,
    senderName: string,
    useServerAPI: boolean = false
  ): Promise<{
    results: EmailResult[]
    summary: {
      total: number
      sent: number
      skipped: number
      failed: number
    }
  }> {
    const results: EmailResult[] = []
    let sent = 0
    let skipped = 0
    let failed = 0

    // If EmailJS is not configured and not using server API, log a warning
    if (!useServerAPI && !this.isServer && !this.isEmailJSConfigured()) {
      console.warn('⚠️  EmailJS not configured. Emails will be simulated in console.')
      console.log('📧 To configure real email sending:')
      console.log('1. Create an EmailJS account at https://www.emailjs.com/')
      console.log('2. Set up a service and email template')
      console.log('3. Update your .env file with:')
      console.log('   NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_public_key')
      console.log('   NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_service_id')
      console.log('   NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_template_id')
      console.log('4. Or use server-side email by setting useServerAPI=true')
    }
    
    for (const member of members) {
      const result = await this.sendEmailToMember(
        member.email,
        member.name,
        subject,
        message,
        clubName,
        senderName,
        useServerAPI
      )
      
      results.push(result)
      
      if (result.success) {
        if (result.error && result.error.startsWith('Skipped')) {
          skipped++
        } else {
          sent++
        }
      } else {
        failed++
      }

      //Adding delay between sending emails to avoid rate limiting      
      if (this.isValidEmail(member.email) && 
          !this.isFakeEmail(member.email) && 
          !this.isPotentiallyProblematicEmail(member.email) &&
          result.success && 
          !result.error) {
        const delay = useServerAPI || this.isServer ? 500 : (this.isEmailJSConfigured() ? 1000 : 100)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
    
    return {
      results,
      summary: {
        total: members.length,
        sent,
        skipped,
        failed
      }
    }
  }
}

export default new EmailService()
