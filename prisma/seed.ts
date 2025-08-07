import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bracu.ac.bd' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@bracu.ac.bd',
      password: hashedAdminPassword,
      role: 'ADMIN',
      department: 'Office of Co-Curricular Activities',
    }
  })

  // Create club leader user
  const hashedLeaderPassword = await bcrypt.hash('leader123', 12)
  const clubLeader = await prisma.user.upsert({
    where: { email: 'leader@bracu.ac.bd' },
    update: {},
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
  })

  // Create student user
  const hashedStudentPassword = await bcrypt.hash('student123', 12)
  const student = await prisma.user.upsert({
    where: { email: 'student@bracu.ac.bd' },
    update: {},
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
  })

  // Create sample clubs
  const programmingClub = await prisma.club.upsert({
    where: { name: 'BRAC University Programming Club' },
    update: {},
    create: {
      name: 'BRAC University Programming Club',
      description: 'A community of passionate programmers and developers learning and building together.',
      email: 'programming@club.bracu.ac.bd',
      website: 'https://programmingclub.bracu.ac.bd',
      phone: '+880 1234 567892',
      department: 'Computer Science',
      status: 'ACTIVE',
      foundedYear: 2020,
      vision: 'To be the leading programming community in Bangladesh.',
      mission: 'To foster programming skills and innovation among students.',
      activities: JSON.stringify(['Workshops', 'Coding Contests', 'Hackathons', 'Tech Talks']),
      leaderId: clubLeader.id,
    }
  })

  const roboticsClub = await prisma.club.upsert({
    where: { name: 'BRAC University Robotics Club' },
    update: {},
    create: {
      name: 'BRAC University Robotics Club',
      description: 'Exploring the world of robotics and automation through hands-on projects.',
      email: 'robotics@club.bracu.ac.bd',
      department: 'Electrical Engineering',
      status: 'ACTIVE',
      foundedYear: 2019,
      vision: 'To advance robotics education and research.',
      mission: 'To provide hands-on robotics experience to students.',
      activities: JSON.stringify(['Robot Building', 'Competitions', 'Research Projects']),
      leaderId: clubLeader.id,
    }
  })

  // Create sample membership
  await prisma.membership.upsert({
    where: { 
      userId_clubId: {
        userId: student.id,
        clubId: programmingClub.id
      }
    },
    update: {},
    create: {
      userId: student.id,
      clubId: programmingClub.id,
      status: 'ACCEPTED',
      role: 'Member',
      joinedAt: new Date(),
    }
  })

  // Create sample events
  const codingWorkshop = await prisma.event.create({
    data: {
      title: 'Introduction to React.js Workshop',
      description: 'Learn the fundamentals of React.js and build your first component.',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      venue: 'Room 501, Computer Lab',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
      capacity: 30,
      isPublic: true,
      status: 'APPROVED',
      requirements: 'Basic JavaScript knowledge required',
      clubId: programmingClub.id,
    }
  })

  // Create sample RSVP
  await prisma.eventRsvp.create({
    data: {
      userId: student.id,
      eventId: codingWorkshop.id,
      status: 'ATTENDING',
    }
  })

  // Create sample budget request
  await prisma.budgetRequest.create({
    data: {
      title: 'Programming Contest Prize Money',
      description: 'Budget for prizes for the upcoming programming contest.',
      amount: 10000,
      purpose: 'Event Prizes',
      status: 'PENDING',
      clubId: programmingClub.id,
      requestedBy: clubLeader.id,
    }
  })

  console.log('✅ Database seeded successfully!')
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
