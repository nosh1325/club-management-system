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
  await prisma.notification.deleteMany()
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
    }),
    prisma.user.upsert({
      where: { email: 'alex.johnson@g.bracu.ac.bd' },
      update: {},
      create: {
        name: 'Alex Johnson',
        email: 'alex.johnson@g.bracu.ac.bd',
        password: await bcrypt.hash('password123', 10),
        role: 'STUDENT',
        studentId: '21101006',
        department: 'Computer Science',
        semester: 'Fall 2024',
        phone: '+880 1234 567896',
      }
    }),
    prisma.user.upsert({
      where: { email: 'rita.islam@g.bracu.ac.bd' },
      update: {},
      create: {
        name: 'Rita Islam',
        email: 'rita.islam@g.bracu.ac.bd',
        password: await bcrypt.hash('password123', 10),
        role: 'STUDENT',
        studentId: '21101007',
        department: 'English',
        semester: 'Spring 2024',
        phone: '+880 1234 567897',
      }
    })
  ])

  // BRAC University Clubs - Non-Academic (Extra-Curricular)
  const nonAcademicClubs = [
    {
      name: 'Adventure Club (BUAC)',
      description: 'The club strives to discover and advertise the natural beauties of Bangladesh while promoting outdoor adventure activities.',
      department: 'Extra-Curricular',
      activities: ['Hiking', 'Mountain Climbing', 'Nature Photography', 'Adventure Tours', 'Camping'],
      email: 'buac@bracu.ac.bd'
    },
    {
      name: 'Art & Photography Society (BUAPS)',
      description: 'BRAC University Art and Photography Society (BUAPS) is dedicated to promoting artistic expression and photography skills.',
      department: 'Extra-Curricular',
      activities: ['Photography Workshops', 'Art Exhibitions', 'Photo Walks', 'Digital Art', 'Portrait Sessions'],
      email: 'buaps@bracu.ac.bd'
    },
    {
      name: 'Community Service Club (BUCSC)',
      description: 'BUCSC aims to use the capacities of those who are better off to serve the underprivileged communities.',
      department: 'Extra-Curricular',
      activities: ['Community Outreach', 'Charity Events', 'Volunteer Programs', 'Social Awareness', 'Fundraising'],
      email: 'bucsc@bracu.ac.bd'
    },
    {
      name: 'Cultural Club (BUCuC)',
      description: 'BRAC University Cultural Club (BUCuC) has been representing the traditional and contemporary cultural heritage of Bangladesh.',
      department: 'Extra-Curricular',
      activities: ['Cultural Programs', 'Traditional Dance', 'Music Performances', 'Cultural Festivals', 'Heritage Preservation'],
      email: 'bucuc@bracu.ac.bd'
    },
    {
      name: 'Debating Club (BUDC)',
      description: 'Debating Club (BUDC) focuses on developing critical thinking and public speaking skills through competitive debating.',
      department: 'Extra-Curricular',
      activities: ['Debate Tournaments', 'Public Speaking', 'Critical Thinking', 'Parliamentary Debates', 'Model UN'],
      email: 'budc@bracu.ac.bd'
    },
    {
      name: 'Drama and Theater Forum (BUDTF)',
      description: 'Drama and Theater Forum (BUDTF) promotes theatrical arts and dramatic performances among students.',
      department: 'Extra-Curricular',
      activities: ['Theater Productions', 'Drama Workshops', 'Script Writing', 'Acting Classes', 'Stage Management'],
      email: 'budtf@bracu.ac.bd'
    },
    {
      name: 'Entrepreneurship Forum (BUEDF)',
      description: 'Entrepreneurship Forum (BUEDF) encourages innovation and entrepreneurial thinking among students.',
      department: 'Extra-Curricular',
      activities: ['Startup Workshops', 'Business Plan Competitions', 'Entrepreneur Talks', 'Innovation Labs', 'Pitch Events'],
      email: 'buedf@bracu.ac.bd'
    },
    {
      name: 'Film Club (BUFC)',
      description: 'Film Club (BUFC) is dedicated to promoting filmmaking and cinema appreciation among students.',
      department: 'Extra-Curricular',
      activities: ['Film Screenings', 'Short Film Making', 'Documentary Projects', 'Film Festivals', 'Video Production'],
      email: 'bufc@bracu.ac.bd'
    },
    {
      name: 'Response Team (BURT)',
      description: 'Response Team (BURT) provides emergency response and disaster management training and services.',
      department: 'Extra-Curricular',
      activities: ['Emergency Response', 'First Aid Training', 'Disaster Management', 'Safety Workshops', 'Community Safety'],
      email: 'burt@bracu.ac.bd'
    },
    {
      name: 'Association of Business Communicators (IABC)',
      description: 'Association of Business Communicators (IABC) focuses on developing professional communication skills.',
      department: 'Extra-Curricular',
      activities: ['Communication Workshops', 'Professional Writing', 'Presentation Skills', 'Corporate Communication', 'Networking'],
      email: 'iabc@bracu.ac.bd'
    },
    {
      name: 'MONON Club',
      description: 'MONON Club promotes mental health awareness and psychological well-being among students.',
      department: 'Extra-Curricular',
      activities: ['Mental Health Awareness', 'Counseling Sessions', 'Stress Management', 'Mindfulness Workshops', 'Peer Support'],
      email: 'monon@bracu.ac.bd'
    },
    {
      name: 'Leadership Development Forum (BULDF)',
      description: 'Leadership Development Forum (BULDF) focuses on developing leadership skills and qualities among students.',
      department: 'Extra-Curricular',
      activities: ['Leadership Training', 'Team Building', 'Management Skills', 'Public Speaking', 'Personal Development'],
      email: 'buldf@bracu.ac.bd'
    },
    {
      name: 'Chess Club (BUCHC)',
      description: 'Chess Club (BUCHC) promotes strategic thinking and chess playing among students.',
      department: 'Extra-Curricular',
      activities: ['Chess Tournaments', 'Strategy Sessions', 'Chess Training', 'Online Competitions', 'Mind Games'],
      email: 'buchc@bracu.ac.bd'
    },
    {
      name: 'Communication & Language Club (BUCLC)',
      description: 'Communication & Language Club (BUCLC) focuses on improving language skills and communication abilities.',
      department: 'Extra-Curricular',
      activities: ['Language Workshops', 'Public Speaking', 'Writing Skills', 'Grammar Sessions', 'Pronunciation Training'],
      email: 'buclc@bracu.ac.bd'
    },
    {
      name: 'BRAC University Research for Development Club (BURed)',
      description: 'BRAC University Research for Development Club (BURed) promotes research culture and development-oriented studies.',
      department: 'Extra-Curricular',
      activities: ['Research Projects', 'Academic Conferences', 'Development Studies', 'Data Analysis', 'Policy Research'],
      email: 'bured@bracu.ac.bd'
    },
    {
      name: 'Peace Café BRAC University (PCBU)',
      description: 'Peace Café BRAC University (PCBU) promotes peace, tolerance, and conflict resolution.',
      department: 'Extra-Curricular',
      activities: ['Peace Dialogues', 'Conflict Resolution', 'Community Harmony', 'Cultural Exchange', 'Social Justice'],
      email: 'pcbu@bracu.ac.bd'
    },
    {
      name: 'Multicultural Club (BUMC)',
      description: 'Multicultural Club (BUMC) celebrates diversity and promotes intercultural understanding.',
      department: 'Extra-Curricular',
      activities: ['Cultural Exchange', 'International Events', 'Language Exchange', 'Global Awareness', 'Diversity Celebration'],
      email: 'bumc@bracu.ac.bd'
    }
  ]

  // Academic Clubs (Co-Curricular)
  const academicClubs = [
    {
      name: 'Business & Economics Forum (BUBeF)',
      description: 'Business & Economics Forum (BUBeF) focuses on business and economic research and practical applications.',
      department: 'Academic',
      activities: ['Business Research', 'Economic Analysis', 'Market Studies', 'Industry Visits', 'Corporate Partnerships'],
      email: 'bubef@bracu.ac.bd'
    },
    {
      name: 'Business Club (BIZBEE)',
      description: 'Business Club (BIZBEE) provides practical business experience and networking opportunities.',
      department: 'Academic',
      activities: ['Business Competitions', 'Case Studies', 'Networking Events', 'Industry Talks', 'Entrepreneurship'],
      email: 'bizbee@bracu.ac.bd'
    },
    {
      name: 'Finance and Accounting Club (BUFIN)',
      description: 'Finance and Accounting Club (BUFIN) focuses on financial literacy and accounting practices.',
      department: 'Academic',
      activities: ['Financial Analysis', 'Investment Workshops', 'Accounting Training', 'Tax Seminars', 'Banking Visits'],
      email: 'bufin@bracu.ac.bd'
    },
    {
      name: 'Computer Club (BUCC)',
      description: 'Computer Club (BUCC) promotes programming, software development, and technology innovation.',
      department: 'Academic',
      activities: ['Programming Contests', 'Software Development', 'Tech Workshops', 'Hackathons', 'AI/ML Projects'],
      email: 'bucc@bracu.ac.bd'
    },
    {
      name: 'Economics Club (BUEC)',
      description: 'Economics Club (BUEC) focuses on economic theory and its practical applications.',
      department: 'Academic',
      activities: ['Economic Research', 'Policy Analysis', 'Economic Debates', 'Data Analysis', 'Market Research'],
      email: 'buec@bracu.ac.bd'
    },
    {
      name: 'Electrical & Electronic Club (BUEEC)',
      description: 'Electrical & Electronic Club (BUEEC) promotes innovation in electrical and electronic engineering.',
      department: 'Academic',
      activities: ['Circuit Design', 'Electronics Projects', 'IoT Development', 'Power Systems', 'Automation'],
      email: 'bueec@bracu.ac.bd'
    },
    {
      name: 'Law Society (BULC)',
      description: 'Law Society (BULC) focuses on legal education and advocacy skills development.',
      department: 'Academic',
      activities: ['Moot Court', 'Legal Research', 'Law Debates', 'Legal Aid', 'Court Visits'],
      email: 'bulc@bracu.ac.bd'
    },
    {
      name: 'Marketing Association (BUMA)',
      description: 'Marketing Association (BUMA) focuses on marketing strategies and consumer behavior studies.',
      department: 'Academic',
      activities: ['Marketing Campaigns', 'Brand Management', 'Digital Marketing', 'Consumer Research', 'Advertising'],
      email: 'buma@bracu.ac.bd'
    },
    {
      name: 'Natural Science Club (BUNSC)',
      description: 'Natural Science Club (BUNSC) promotes scientific research and discovery in natural sciences.',
      department: 'Academic',
      activities: ['Scientific Research', 'Lab Experiments', 'Field Studies', 'Science Fairs', 'Environmental Studies'],
      email: 'bunsc@bracu.ac.bd'
    },
    {
      name: 'Pharmacy Society (BUPS)',
      description: 'Pharmacy Society (BUPS) focuses on pharmaceutical sciences and healthcare.',
      department: 'Academic',
      activities: ['Drug Research', 'Healthcare Awareness', 'Pharmaceutical Studies', 'Medical Camps', 'Health Education'],
      email: 'bups@bracu.ac.bd'
    },
    {
      name: 'Robotics Club (ROBU)',
      description: 'Robotics Club (ROBU) promotes robotics and automation technology among students.',
      department: 'Academic',
      activities: ['Robot Building', 'Automation Projects', 'AI Integration', 'Robotics Competitions', 'Tech Innovation'],
      email: 'robu@bracu.ac.bd'
    }
  ]

  // Sports Clubs
  const sportsClubs = [
    {
      name: 'Cricket Club (CBU)',
      description: 'Cricket Club (CBU) promotes cricket and develops cricket skills among students.',
      department: 'Sports',
      activities: ['Cricket Matches', 'Training Sessions', 'Inter-University Tournaments', 'Cricket Coaching', 'Sports Events'],
      email: 'cbu@bracu.ac.bd'
    },
    {
      name: 'Football Club (FCBU)',
      description: 'Football Club (FCBU) promotes football and develops football skills among students.',
      department: 'Sports',
      activities: ['Football Matches', 'Training Sessions', 'Inter-University Tournaments', 'Football Coaching', 'Sports Events'],
      email: 'fcbu@bracu.ac.bd'
    },
    {
      name: 'Indoor Games Club (BUIGC)',
      description: 'Indoor Games Club (BUIGC) promotes various indoor games and sports among students.',
      department: 'Sports',
      activities: ['Table Tennis', 'Badminton', 'Carrom', 'Chess', 'Indoor Tournaments'],
      email: 'buigc@bracu.ac.bd'
    }
  ]

  // Create all clubs
  const allClubs = [...nonAcademicClubs, ...academicClubs, ...sportsClubs]
  const createdClubs = []

  for (const clubData of allClubs) {
    const club = await prisma.club.create({
      data: {
        name: clubData.name,
        description: clubData.description,
        email: clubData.email,
        department: clubData.department,
        status: 'ACTIVE',
        foundedYear: Math.floor(Math.random() * 10) + 2015, // Random year between 2015-2024
        vision: `To be the leading ${clubData.department.toLowerCase()} club at BRAC University.`,
        mission: `To provide excellent opportunities for students to develop skills in ${clubData.department.toLowerCase()}.`,
        activities: JSON.stringify(clubData.activities),
        leaderId: clubLeader.id,
      }
    })
    createdClubs.push(club)
  }

  // Create sample memberships
  await prisma.membership.create({
    data: {
      userId: student.id,
      clubId: createdClubs[0].id, // Adventure Club
      role: 'MEMBER',
      status: 'ACCEPTED',
      joinedAt: new Date('2024-06-01'),
    }
  })

  await prisma.membership.create({
    data: {
      userId: student.id,
      clubId: createdClubs[3].id, // Computer Club
      role: 'MEMBER',
      status: 'ACCEPTED',
      joinedAt: new Date('2024-07-15'),
    }
  })

  // Create pending membership applications for demo
  const pendingMemberships = [
    {
      userId: students[0].id, // Sarah Ahmed
      clubId: createdClubs.find(c => c.name.includes('Computer'))?.id || createdClubs[0].id,
      role: 'MEMBER' as const,
      status: 'PENDING' as const,
    },
    {
      userId: students[1].id, // Md. Rahman
      clubId: createdClubs.find(c => c.name.includes('Robotics'))?.id || createdClubs[1].id,
      role: 'MEMBER' as const,
      status: 'PENDING' as const,
    },
    {
      userId: students[2].id, // Fatima Khan
      clubId: createdClubs.find(c => c.name.includes('Business'))?.id || createdClubs[2].id,
      role: 'MEMBER' as const,
      status: 'PENDING' as const,
    },
    {
      userId: students[3].id, // Alex Johnson
      clubId: createdClubs.find(c => c.name.includes('Debating'))?.id || createdClubs[3].id,
      role: 'MEMBER' as const,
      status: 'PENDING' as const,
    },
    {
      userId: students[4].id, // Rita Islam
      clubId: createdClubs.find(c => c.name.includes('Cultural'))?.id || createdClubs[4].id,
      role: 'MEMBER' as const,
      status: 'PENDING' as const,
    },
    {
      userId: students[0].id, // Sarah Ahmed (applying to another club)
      clubId: createdClubs.find(c => c.name.includes('Art'))?.id || createdClubs[5].id,
      role: 'MEMBER' as const,
      status: 'PENDING' as const,
    }
  ]

  for (const membershipData of pendingMemberships) {
    await prisma.membership.create({ data: membershipData })
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
      status: 'APPROVED' as const,
      requirements: 'Basic programming knowledge in any language',
      clubId: createdClubs.find(c => c.name.includes('Computer'))?.id || createdClubs[0].id,
    },
    {
      title: 'Adventure Hiking Trip to Srimangal',
      description: 'Experience the beautiful tea gardens and natural trails of Srimangal with fellow adventure enthusiasts.',
      date: new Date('2025-02-05T06:00:00'),
      venue: 'Srimangal, Sylhet',
      startDate: new Date('2025-02-05T06:00:00'),
      endDate: new Date('2025-02-07T18:00:00'),
      capacity: 30,
      isPublic: true,
      status: 'APPROVED' as const,
      requirements: 'Good physical fitness and hiking experience preferred',
      clubId: createdClubs.find(c => c.name.includes('Adventure'))?.id || createdClubs[0].id,
    },
    {
      title: 'Business Case Competition 2024',
      description: 'Analyze real-world business scenarios and present your solutions to industry experts.',
      date: new Date('2025-01-25T10:00:00'),
      venue: 'Business School - Conference Room',
      startDate: new Date('2025-01-25T10:00:00'),
      endDate: new Date('2025-01-25T16:00:00'),
      capacity: 80,
      isPublic: true,
      status: 'APPROVED' as const,
      requirements: 'Teams of 3-4 members required',
      clubId: createdClubs.find(c => c.name.includes('Business Club'))?.id || createdClubs[0].id,
    },
    {
      title: 'Inter-University Debate Championship',
      description: 'Compete against top debaters from universities across Bangladesh in this prestigious tournament.',
      date: new Date('2025-02-15T10:00:00'),
      venue: 'Main Auditorium',
      startDate: new Date('2025-02-15T10:00:00'),
      endDate: new Date('2025-02-15T18:00:00'),
      capacity: 200,
      isPublic: true,
      status: 'APPROVED' as const,
      requirements: 'Previous debate experience preferred',
      clubId: createdClubs.find(c => c.name.includes('Debating'))?.id || createdClubs[0].id,
    },
    {
      title: 'Robotics Workshop: Building Your First Robot',
      description: 'Hands-on workshop for beginners to build and program their first robot using Arduino.',
      date: new Date('2025-01-30T14:00:00'),
      venue: 'Engineering Lab - Room 201',
      startDate: new Date('2025-01-30T14:00:00'),
      endDate: new Date('2025-01-30T18:00:00'),
      capacity: 25,
      isPublic: true,
      status: 'APPROVED' as const,
      requirements: 'No prior experience required. All materials will be provided.',
      clubId: createdClubs.find(c => c.name.includes('Robotics'))?.id || createdClubs[0].id,
    }
  ]

  for (const eventData of events) {
    await prisma.event.create({ data: eventData })
  }

  // Create a sample budget request
  await prisma.budgetRequest.create({
    data: {
      title: 'Programming Contest Prize Fund',
      description: 'Budget request for prizes and refreshments for the annual programming contest.',
      amount: 25000,
      purpose: 'Contest Prizes and Event Management',
      status: 'PENDING' as const,
      clubId: createdClubs.find(c => c.name.includes('Computer'))?.id || createdClubs[0].id,
      requestedBy: clubLeader.id,
      requestedAt: new Date(),
    }
  })

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
