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

    const { clubId, subject, message, memberIds } = await request.json()

    if (!subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: subject, message' },
        { status: 400 }
      )
    }

    let whereClause: any = {
      status: 'ACCEPTED'
    }

    if (clubId) {
      whereClause.clubId = clubId
      
      if (session.user.role !== 'ADMIN') {
        const club = await db.club.findUnique({
          where: { id: clubId }
        })
        
        if (!club || club.leaderId !== session.user.id) {
          return NextResponse.json(
            { error: 'You are not authorized to send emails to this club' },
            { status: 403 }
          )
        }
      }
    } else {
      
      if (session.user.role !== 'ADMIN') {
        const userClubs = await db.club.findMany({
          where: { leaderId: session.user.id },
          select: { id: true }
        })
        
        if (userClubs.length === 0) {
          return NextResponse.json(
            { error: 'You are not leading any clubs' },
            { status: 403 }
          )
        }
        
        whereClause.clubId = {
          in: userClubs.map(club => club.id)
        }
      }
    }

    // If specific member IDs are provided, filter by them
    if (memberIds && memberIds.length > 0) {
      whereClause.userId = {
        in: memberIds
      }
    }

    // Get all accepted members
    const memberships = await db.membership.findMany({
      where: whereClause,
      include: {
        user: true,
        club: true
      }
    })

    if (memberships.length === 0) {
      return NextResponse.json(
        { error: 'No members found to send emails to' },
        { status: 404 }
      )
    }

    
    const membersByClub = memberships.reduce((acc, membership) => {
      const clubName = membership.club.name
      if (!acc[clubName]) {
        acc[clubName] = []
      }
      acc[clubName].push({
        id: membership.user.id,
        name: membership.user.name || 'Member',
        email: membership.user.email
      })
      return acc
    }, {} as Record<string, Array<{ id: string; name: string; email: string }>>)

    // Return data for client-side email sending
    return NextResponse.json({
      membersByClub,
      emailData: {
        subject,
        message
      },
      senderName: session.user.name || 'Club Leader',
      totalMembers: memberships.length
    })

  } catch (error) {
    console.error('Error preparing bulk email:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
