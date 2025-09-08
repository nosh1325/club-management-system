import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import serverEmailService from '@/lib/serverEmailService'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { userId, subject, message, recipients, clubName, senderName } = body

    // Handle bulk email sending
    if (recipients && Array.isArray(recipients)) {
      let sent = 0
      let failed = 0
      const results = []

      for (const email of recipients) {
        try {
          const emailResult = await serverEmailService.sendEmail({
            to: email,
            subject: subject,
            text: `Hello,

${message}

Best regards,
${senderName || session.user.name || 'Admin'}
BRACU Administration`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                  <h1 style="margin: 0; font-size: 24px;">Club Connect</h1>
                  <p style="margin: 5px 0 0 0; opacity: 0.9;">BRAC University</p>
                </div>
                <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                  <h2 style="color: #333; margin-top: 0;">${subject}</h2>
                  <p>Hello,</p>
                  <div style="margin: 20px 0; line-height: 1.6; color: #555;">
                    ${message.replace(/\n/g, '<br>')}
                  </div>
                  <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
                  <p style="color: #666; font-size: 14px; margin-bottom: 0;">
                    Best regards,<br>
                    <strong>${senderName || session.user.name || 'Admin'}</strong><br>
                    BRAC University Administration<br>
                    <em>Club Management System${clubName ? ` - ${clubName}` : ''}</em>
                  </p>
                </div>
              </div>
            `
          })

          if (emailResult.success) {
            sent++
            results.push({
              success: true,
              email: email,
              messageId: emailResult.messageId
            })
          } else {
            failed++
            results.push({
              success: false,
              email: email,
              error: emailResult.error || 'Failed to send'
            })
          }
        } catch (error) {
          console.error(`Error sending email to ${email}:`, error)
          failed++
          results.push({
            success: false,
            email: email,
            error: 'Network error'
          })
        }
      }

      // Log the bulk email to notifications table
      await db.notification.create({
        data: {
          title: `Bulk email sent: ${subject}`,
          message: `Sent to ${sent} recipients${clubName ? ` in ${clubName}` : ''}. Failed: ${failed}`,
          type: 'EMAIL',
          recipients: JSON.stringify(recipients)
        }
      })

      return NextResponse.json({
        success: true,
        sent,
        failed,
        results,
        message: `Successfully sent ${sent} emails. ${failed} failed.`
      })
    }

    // Handle single email sending (existing functionality)
    if (!userId || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, subject, message (or recipients for bulk)' },
        { status: 400 }
      )
    }

    // Get user details 
    const user = await db.user.findUnique({
      where: {
        id: userId
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Send email using server-side service
    const emailResult = await serverEmailService.sendEmail({
      to: user.email,
      subject: subject,
      text: `Hello ${user.name || 'User'},

${message}

Best regards,
${session.user.name || 'Admin'}
BRACU Administration`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Club Connect</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">BRAC University</p>
          </div>
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-top: 0;">${subject}</h2>
            <p>Hello ${user.name || 'User'},</p>
            <div style="margin: 20px 0; line-height: 1.6; color: #555;">
              ${message.replace(/\n/g, '<br>')}
            </div>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 14px; margin-bottom: 0;">
              Best regards,<br>
              <strong>${session.user.name || 'Admin'}</strong><br>
              BRAC University Administration<br>
              <em>Club Management System</em>
            </p>
          </div>
        </div>
      `
    })

    if (emailResult.success) {
      // Log the successful email to notifications table
      await db.notification.create({
        data: {
          title: `Email sent to ${user.name || user.email}`,
          message: `Subject: ${subject}`,
          type: 'EMAIL',
          recipients: JSON.stringify([user.email]) // Store as JSON array
        }
      })

      return NextResponse.json({
        success: true,
        message: emailResult.error ? 
          'Email simulated successfully (SMTP not configured)' : 
          'Email sent successfully',
        messageId: emailResult.messageId,
        simulation: !!emailResult.error
      })
    } else {
      return NextResponse.json(
        { 
          error: emailResult.error || 'Failed to send email',
          success: false 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
