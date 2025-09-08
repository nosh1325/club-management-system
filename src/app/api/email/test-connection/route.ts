import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import serverEmailService from '@/lib/serverEmailService'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    // Test the email connection
    const isConnected = await serverEmailService.testConnection()
    
    return NextResponse.json({
      success: true,
      connected: isConnected,
      message: isConnected 
        ? 'SMTP connection successful! Real emails can be sent.' 
        : 'SMTP not configured or connection failed. Emails will be simulated.',
      config: {
        host: process.env.EMAIL_HOST || 'Not set',
        port: process.env.EMAIL_PORT || 'Not set',
        user: process.env.EMAIL_USER ? '***@' + process.env.EMAIL_USER.split('@')[1] : 'Not set',
        secure: process.env.EMAIL_SECURE || 'false'
      }
    })

  } catch (error) {
    console.error('Error testing email connection:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test email connection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
