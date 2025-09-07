import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'CLUB_LEADER' && session.user.role !== 'ADMIN')) {
      return NextResponse.json(
        { error: 'Unauthorized. Only club leaders can send emails.' },
        { status: 401 }
      )
    }

    const { memberId, subject, message } = await request.json()

    if (!memberId || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: memberId, subject, message' },
        { status: 400 }
      )
    }

    //member details 
    const membership = await db.membership.findFirst({
      where: {
        userId: memberId,
        status: 'ACCEPTED'
      },
      include: {
        user: true,
        club: {
          include: {
            leader: true
          }
        }
      }
    })

    if (!membership) {
      return NextResponse.json(
        { error: 'Member not found or not accepted' },
        { status: 404 }
      )
    }

    
    if (session.user.role !== 'ADMIN' && membership.club.leaderId !== session.user.id) {
      return NextResponse.json(
        { error: 'You are not authorized to send emails to this club member' },
        { status: 403 }
      )
    }

    //returning validated member data 
    return NextResponse.json({
      memberData: {
        email: membership.user.email,
        name: membership.user.name || 'Member',
        clubName: membership.club.name,
        senderName: session.user.name || 'Club Leader'
      },
      emailData: {
        subject,
        message
      }
    })

  } catch (error) {
    console.error('Error validating member for email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
