import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with Official BRAC University Clubs (with logos)...')

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
      studentId: '21301234',
      department: 'Computer Science',
      semester: 'Spring 2024',
      phone: '+880 1234 567890',
    }
  })

  // Official BRAC University Clubs with logos from the official website
  const officialClubs = [
    // NON-ACADEMIC CLUBS (Extra-Curricular)
    {
      name: 'Adventure Club (BUAC)',
      description: 'The club strives to discover and advertise the natural beauties of Bangladesh and organize adventurous trips for students.',
      category: 'ACADEMIC',
      department: 'Extra-Curricular',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/styles/4_3_medium/public/widgets/cards/2024/12/15/Adventure.jpg?itok=q6nUDK2v',
      website: 'https://www.bracu.ac.bd/student-life/adventure-club',
      email: 'buac@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Dr. Adventure Faculty',
      foundedYear: 2010,
      vision: 'To explore and promote the natural heritage of Bangladesh',
      mission: 'Organizing adventure trips and promoting outdoor activities',
      activities: JSON.stringify(['Hiking', 'Camping', 'Rock Climbing', 'Outdoor Photography']),
      leaderId: clubLeader.id
    },
    {
      name: 'Art & Photography Society (BUAPS)',
      description: 'BRAC University Art and Photography Society (BUAPS) is dedicated to nurturing artistic talents and promoting visual arts among students.',
      category: 'CULTURAL',
      department: 'Extra-Curricular',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/styles/4_3_medium/public/widgets/cards/2024/12/15/art.jpg?itok=ktfTSVRs',
      website: 'https://www.bracu.ac.bd/student-life/art-photography-society',
      email: 'buaps@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Prof. Art Mentor',
      foundedYear: 2005,
      vision: 'To foster creativity and artistic expression',
      mission: 'Promoting art and photography culture in university',
      activities: JSON.stringify(['Photography Workshops', 'Art Exhibitions', 'Digital Art', 'Portrait Sessions']),
      leaderId: clubLeader.id
    },
    {
      name: 'Community Service Club (BUCSC)',
      description: 'BUCSC aims to use the capacities of those who are better off to help the disadvantaged and work for community development.',
      category: 'SERVICE',
      department: 'Extra-Curricular',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/styles/4_3_medium/public/widgets/cards/2024/12/15/community.jpg?itok=R39WNtXQ',
      website: 'https://www.bracu.ac.bd/student-life/community-service-club',
      email: 'bucsc@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Dr. Community Leader',
      foundedYear: 2008,
      vision: 'Building a better society through community service',
      mission: 'Engaging students in meaningful community development activities',
      activities: JSON.stringify(['Blood Donation', 'Educational Support', 'Health Awareness', 'Environmental Projects']),
      leaderId: clubLeader.id
    },
    {
      name: 'Cultural Club (BUCuC)',
      description: 'BRAC University Cultural Club (BUCuC) has been representing the traditional and contemporary cultural activities of Bangladesh.',
      category: 'CULTURAL',
      department: 'Extra-Curricular',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/styles/4_3_medium/public/widgets/cards/2024/12/15/cultural.jpg?itok=ydJEc4zl',
      website: 'https://www.bracu.ac.bd/student-life/cultural-club',
      email: 'bucuc@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Prof. Cultural Arts',
      foundedYear: 2003,
      vision: 'Preserving and promoting Bangladeshi culture',
      mission: 'Organizing cultural events and promoting traditional arts',
      activities: JSON.stringify(['Traditional Dance', 'Music Concerts', 'Drama Performance', 'Poetry Recitation']),
      leaderId: clubLeader.id
    },
    {
      name: 'Debating Club (BUDC)',
      description: 'Debating Club (BUDC) aims to develop public speaking skills and critical thinking among students through competitive debates.',
      category: 'ACADEMIC',
      department: 'Extra-Curricular',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/styles/4_3_medium/public/widgets/cards/2024/12/15/debating.jpg?itok=LC-hCtaX',
      website: 'https://www.bracu.ac.bd/student-life/debating-club',
      email: 'budc@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Dr. Speech Expert',
      foundedYear: 2004,
      vision: 'Excellence in public speaking and debate',
      mission: 'Developing critical thinking and communication skills',
      activities: JSON.stringify(['Parliamentary Debates', 'Public Speaking', 'Model UN', 'Speech Contests']),
      leaderId: clubLeader.id
    },
    {
      name: 'Drama and Theater Forum (BUDTF)',
      description: 'Drama and Theater Forum (BUDTF) promotes theatrical arts and dramatic performances among university students.',
      category: 'CULTURAL',
      department: 'Extra-Curricular',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/styles/4_3_medium/public/uploads/2025/01/09/Certificate_Course.jpeg?itok=if-VDa_N',
      website: 'https://www.bracu.ac.bd/student-life/drama-theater-forum',
      email: 'budtf@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Prof. Theater Arts',
      foundedYear: 2006,
      vision: 'Promoting theatrical excellence and creativity',
      mission: 'Developing dramatic arts and stage performance skills',
      activities: JSON.stringify(['Stage Plays', 'Drama Workshops', 'Script Writing', 'Acting Training']),
      leaderId: clubLeader.id
    },
    {
      name: 'Entrepreneurship Forum (BUEDF)',
      description: 'Entrepreneurship Forum (BUEDF) focuses on fostering entrepreneurial mindset and supporting student startups.',
      category: 'BUSINESS',
      department: 'Extra-Curricular',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/styles/4_3_medium/public/widgets/cards/2024/12/15/entrepreneur.jpg?itok=4iVmuUM1',
      website: 'https://www.bracu.ac.bd/student-life/entrepreneurship-forum',
      email: 'buedf@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Dr. Business Innovation',
      foundedYear: 2012,
      vision: 'Creating successful entrepreneurs and innovators',
      mission: 'Supporting student entrepreneurship and business development',
      activities: JSON.stringify(['Startup Competitions', 'Business Workshops', 'Investor Meetups', 'Pitch Events']),
      leaderId: clubLeader.id
    },
    {
      name: 'Film Club (BUFC)',
      description: 'Film Club (BUFC) promotes cinema appreciation and film-making among students interested in visual storytelling.',
      category: 'CULTURAL',
      department: 'Extra-Curricular',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/styles/4_3_medium/public/uploads/2025/01/09/Visiting_Program.jpeg?itok=xVeGXwRO',
      website: 'https://www.bracu.ac.bd/student-life/film-club',
      email: 'bufc@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Prof. Media Studies',
      foundedYear: 2009,
      vision: 'Excellence in film-making and cinema arts',
      mission: 'Promoting film culture and visual storytelling',
      activities: JSON.stringify(['Film Screening', 'Documentary Making', 'Short Films', 'Video Production']),
      leaderId: clubLeader.id
    },
    {
      name: 'Response Team (BURT)',
      description: 'Response Team (BURT) provides emergency response training and disaster preparedness for the university community.',
      category: 'SERVICE',
      department: 'Extra-Curricular',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/styles/4_3_medium/public/widgets/cards/2024/12/15/response.jpg?itok=eDqTwMyx',
      website: 'https://www.bracu.ac.bd/student-life/response-team',
      email: 'burt@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Dr. Emergency Management',
      foundedYear: 2011,
      vision: 'Creating a safer campus environment',
      mission: 'Emergency response training and disaster preparedness',
      activities: JSON.stringify(['First Aid Training', 'Fire Safety', 'Emergency Drills', 'Rescue Operations']),
      leaderId: clubLeader.id
    },
    {
      name: 'MONON Club',
      description: 'MONON Club focuses on mental health awareness and psychological well-being of university students.',
      category: 'SERVICE',
      department: 'Extra-Curricular',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/uploads/2024/12/09/Monon%20champions%20of%20Cultural%20Fest%202.0.jpg?itok=PR7ruy_P',
      website: 'https://www.bracu.ac.bd/student-life/monon-club',
      email: 'monon@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Dr. Psychology',
      foundedYear: 2015,
      vision: 'Promoting mental health and well-being',
      mission: 'Supporting student psychological wellness',
      activities: JSON.stringify(['Mental Health Workshops', 'Counseling Support', 'Stress Management', 'Wellness Programs']),
      leaderId: clubLeader.id
    },
    {
      name: 'Leadership Development Forum (BULDF)',
      description: 'Leadership Development Forum (BULDF) focuses on developing leadership skills and qualities among students.',
      category: 'LEADERSHIP',
      department: 'Extra-Curricular',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/styles/4_3_medium/public/widgets/cards/2024/12/15/leadership.jpg?itok=nx0h-q9h',
      website: 'https://www.bracu.ac.bd/student-life/leadership-development-forum',
      email: 'buldf@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Dr. Leadership Studies',
      foundedYear: 2013,
      vision: 'Developing future leaders',
      mission: 'Enhancing leadership capabilities of students',
      activities: JSON.stringify(['Leadership Workshops', 'Team Building', 'Public Speaking', 'Project Management']),
      leaderId: clubLeader.id
    },
    
    // ACADEMIC CLUBS (Co-Curricular)
    {
      name: 'Computer Club (BUCC)',
      description: 'Computer Club (BUCC) is dedicated to promoting computer science knowledge and programming skills among students.',
      category: 'ACADEMIC',
      department: 'Computer Science',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/styles/4_3_medium/public/news-image/computer-club.jpg?itok=wzb8DUKA',
      website: 'https://www.bracu.ac.bd/student-life/computer-club',
      email: 'bucc@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Dr. Computer Science',
      foundedYear: 2002,
      vision: 'Excellence in computer science and technology',
      mission: 'Promoting programming culture and technical skills',
      activities: JSON.stringify(['Programming Contests', 'Hackathons', 'Tech Workshops', 'Software Development']),
      leaderId: clubLeader.id
    },
    {
      name: 'Robotics Club (ROBU)',
      description: 'Robotics Club (ROBU) explores the world of robotics and automation through hands-on projects and competitions.',
      category: 'ACADEMIC',
      department: 'Electrical Engineering',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/styles/4_3_medium/public/uploads/2025/01/11/EEE%20FYDP4.jpg?itok=TP8MEzVh',
      website: 'https://www.bracu.ac.bd/student-life/robotics-club',
      email: 'robu@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Dr. Robotics Engineering',
      foundedYear: 2007,
      vision: 'Innovation in robotics and automation',
      mission: 'Developing robotics skills and technological innovation',
      activities: JSON.stringify(['Robot Building', 'Automation Projects', 'AI Development', 'Technical Competitions']),
      leaderId: clubLeader.id
    },
    {
      name: 'Business Club (BIZBEE)',
      description: 'Business Club (BIZBEE) focuses on developing business acumen and entrepreneurial skills among students.',
      category: 'BUSINESS',
      department: 'Business',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/styles/4_3_medium/public/uploads/2025/01/15/Campus%20information.jpg?itok=6D5fAzpS',
      website: 'https://www.bracu.ac.bd/student-life/business-club',
      email: 'bizbee@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Dr. Business Studies',
      foundedYear: 2005,
      vision: 'Excellence in business education and practice',
      mission: 'Developing business leaders and entrepreneurs',
      activities: JSON.stringify(['Business Case Competitions', 'Corporate Visits', 'Networking Events', 'Business Simulations']),
      leaderId: clubLeader.id
    },
    {
      name: 'Finance and Accounting Club (BUFIN)',
      description: 'Finance and Accounting Club (BUFIN) promotes financial literacy and accounting knowledge among students.',
      category: 'BUSINESS',
      department: 'Business',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/styles/4_3_medium/public/uploads/2025/01/02/IDLC%20Finance%20PLC.jpg?itok=EYn9g1Eq',
      website: 'https://www.bracu.ac.bd/student-life/finance-accounting-club',
      email: 'bufin@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Dr. Finance',
      foundedYear: 2006,
      vision: 'Excellence in finance and accounting',
      mission: 'Developing financial expertise and accounting skills',
      activities: JSON.stringify(['Financial Analysis', 'Investment Workshops', 'Accounting Competitions', 'Financial Planning']),
      leaderId: clubLeader.id
    },
    {
      name: 'Marketing Association (BUMA)',
      description: 'Marketing Association (BUMA) focuses on developing marketing skills and understanding consumer behavior.',
      category: 'BUSINESS',
      department: 'Business',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/styles/4_3_medium/public/news-image/buma2.jpg?itok=kuStGh3A',
      website: 'https://www.bracu.ac.bd/student-life/marketing-association',
      email: 'buma@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Dr. Marketing',
      foundedYear: 2008,
      vision: 'Excellence in marketing and brand management',
      mission: 'Developing marketing professionals and brand strategists',
      activities: JSON.stringify(['Marketing Campaigns', 'Brand Analysis', 'Digital Marketing', 'Consumer Research']),
      leaderId: clubLeader.id
    },
    
    // SPORTS CLUBS
    {
      name: 'Cricket Club (CBU)',
      description: 'Cricket Club (CBU) promotes cricket sports and organizes tournaments for university students.',
      category: 'SPORTS',
      department: 'Sports',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/styles/4_3_medium/public/club-forms/logos/cricket-club-bracu.jpg?itok=af4jVzHV',
      website: 'https://www.bracu.ac.bd/student-life/cricket-club',
      email: 'cbu@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Coach Cricket',
      foundedYear: 2004,
      vision: 'Excellence in cricket sports',
      mission: 'Promoting cricket culture and sportsmanship',
      activities: JSON.stringify(['Cricket Tournaments', 'Training Sessions', 'Inter-University Matches', 'Sports Events']),
      leaderId: clubLeader.id
    },
    {
      name: 'Football Club (FCBU)',
      description: 'Football Club (FCBU) promotes football sports and physical fitness among university students.',
      category: 'SPORTS',
      department: 'Sports',
      status: 'ACTIVE',
      logoUrl: 'https://www.bracu.ac.bd/sites/default/files/styles/4_3_medium/public/news-image/footballth.jpg?itok=uXg4loq0',
      website: 'https://www.bracu.ac.bd/student-life/football-club',
      email: 'fcbu@bracu.ac.bd',
      phone: '+880 2 9664644',
      advisor: 'Coach Football',
      foundedYear: 2003,
      vision: 'Excellence in football and sports',
      mission: 'Promoting football culture and physical fitness',
      activities: JSON.stringify(['Football Tournaments', 'Training Sessions', 'Inter-University Matches', 'Sports Events']),
      leaderId: clubLeader.id
    }
  ]

  // Create clubs
  console.log('📦 Creating official BRAC University clubs...')
  const createdClubs = []
  for (const clubData of officialClubs) {
    const club = await prisma.club.create({
      data: clubData
    })
    createdClubs.push(club)
  }

  // Create some sample events
  console.log('🎉 Creating sample events...')
  const sampleEvents = [
    {
      title: 'Annual Tech Fest 2025',
      description: 'Join us for the biggest technology festival featuring programming contests, robotics competitions, and tech exhibitions.',
      date: new Date('2025-02-15T09:00:00'),
      startDate: new Date('2025-02-15T09:00:00'),
      endDate: new Date('2025-02-17T18:00:00'),
      location: 'BRAC University Campus',
      venue: 'Main Auditorium',
      capacity: 500,
      clubId: createdClubs.find(c => c.name.includes('Computer Club'))?.id || createdClubs[0].id,
      status: 'PENDING',
      requirements: 'Open to all students',
      isPublic: true
    },
    {
      title: 'Photography Workshop',
      description: 'Learn professional photography techniques from industry experts.',
      date: new Date('2025-01-25T14:00:00'),
      startDate: new Date('2025-01-25T14:00:00'),
      endDate: new Date('2025-01-25T17:00:00'),
      location: 'Art Studio, BRAC University',
      venue: 'Art Studio',
      capacity: 30,
      clubId: createdClubs.find(c => c.name.includes('Art & Photography'))?.id || createdClubs[1].id,
      status: 'APPROVED',
      requirements: 'Bring your own camera',
      isPublic: true
    },
    {
      title: 'Inter-University Football Tournament',
      description: 'Compete with other universities in this exciting football championship.',
      date: new Date('2025-03-01T08:00:00'),
      startDate: new Date('2025-03-01T08:00:00'),
      endDate: new Date('2025-03-03T18:00:00'),
      location: 'BRAC University Sports Ground',
      venue: 'Sports Ground',
      capacity: 200,
      clubId: createdClubs.find(c => c.name.includes('Football Club'))?.id || createdClubs[2].id,
      status: 'APPROVED',
      requirements: 'Team registration required',
      isPublic: true
    }
  ]

  for (const eventData of sampleEvents) {
    await prisma.event.create({
      data: eventData
    })
  }

  // Create some membership applications
  console.log('👥 Creating membership applications...')
  const sampleMemberships = [
    {
      userId: student.id,
      clubId: createdClubs[0].id,
      status: 'PENDING',
      role: 'Member'
    },
    {
      userId: student.id,
      clubId: createdClubs[1].id,
      status: 'ACCEPTED',
      role: 'Member',
      joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
    }
  ]

  for (const membershipData of sampleMemberships) {
    await prisma.membership.create({
      data: membershipData
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Created ${createdClubs.length} official BRAC University clubs`)
  console.log(`🎯 Created ${sampleEvents.length} events`)
  console.log(`👥 Created ${sampleMemberships.length} membership applications`)
  console.log('Demo credentials:')
  console.log('Admin: admin@bracu.ac.bd / admin123')
  console.log('Club Leader: leader@bracu.ac.bd / leader123')
  console.log('Student: student@bracu.ac.bd / student123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
