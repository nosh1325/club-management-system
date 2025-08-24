import emailjs from '@emailjs/browser'

interface EmailResult {
  success: boolean
  email: string
  error?: string
}

interface Member {
  id: string
  name: string
  email: string
}

class EmailService {
  private publicKey: string
  private serviceId: string
  private templateId: string

  constructor() {
    this.publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
    this.serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!
    this.templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!
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

  async sendEmailToMember(
    memberEmail: string, 
    memberName: string, 
    subject: string, 
    message: string,
    clubName: string,
    senderName: string
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
        email: memberEmail
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
    senderName: string
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
    
    for (const member of members) {
      const result = await this.sendEmailToMember(
        member.email,
        member.name,
        subject,
        message,
        clubName,
        senderName
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

      //Adding 1 sec delay between sending real emails      
      if (this.isValidEmail(member.email) && 
          !this.isFakeEmail(member.email) && 
          !this.isPotentiallyProblematicEmail(member.email) &&
          result.success && 
          !result.error) {
        await new Promise(resolve => setTimeout(resolve, 1000))
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
