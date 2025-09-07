import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { userId, subject, message } = await request.json()

    if (!userId || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, subject, message' },
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

    // Return validated user data 
    return NextResponse.json({
      memberData: {
        email: user.email,
        name: user.name || 'User',
        clubName: 'BRACU Administration',
        senderName: session.user.name || 'Admin'
      },
      emailData: {
        subject,
        message
      }
    })

  } catch (error) {
    console.error('Error validating user for admin email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
