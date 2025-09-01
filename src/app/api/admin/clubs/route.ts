import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// POST /api/admin/clubs - Create a new club
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      department,
      category,
      status = 'ACTIVE',
      foundedYear,
      vision,
      mission,
      website,
      email,
      phone,
      advisor,
      activities
    } = body;

    // Validate required fields
    if (!name || !department) {
      return NextResponse.json(
        { error: 'Name and department are required.' },
        { status: 400 }
      );
    }

    // Check if club name already exists
    const existingClub = await db.club.findUnique({
      where: { name }
    });

    if (existingClub) {
      return NextResponse.json(
        { error: 'A club with this name already exists.' },
        { status: 409 }
      );
    }

    // Process activities - ensure it's stored as JSON string
    let activitiesJson = null;
    if (activities) {
      if (Array.isArray(activities)) {
        activitiesJson = JSON.stringify(activities);
      } else if (typeof activities === 'string') {
        try {
          // Try to parse it as JSON first
          JSON.parse(activities);
          activitiesJson = activities;
        } catch {
          // If not valid JSON, treat as comma-separated string
          activitiesJson = JSON.stringify(activities.split(',').map(item => item.trim()));
        }
      }
    }

    // Create the club
    const newClub = await db.club.create({
      data: {
        name,
        description: description || null,
        department,
        category: category || null,
        status,
        foundedYear: foundedYear ? parseInt(foundedYear, 10) : null,
        vision: vision || null,
        mission: mission || null,
        website: website || null,
        email: email || null,
        phone: phone || null,
        advisor: advisor || null,
        activities: activitiesJson,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        leader: {
          select: { name: true, email: true }
        },
        _count: {
          select: { 
            memberships: { where: { status: 'ACCEPTED' } },
            events: true
          }
        }
      }
    });

    // Format response similar to the clubs list
    const clubResponse = {
      id: newClub.id,
      name: newClub.name,
      description: newClub.description,
      department: newClub.department,
      category: newClub.category,
      status: newClub.status,
      foundedYear: newClub.foundedYear,
      vision: newClub.vision,
      mission: newClub.mission,
      website: newClub.website,
      email: newClub.email,
      phone: newClub.phone,
      advisor: newClub.advisor,
      activities: newClub.activities ? JSON.parse(newClub.activities as string) : [],
      leader: newClub.leader || { name: 'No Leader', email: '' },
      memberCount: newClub._count.memberships,
      eventCount: newClub._count.events,
      createdAt: newClub.createdAt,
      updatedAt: newClub.updatedAt
    };

    return NextResponse.json({
      message: 'Club created successfully',
      club: clubResponse
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating club:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/clubs - Delete a club by ID (passed in request body)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { clubId } = body;

    if (!clubId) {
      return NextResponse.json(
        { error: 'Club ID is required.' },
        { status: 400 }
      );
    }

    // Check if club exists
    const club = await db.club.findUnique({
      where: { id: clubId },
      include: {
        _count: {
          select: {
            memberships: true,
            events: true
          }
        }
      }
    });

    if (!club) {
      return NextResponse.json(
        { error: 'Club not found.' },
        { status: 404 }
      );
    }

    // Delete club and all related data (using cascade delete)
    await db.club.delete({
      where: { id: clubId }
    });

    return NextResponse.json(
      { 
        message: 'Club deleted successfully',
        deletedClub: {
          id: club.id,
          name: club.name,
          memberCount: club._count.memberships,
          eventCount: club._count.events
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting club:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
