import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Fetch budget requests for the user's clubs
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    // Only club leaders can access budget requests
    if (session.user.role !== 'CLUB_LEADER') {
      return NextResponse.json({
        requests: [],
        clubs: [],
        total: 0,
        message: 'Only club leaders can access budget requests.'
      }, { status: 403 })
    }

    // Get clubs where user is the direct leader (leaderId field)
    const userClubs = await db.club.findMany({
      where: { leaderId: session.user.id },
      select: {
        id: true,
        name: true,
        department: true
      }
    })

    const clubIds = userClubs.map(club => club.id)

    if (clubIds.length === 0) {
      return NextResponse.json({
        requests: [],
        clubs: [],
        total: 0,
        message: 'You must be assigned as a club leader to access budget requests.'
      })
    }

    // Fetch budget requests for user's clubs
    const budgetRequests = await db.budgetRequest.findMany({
      where: {
        OR: [
          { requestedBy: session.user.id }, // Requests made by the user
          { clubId: { in: clubIds } } // Requests for clubs they lead
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        club: {
          select: {
            id: true,
            name: true,
            department: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedRequests = budgetRequests.map(request => ({
      id: request.id,
      title: request.title,
      description: request.description,
      amount: request.amount,
      purpose: request.purpose,
      status: request.status,
      requestedAt: request.requestedAt?.toISOString() || null,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      user: request.user,
      club: request.club,
      isOwnRequest: request.requestedBy === session.user.id
    }))

    const clubs = userClubs.map(club => ({
      id: club.id,
      name: club.name,
      department: club.department,
      role: 'Leader' // All are leaders since they have leaderId
    }))

    return NextResponse.json({
      requests: formattedRequests,
      clubs: clubs,
      total: formattedRequests.length
    })
  } catch (error) {
    console.error('Error fetching budget requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new budget request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in.' },
        { status: 401 }
      )
    }

    // Only club leaders can create budget requests
    if (session.user.role !== 'CLUB_LEADER') {
      return NextResponse.json(
        { error: 'Only club leaders can create budget requests.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { title, description, amount, purpose, clubId } = body

    // Validation
    if (!title || !amount || !clubId) {
      return NextResponse.json(
        { error: 'Title, amount, and club are required.' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0.' },
        { status: 400 }
      )
    }

    // Check if user is the leader of the specified club
    const club = await db.club.findFirst({
      where: {
        id: clubId,
        leaderId: session.user.id
      }
    })

    if (!club) {
      return NextResponse.json(
        { error: 'You must be the leader of the club to create budget requests for it.' },
        { status: 403 }
      )
    }

    // Create the budget request
    const budgetRequest = await db.budgetRequest.create({
      data: {
        title,
        description: description || null,
        amount: parseFloat(amount),
        purpose: purpose || null,
        status: 'PENDING',
        requestedBy: session.user.id,
        clubId: clubId,
        requestedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        club: {
          select: {
            id: true,
            name: true,
            department: true
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Budget request created successfully',
      request: {
        id: budgetRequest.id,
        title: budgetRequest.title,
        description: budgetRequest.description,
        amount: budgetRequest.amount,
        purpose: budgetRequest.purpose,
        status: budgetRequest.status,
        requestedAt: budgetRequest.requestedAt?.toISOString() || null,
        createdAt: budgetRequest.createdAt.toISOString(),
        user: budgetRequest.user,
        club: budgetRequest.club
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating budget request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
