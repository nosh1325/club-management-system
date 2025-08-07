import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/admin/clubs/[clubId]/members
export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Extract clubId from the URL path
  const url = new URL(req.url);
  const segments = url.pathname.split('/');
 
  const clubIdIndex = segments.findIndex(seg => seg === 'members') - 1;
  const clubId = segments[clubIdIndex];
  if (!clubId) {
    return NextResponse.json({ error: 'Missing clubId' }, { status: 400 });
  }

  console.log('API /admin/clubs/[clubId]/members called with clubId:', clubId);

  // Fetch accepted members of the club
  const memberships = await db.membership.findMany({
    where: {
      clubId,
      status: 'ACCEPTED',
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  const members = memberships.map((m) => m.user);
  console.log('Found members:', members);
  return NextResponse.json({ members });
}
