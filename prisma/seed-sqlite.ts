import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with BRAC University Clubs...')

  // Clear existing data
  await prisma.eventRsvp.deleteMany()
  await prisma.event.deleteMany()
  await prisma.budgetRequest.deleteMany()
  await prisma.membership.deleteMany()
  await prisma.club.deleteMany()
  await prisma.user.deleteMany()

  // Create demo users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@bracu.ac.bd' },
    update: {},
    create: {
      name: 'OCA Admin',
      email: 'admin@bracu.ac.bd',
      password: await bcrypt.hash('admin123', 10),
      role: 'ADMIN',
      studentId: null,
      department: 'Office of Co-Curricular Activities',
      semester: null,
      phone: '+880 2 9664644',
    }
  })

  const clubLeader = await prisma.user.upsert({
    where: { email: 'leader@bracu.ac.bd' },
    update: {},
    create: {
      name: 'John Doe',
      email: 'leader@bracu.ac.bd',
      password: await bcrypt.hash('leader123', 10),
      role: 'CLUB_LEADER',
      studentId: '21101001',
      department: 'Computer Science',
      semester: 'Fall 2024',
      phone: '+880 1234 567891',
    }
  })

  const student = await prisma.user.upsert({
    where: { email: 'student@bracu.ac.bd' },
    update: {},
    create: {
      name: 'Jane Smith',
      email: 'student@bracu.ac.bd',
      password: await bcrypt.hash('student123', 10),
      role: 'STUDENT',
      studentId: '21101002',
      department: 'Computer Science',
      semester: 'Fall 2024',
      phone: '+880 1234 567892',
    }
  })

  // Create additional demo students for membership applications
  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: 'sarah.ahmed@g.bracu.ac.bd' },
      update: {},
      create: {
        name: 'Sarah Ahmed',
        email: 'sarah.ahmed@g.bracu.ac.bd',
        password: await bcrypt.hash('password123', 10),
        role: 'STUDENT',
        studentId: '21101003',
        department: 'Computer Science',
        semester: 'Spring 2024',
        phone: '+880 1234 567893',
      }
    }),
    prisma.user.upsert({
      where: { email: 'md.rahman@g.bracu.ac.bd' },
      update: {},
      create: {
        name: 'Md. Rahman',
        email: 'md.rahman@g.bracu.ac.bd',
        password: await bcrypt.hash('password123', 10),
        role: 'STUDENT',
        studentId: '21101004',
        department: 'Electrical Engineering',
        semester: 'Fall 2024',
        phone: '+880 1234 567894',
      }
    }),
    prisma.user.upsert({
      where: { email: 'fatima.khan@g.bracu.ac.bd' },
      update: {},
      create: {
        name: 'Fatima Khan',
        email: 'fatima.khan@g.bracu.ac.bd',
        password: await bcrypt.hash('password123', 10),
        role: 'STUDENT',
        studentId: '21101005',
        department: 'Business Administration',
        semester: 'Spring 2024',
        phone: '+880 1234 567895',
      }
    })
  ])

  // Create a sample of clubs
  const clubs = [
    {
      name: 'BRAC University Computer Club (BUCC)',
      description: 'A community for tech enthusiasts to learn, innovate, and collaborate on computing projects.',
      category: 'Academic',
      department: 'CSE',
      status: 'ACTIVE',
      logoUrl: 'https://example.com/logo-bucc.png',
      website: 'https://bucc.bracu.ac.bd',
      email: 'bucc@bracu.ac.bd',
      phone: '+880 1234 567890',
      advisor: 'Dr. Jane Doe',
      foundedYear: 2010,
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
      logoUrl: 'https://example.com/logo-cultural.png',
      website: 'https://cultural.bracu.ac.bd',
      email: 'cultural@bracu.ac.bd',
      phone: '+880 1234 567891',
      advisor: 'Dr. Rahim Ahmed',
      foundedYear: 2008,
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
      logoUrl: 'https://example.com/logo-photo.png',
      website: 'https://arts.bracu.ac.bd',
      email: 'arts@bracu.ac.bd',
      phone: '+880 1234 567892',
      advisor: 'Prof. Sarah Johnson',
      foundedYear: 2012,
      vision: 'To be a leading platform for artistic expression.',
      mission: 'To foster creativity and collaboration.',
      activities: JSON.stringify(['Photo Walks', 'Exhibitions', 'Art Competitions']),
      leaderId: clubLeader.id,
    },
    {
      name: 'BRAC University Debating Club',
      description: 'A platform for students to hone their debating and public speaking skills.',
      category: 'Public Speaking',
      department: 'All',
      status: 'ACTIVE',
      logoUrl: 'https://example.com/logo-debate.png',
      website: 'https://debate.bracu.ac.bd',
      email: 'debate@bracu.ac.bd',
      phone: '+880 1234 567893',
      advisor: 'Dr. Mohammad Khan',
      foundedYear: 2009,
      vision: 'To develop world-class debaters.',
      mission: 'To promote critical thinking and articulate expression.',
      activities: JSON.stringify(['Debate Tournaments', 'Public Speaking Workshops', 'Model UN']),
      leaderId: clubLeader.id,
    },
    {
      name: 'BRAC University Robotics Club',
      description: 'Focused on robotics innovation and technology development.',
      category: 'Technology',
      department: 'Engineering',
      status: 'ACTIVE',
      logoUrl: 'https://example.com/logo-robotics.png',
      website: 'https://robotics.bracu.ac.bd',
      email: 'robotics@bracu.ac.bd',
      phone: '+880 1234 567894',
      advisor: 'Dr. Robert Chen',
      foundedYear: 2013,
      vision: 'To be pioneers in robotics innovation.',
      mission: 'To develop cutting-edge robotic solutions.',
      activities: JSON.stringify(['Robot Building', 'Competitions', 'Research Projects']),
      leaderId: clubLeader.id,
    }
  ]

  const createdClubs = []
  for (const clubData of clubs) {
    const club = await prisma.club.create({
      data: clubData
    })
    createdClubs.push(club)
    console.log(`Club created: ${club.name}`)
  }

  // Create sample memberships
  await prisma.membership.create({
    data: {
      userId: student.id,
      clubId: createdClubs[0].id, // Computer Club
      role: 'Member',
      status: 'ACCEPTED',
      joinedAt: new Date('2024-06-01'),
    }
  })
  console.log(`Membership created: ${student.name} in ${createdClubs[0].name}`)

  await prisma.membership.create({
    data: {
      userId: student.id,
      clubId: createdClubs[1].id, // Cultural Club
      role: 'Member',
      status: 'ACCEPTED',
      joinedAt: new Date('2024-07-15'),
    }
  })
  console.log(`Membership created: ${student.name} in ${createdClubs[1].name}`)

  // Create pending membership applications for demo
  const pendingMemberships = [
    {
      userId: students[0].id, // Sarah Ahmed
      clubId: createdClubs[0].id, // Computer Club
      role: 'Member',
      status: 'PENDING',
    },
    {
      userId: students[1].id, // Md. Rahman
      clubId: createdClubs[4].id, // Robotics Club
      role: 'Member',
      status: 'PENDING',
    },
    {
      userId: students[2].id, // Fatima Khan
      clubId: createdClubs[3].id, // Debating Club
      role: 'Member',
      status: 'PENDING',
    }
  ]

  for (const membershipData of pendingMemberships) {
    await prisma.membership.create({ data: membershipData })
    console.log(`Pending membership created: ${membershipData.userId} in club ${membershipData.clubId}`)
  }

  // Create sample events
  const events = [
    {
      title: 'Annual Programming Contest 2024',
      description: 'Join us for the biggest programming contest of the year! Test your skills against the best programmers in the university.',
      date: new Date('2025-01-20T09:00:00'),
      venue: 'UB40101 - Computer Lab',
      startDate: new Date('2025-01-20T09:00:00'),
      endDate: new Date('2025-01-20T17:00:00'),
      capacity: 100,
      isPublic: true,
      status: 'APPROVED',
      requirements: 'Basic programming knowledge in any language',
      clubId: createdClubs[0].id, // Computer Club
    },
    {
      title: 'Cultural Night 2024',
      description: 'A night of music, dance, and cultural performances celebrating our heritage.',
      date: new Date('2025-02-05T18:00:00'),
      venue: 'Main Auditorium',
      startDate: new Date('2025-02-05T18:00:00'),
      endDate: new Date('2025-02-05T22:00:00'),
      capacity: 500,
      isPublic: true,
      status: 'APPROVED',
      requirements: 'No specific requirements',
      clubId: createdClubs[1].id, // Cultural Club
    }
  ]

  for (const eventData of events) {
    await prisma.event.create({ data: eventData })
    console.log(`Event created: ${eventData.title}`)
  }

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Created ${createdClubs.length} clubs`)
  console.log(`🎯 Created ${events.length} events`)
  console.log(`👥 Created ${pendingMemberships.length} pending membership applications`)
  console.log('Demo credentials:')
  console.log('Admin: admin@bracu.ac.bd / admin123')
  console.log('Club Leader: leader@bracu.ac.bd / leader123')
  console.log('Student: student@bracu.ac.bd / student123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
