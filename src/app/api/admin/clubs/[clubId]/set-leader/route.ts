import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { z } from 'zod';
import type { UserRole } from '@/types';

const SetLeaderSchema = z.object({
  leaderId: z.string(),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  // Extract clubId from the URL path
  const url = new URL(req.url);
  const segments = url.pathname.split('/');
  const clubIdIndex = segments.findIndex(seg => seg === 'set-leader') - 1;
  const clubId = segments[clubIdIndex];
  if (!clubId) {
    return NextResponse.json({ error: 'Missing clubId' }, { status: 400 });
  }
  const body = await req.json();
  const parse = SetLeaderSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
  const { leaderId } = parse.data;

  // Updating club leader
  const club = await db.club.update({
    where: { id: clubId },
    data: { leaderId },
  });

  
  await db.user.update({
    where: { id: leaderId },
    data: { role: 'CLUB_LEADER' as UserRole },
  });

  return NextResponse.json({ success: true, club });
}
