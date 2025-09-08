import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

interface EmailRequest {
  to: string | string[]
  subject: string
  html: string
  text?: string
}

interface EmailResponse {
  success: boolean
  messageId?: string
  error?: string
  provider?: string
}

// Initialize Resend
const resend = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 'your-resend-api-key' 
  ? new Resend(process.env.RESEND_API_KEY) 
  : null

// Fallback to Nodemailer/Simulation
async function fallbackToNodemailer(params: EmailRequest): Promise<EmailResponse> {
  try {
    const { sendEmail } = await import('../../../../lib/serverEmailService')
    
    const result = await sendEmail({
      to: Array.isArray(params.to) ? params.to[0] : params.to,
      subject: params.subject,
      text: params.text || stripHtml(params.html),
      html: params.html
    })

    return {
      success: result.success,
      messageId: result.messageId,
      error: result.error,
      provider: result.success ? 'nodemailer' : 'simulation'
    }
  } catch (error: any) {
    console.error('Fallback email service failed:', error)
    
    // If all else fails, use pure simulation mode
    return await simulateEmailSending(params)
  }
}

// Pure simulation mode as final fallback
async function simulateEmailSending(params: EmailRequest): Promise<EmailResponse> {
  const recipient = Array.isArray(params.to) ? params.to[0] : params.to
  
  console.log(`
=== 📧 EMAIL SIMULATION ===
To: ${recipient}
Subject: ${params.subject}
Content: ${stripHtml(params.html)}
Time: ${new Date().toLocaleString()}
========================`)
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 500))
  
  return {
    success: true,
    messageId: `sim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    provider: 'simulation'
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: EmailRequest = await request.json()
    const { to, subject, html, text } = body

    // Validate request
    if (!to || !subject || !html) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, subject, html' },
        { status: 400 }
      )
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@clubconnect.bracu.ac.bd'

    // Try Resend first
    if (resend) {
      try {
        console.log('📧 Attempting to send email via Resend...')
        
        const result = await resend.emails.send({
          from: fromEmail,
          to: Array.isArray(to) ? to : [to],
          subject,
          html,
          text: text || stripHtml(html),
        })

        if (result.data) {
          console.log('✅ Email sent successfully via Resend:', result.data.id)
          return NextResponse.json({
            success: true,
            messageId: result.data.id,
            provider: 'resend'
          })
        } else if (result.error) {
          console.error('❌ Resend error:', result.error)
          // Fall back to Nodemailer
          const fallbackResult = await fallbackToNodemailer(body)
          return NextResponse.json(fallbackResult)
        }
      } catch (error: any) {
        console.error('❌ Resend sending failed:', error)
        // Fall back to Nodemailer
        const fallbackResult = await fallbackToNodemailer(body)
        return NextResponse.json(fallbackResult)
      }
    } else {
      console.log('⚠️ Resend not configured, using fallback...')
    }

    // Fallback to Nodemailer
    const fallbackResult = await fallbackToNodemailer(body)
    return NextResponse.json(fallbackResult)

  } catch (error: any) {
    console.error('❌ Email API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Internal server error',
        provider: 'none' 
      },
      { status: 500 }
    )
  }
}

// Test endpoint
export async function GET(): Promise<NextResponse> {
  const resendConfigured = !!resend
  const nodemailerConfigured = !!(process.env.EMAIL_USER && process.env.EMAIL_HOST)
  
  return NextResponse.json({
    status: 'Email API is running',
    providers: {
      resend: {
        configured: resendConfigured,
        fromEmail: process.env.RESEND_FROM_EMAIL || 'noreply@clubconnect.bracu.ac.bd'
      },
      nodemailer: {
        configured: nodemailerConfigured,
        simulation: process.env.EMAIL_PASSWORD === 'simulation_mode'
      }
    },
    timestamp: new Date().toISOString()
  })
}
