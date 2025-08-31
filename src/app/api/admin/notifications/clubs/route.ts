import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const clubs = await db.club.findMany({
      select: {
        id: true,
        name: true,
        department: true,
        _count: {
          select: {
            memberships: {
              where: { status: 'ACCEPTED' }
            }
          }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(clubs)

  } catch (error) {
    console.error('Error fetching clubs for notifications:', error)
    return NextResponse.json(
      { error: 'Failed to fetch clubs' },
      { status: 500 }
    )
  }
}