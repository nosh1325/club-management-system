import { NextResponse } from 'next/server';
import { db } from '@/lib/db'; //database connection,db is database connection object
import { getServerSession } from 'next-auth'; //function to check logged in user
import { authOptions } from '@/lib/auth'; //authentication system
import { z } from 'zod'; //zod is a validation library for checking data formats
import type { UserRole } from '@/types';  //importing types of user roles

//data validation schema
const SetLeaderSchema = z.object({ //validation template
  leaderId: z.string(), //leaderId type is string
});

//function to set or change club leader
export async function POST(req: Request) {
  const session = await getServerSession(authOptions); //user session with authentication check
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  //extracting clubId from the URL path
  const url = new URL(req.url); //url contains the parsed web address
  const segments = url.pathname.split('/');
  const clubIdIndex = segments.findIndex(seg => seg === 'set-leader') - 1; //clubid is in the position before set-leader in the path
  const clubId = segments[clubIdIndex]; //accessing clubId from the segments array using clubIdIndex
  if (!clubId) {
    return NextResponse.json({ error: 'Missing clubId' }, { status: 400 });
  }
  //body contains data from the request
  const body = await req.json(); //req.json convert incoming request body to JSON

  //parse contains the result of the validation(success:true and leader id or false and error)
  const parse = SetLeaderSchema.safeParse(body); //safeParse checks if the body matches the validation rules of SetLeaderSchema
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
  const { leaderId } = parse.data;

  //updating club leader of club
  const club = await db.club.update({
    where: { id: clubId },
    data: { leaderId },
  });

  //updating role of user to club leader
  await db.user.update({
    where: { id: leaderId },
    data: { role: 'CLUB_LEADER' as UserRole },
  });

  return NextResponse.json({ success: true, club });
}
