import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// A list of official BRAC University clubs with all required fields
const bracuClubs = [
    { name: "BRAC University Art and Photography Society", category: 'Arts & Culture', department: 'All', description: 'A hub for creative minds to express themselves through various art forms and photography.', vision: 'To be a leading platform for artistic expression.', mission: 'To foster creativity and collaboration.', activities: 'Workshops, Exhibitions, Photo-walks', status: 'ACTIVE' },
    { name: "BRAC University Film Club", category: 'Arts & Culture', department: 'All', description: 'Dedicated to the appreciation and creation of films, hosting screenings, workshops, and competitions.', vision: 'To cultivate a vibrant film culture.', mission: 'To educate and inspire filmmakers.', activities: 'Screenings, Workshops, Film Festivals', status: 'ACTIVE' },
    { name: "BRAC University Cultural Club", category: 'Arts & Culture', department: 'All', description: 'Promotes and preserves the rich cultural heritage of Bangladesh through various events and performances.', vision: 'To be the cultural heart of the university.', mission: 'To celebrate diversity through cultural expression.', activities: 'Cultural Shows, Music Festivals, Dance Workshops', status: 'ACTIVE' },
    { name: "BRAC University Debating Club", category: 'Public Speaking', department: 'All', description: 'A platform for students to hone their debating and public speaking skills.', vision: 'To develop world-class debaters.', mission: 'To promote critical thinking and articulate expression.', activities: 'Debate Competitions, Workshops, Public Speaking Sessions', status: 'ACTIVE' },
    { name: "BRAC University Business and Economics Forum", category: 'Academic', department: 'BBS', description: 'Fosters discussion and learning in business, economics, and entrepreneurship.', vision: 'To bridge the gap between academia and industry.', mission: 'To empower future business leaders.', activities: 'Seminars, Case Competitions, Industry Talks', status: 'ACTIVE' },
    { name: "AIESEC in BRAC University", category: 'Leadership', department: 'All', description: 'A global platform for young people to explore and develop their leadership potential.', vision: 'To achieve peace and fulfillment of humankind\'s potential.', mission: 'To provide leadership development opportunities.', activities: 'Internships, Volunteering, Leadership Conferences', status: 'ACTIVE' },
    { name: "BRAC University Computer Club (BUCC)", category: 'Academic', department: 'CSE', description: 'A community for tech enthusiasts to learn, innovate, and collaborate on computing projects.', vision: 'To be a center of technological innovation.', mission: 'To foster a passion for computing.', activities: 'Hackathons, Workshops, Tech Talks', status: 'ACTIVE' },
    { name: "BRAC University Pharma Society", category: 'Academic', department: 'Pharmacy', description: 'Engages students in pharmaceutical sciences through seminars, workshops, and industry visits.', vision: 'To advance pharmaceutical knowledge.', mission: 'To connect students with the pharma industry.', activities: 'Seminars, Pharmacy Fairs, Industry Visits', status: 'ACTIVE' },
    { name: "BRAC University Law Society", category: 'Academic', department: 'Law', description: 'Promotes legal education and awareness through moot courts, seminars, and legal aid clinics.', vision: 'To uphold the principles of justice and law.', mission: 'To provide practical legal training.', activities: 'Moot Courts, Seminars, Legal Aid', status: 'ACTIVE' },
    { name: "IEEE BRAC University Student Branch", category: 'Academic', department: 'EEE', description: 'A branch of the global IEEE organization, focusing on advancing technology for humanity.', vision: 'To be a leading student branch of IEEE.', mission: 'To promote technical knowledge and professional development.', activities: 'Tech Fests, Workshops, Seminars', status: 'ACTIVE' },
    { name: "BRAC University Entrepreneurship Development Forum", category: 'Business', department: 'BBS', description: 'Inspires and supports student entrepreneurs through mentorship, workshops, and networking events.', vision: 'To create a thriving entrepreneurial ecosystem.', mission: 'To nurture the next generation of entrepreneurs.', activities: 'Business Plan Competitions, Startup Talks, Mentorship Programs', status: 'ACTIVE' },
    { name: "BRAC University Global Affairs Forum", category: 'Social & Global', department: 'All', description: 'A forum for discussing international relations, diplomacy, and global issues.', vision: 'To foster global citizenship.', mission: 'To promote understanding of international affairs.', activities: 'Model UN, Policy Debates, Ambassador Talks', status: 'ACTIVE' },
    { name: "BRAC University Adventure Club", category: 'Sports & Recreation', department: 'All', description: 'Organizes adventurous and recreational activities like hiking, trekking, and cycling.', vision: 'To promote a spirit of adventure.', mission: 'To explore the great outdoors.', activities: 'Hiking, Camping, Cycling Tours', status: 'ACTIVE' },
    { name: "BRAC University Indoor Games Club", category: 'Sports & Recreation', department: 'All', description: 'Promotes indoor sports and games, organizing tournaments and practice sessions.', vision: 'To be the hub for indoor sports enthusiasts.', mission: 'To encourage sportsmanship and healthy competition.', activities: 'Chess Tournaments, Table Tennis, Carrom', status: 'ACTIVE' },
];

export async function GET() {
  try {
    console.log("Starting database seeding process...");

    const firstUser = await db.user.findFirst();
    if (!firstUser) {
      return NextResponse.json(
        { error: "Cannot seed clubs. No users found in the database to assign as a leader. Please create a user first." },
        { status: 400 }
      );
    }
    console.log(`Found user ${firstUser.email} to assign as a default club leader.`);

    const clubsToCreate = bracuClubs.map(club => ({
      ...club,
      leaderId: firstUser.id,
    }));

    await db.club.deleteMany({});
    console.log("Cleared existing clubs from the database.");

    await db.club.createMany({
      data: clubsToCreate.map(club => ({
        ...club,
        status: club.status as any
      })),
    });

    const finalClubCount = await db.club.count();
    console.log(`Seeding complete. Total clubs in database: ${finalClubCount}`);

    return NextResponse.json({
      message: "Database seeded successfully!",
      clubCount: finalClubCount,
    });

  } catch (error) {
    console.error("Error during database seeding:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: "Failed to seed database.", details: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred during seeding." }, { status: 500 });
  }
}
