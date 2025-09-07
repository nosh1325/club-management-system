const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with basic data...');

  try {
    // Create admin user
    const hashedAdminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@bracu.ac.bd' },
      update: {
        password: hashedAdminPassword,
        name: 'System Administrator',
        role: 'ADMIN',
        department: 'Office of Co-Curricular Activities',
      },
      create: {
        name: 'System Administrator',
        email: 'admin@bracu.ac.bd',
        password: hashedAdminPassword,
        role: 'ADMIN',
        department: 'Office of Co-Curricular Activities',
      }
    });
    console.log('Admin user created:', admin.name);

    // Create club leader user
    const hashedLeaderPassword = await bcrypt.hash('leader123', 12);
    const clubLeader = await prisma.user.upsert({
      where: { email: 'leader@bracu.ac.bd' },
      update: {
        password: hashedLeaderPassword,
        name: 'Club Leader',
        role: 'CLUB_LEADER',
        studentId: '21101001',
        department: 'Computer Science',
        semester: 'Fall 2024',
        phone: '+880 1234 567890',
      },
      create: {
        name: 'Club Leader',
        email: 'leader@bracu.ac.bd',
        password: hashedLeaderPassword,
        role: 'CLUB_LEADER',
        studentId: '21101001',
        department: 'Computer Science',
        semester: 'Fall 2024',
        phone: '+880 1234 567890',
      }
    });
    console.log('Club leader user created:', clubLeader.name);

    // Create student user
    const hashedStudentPassword = await bcrypt.hash('student123', 12);
    const student = await prisma.user.upsert({
      where: { email: 'student@bracu.ac.bd' },
      update: {
        password: hashedStudentPassword,
        name: 'Demo Student',
        role: 'STUDENT',
        studentId: '21101002',
        department: 'Computer Science',
        semester: 'Fall 2024',
        phone: '+880 1234 567891',
      },
      create: {
        name: 'Demo Student',
        email: 'student@bracu.ac.bd',
        password: hashedStudentPassword,
        role: 'STUDENT',
        studentId: '21101002',
        department: 'Computer Science',
        semester: 'Fall 2024',
        phone: '+880 1234 567891',
      }
    });
    console.log('Student user created:', student.name);

    // Create clubs
    const clubs = [
      {
        name: 'BRAC University Computer Club (BUCC)',
        description: 'A community for tech enthusiasts to learn, innovate, and collaborate on computing projects.',
        category: 'Academic',
        department: 'CSE',
        status: 'ACTIVE',
        vision: 'To be a center of technological innovation.',
        mission: 'To foster a passion for computing.',
        activities: JSON.stringify(['Hackathons', 'Workshops', 'Tech Talks']),
        leaderId: clubLeader.id,
      },
      {
        name: 'BRAC University Cultural Club',
        description: 'Promotes and preserves the rich cultural heritage of Bangladesh through various events and performances.',
        category: 'Arts & Culture',
        department: 'All',
        status: 'ACTIVE',
        vision: 'To be the cultural heart of the university.',
        mission: 'To celebrate diversity through cultural expression.',
        activities: JSON.stringify(['Cultural Shows', 'Music Festivals', 'Dance Workshops']),
        leaderId: clubLeader.id,
      },
      {
        name: 'BRAC University Art and Photography Society',
        description: 'A hub for creative minds to express themselves through various art forms and photography.',
        category: 'Arts & Culture',
        department: 'All',
        status: 'ACTIVE',
        vision: 'To be a leading platform for artistic expression.',
        mission: 'To foster creativity and collaboration.',
        activities: JSON.stringify(['Workshops', 'Exhibitions', 'Photo-walks']),
      },
      {
        name: 'BRAC University Debating Club',
        description: 'A platform for students to hone their debating and public speaking skills.',
        category: 'Public Speaking',
        department: 'All',
        status: 'ACTIVE',
        vision: 'To develop world-class debaters.',
        mission: 'To promote critical thinking and articulate expression.',
        activities: JSON.stringify(['Debate Competitions', 'Workshops', 'Public Speaking Sessions']),
      }
    ];

    for (const club of clubs) {
      const createdClub = await prisma.club.upsert({
        where: { name: club.name },
        update: {},
        create: club,
      });
      console.log('Club created:', createdClub.name);
    }

    // Create a membership for the student in one of the clubs
    const bucc = await prisma.club.findFirst({
      where: { name: 'BRAC University Computer Club (BUCC)' }
    });

    if (bucc) {
      const membership = await prisma.membership.upsert({
        where: { 
          userId_clubId: {
            userId: student.id,
            clubId: bucc.id
          }
        },
        update: {},
        create: {
          userId: student.id,
          clubId: bucc.id,
          status: 'ACCEPTED',
          role: 'Member',
          joinedAt: new Date(),
        }
      });
      console.log('Membership created for', student.name, 'in', bucc.name);
    }

    console.log('🌱 Seeding completed successfully!');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
