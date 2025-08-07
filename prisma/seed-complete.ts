import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with Complete BRAC University Clubs...')

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

  console.log('📦 Creating BRAC University clubs...')

  // Using reliable placeholder images from Unsplash and Picsum
  const clubs = [
    {
      name: 'Adventure Club (BUAC)',
      description: 'Outdoor adventures, hiking, camping, and exploring nature',
      category: 'Sports & Recreation',
      department: 'Extra-Curricular',
      logoUrl: 'https://picsum.photos/400/300?random=1',
      website: 'https://adventure.bracu.ac.bd',
      email: 'adventure@bracu.ac.bd',
      phone: '+880 1234 567801',
      advisor: 'Dr. Adventure Khan',
      foundedYear: 2010,
      vision: 'To promote outdoor activities and adventure sports',
      mission: 'Building resilient and adventurous students',
      activities: '["Hiking", "Camping", "Rock Climbing", "Nature Photography"]',
    },
    {
      name: 'Art & Photography Society (BUAPS)',
      description: 'Visual arts, photography workshops, and creative exhibitions',
      category: 'Arts & Culture',
      department: 'Extra-Curricular',
      logoUrl: 'https://picsum.photos/400/300?random=2',
      website: 'https://arts.bracu.ac.bd',
      email: 'arts@bracu.ac.bd',
      phone: '+880 1234 567802',
      advisor: 'Prof. Creative Artist',
      foundedYear: 2008,
      vision: 'To foster creativity and artistic expression',
      mission: 'Developing visual literacy and artistic skills',
      activities: '["Photography", "Painting", "Digital Art", "Exhibitions"]',
    },
    {
      name: 'Community Service Club (BUCSC)',
      description: 'Social work, volunteer activities, and community development',
      category: 'Social Service',
      department: 'Extra-Curricular',
      logoUrl: 'https://picsum.photos/400/300?random=3',
      website: 'https://service.bracu.ac.bd',
      email: 'service@bracu.ac.bd',
      phone: '+880 1234 567803',
      advisor: 'Dr. Social Worker',
      foundedYear: 2005,
      vision: 'To serve the community and create positive impact',
      mission: 'Building socially responsible citizens',
      activities: '["Volunteering", "Blood Donation", "Teaching", "Environment"]',
    },
    {
      name: 'Cultural Club (BUCuC)',
      description: 'Music, dance, drama, and cultural events',
      category: 'Arts & Culture',
      department: 'Extra-Curricular',
      logoUrl: 'https://picsum.photos/400/300?random=4',
      website: 'https://culture.bracu.ac.bd',
      email: 'culture@bracu.ac.bd',
      phone: '+880 1234 567804',
      advisor: 'Prof. Cultural Expert',
      foundedYear: 2003,
      vision: 'To preserve and promote cultural heritage',
      mission: 'Celebrating diversity through arts',
      activities: '["Music", "Dance", "Drama", "Poetry"]',
    },
    {
      name: 'Debating Club (BUDC)',
      description: 'Public speaking, debates, and intellectual discussions',
      category: 'Academic',
      department: 'Extra-Curricular',
      logoUrl: 'https://picsum.photos/400/300?random=5',
      website: 'https://debate.bracu.ac.bd',
      email: 'debate@bracu.ac.bd',
      phone: '+880 1234 567805',
      advisor: 'Dr. Speech Expert',
      foundedYear: 2004,
      vision: 'To develop critical thinking and communication skills',
      mission: 'Empowering voices through debate',
      activities: '["Debates", "Public Speaking", "Workshops", "Competitions"]',
    },
    {
      name: 'BRAC University Programming Club',
      description: 'Programming contests, coding workshops, and tech events',
      category: 'Technology',
      department: 'Computer Science',
      logoUrl: 'https://picsum.photos/400/300?random=6',
      website: 'https://programming.bracu.ac.bd',
      email: 'programming@bracu.ac.bd',
      phone: '+880 1234 567806',
      advisor: 'Dr. Code Master',
      foundedYear: 2006,
      vision: 'To excel in competitive programming',
      mission: 'Building world-class programmers',
      activities: '["Coding Contests", "Workshops", "Hackathons", "Training"]',
      leaderId: clubLeader.id,
    },
    {
      name: 'BRAC University Robotics Club',
      description: 'Robotics projects, automation, and innovation',
      category: 'Technology',
      department: 'Electrical Engineering',
      logoUrl: 'https://picsum.photos/400/300?random=7',
      website: 'https://robotics.bracu.ac.bd',
      email: 'robotics@bracu.ac.bd',
      phone: '+880 1234 567807',
      advisor: 'Dr. Robot Engineer',
      foundedYear: 2007,
      vision: 'To advance robotics and automation',
      mission: 'Creating innovative robotic solutions',
      activities: '["Robot Building", "Competitions", "Automation", "AI Projects"]',
    },
    {
      name: 'Entrepreneur Club (BUEC)',
      description: 'Business ideas, startups, and entrepreneurship development',
      category: 'Business',
      department: 'Business',
      logoUrl: 'https://picsum.photos/400/300?random=8',
      website: 'https://entrepreneur.bracu.ac.bd',
      email: 'entrepreneur@bracu.ac.bd',
      phone: '+880 1234 567808',
      advisor: 'Prof. Business Leader',
      foundedYear: 2009,
      vision: 'To foster entrepreneurial mindset',
      mission: 'Creating successful entrepreneurs',
      activities: '["Startup Pitches", "Business Plans", "Networking", "Mentoring"]',
    },
    {
      name: 'BRAC University Cricket Club',
      description: 'Cricket training, matches, and tournaments',
      category: 'Sports & Recreation',
      department: 'Sports',
      logoUrl: 'https://picsum.photos/400/300?random=9',
      website: 'https://cricket.bracu.ac.bd',
      email: 'cricket@bracu.ac.bd',
      phone: '+880 1234 567809',
      advisor: 'Coach Cricket Master',
      foundedYear: 2005,
      vision: 'To excel in cricket sports',
      mission: 'Building champion cricketers',
      activities: '["Training", "Matches", "Tournaments", "Coaching"]',
    },
    {
      name: 'BRAC University Football Club',
      description: 'Football training, matches, and sports development',
      category: 'Sports & Recreation',
      department: 'Sports',
      logoUrl: 'https://picsum.photos/400/300?random=10',
      website: 'https://football.bracu.ac.bd',
      email: 'football@bracu.ac.bd',
      phone: '+880 1234 567810',
      advisor: 'Coach Football Pro',
      foundedYear: 2004,
      vision: 'To promote football excellence',
      mission: 'Developing skilled football players',
      activities: '["Training", "Matches", "Fitness", "Tournaments"]',
    },
    // Additional clubs to reach 31 total
    {
      name: 'Business Club (BUBC)',
      description: 'Business case competitions, corporate networking, and industry insights',
      category: 'Business',
      department: 'Business',
      logoUrl: 'https://picsum.photos/400/300?random=11',
      website: 'https://business.bracu.ac.bd',
      email: 'business@bracu.ac.bd',
      phone: '+880 1234 567811',
      advisor: 'Prof. Business Expert',
      foundedYear: 2006,
      vision: 'To bridge academia and industry',
      mission: 'Preparing future business leaders',
      activities: '["Case Competitions", "Networking", "Corporate Visits", "Seminars"]',
    },
    {
      name: 'Economics Club (BUEC)',
      description: 'Economic research, policy discussions, and financial literacy',
      category: 'Academic',
      department: 'Economics',
      logoUrl: 'https://picsum.photos/400/300?random=12',
      website: 'https://economics.bracu.ac.bd',
      email: 'economics@bracu.ac.bd',
      phone: '+880 1234 567812',
      advisor: 'Dr. Economics Scholar',
      foundedYear: 2008,
      vision: 'To understand economic phenomena',
      mission: 'Promoting economic literacy',
      activities: '["Research", "Policy Analysis", "Seminars", "Publications"]',
    },
    {
      name: 'Environmental Club (BUENC)',
      description: 'Environmental awareness, sustainability projects, and green initiatives',
      category: 'Social Service',
      department: 'Environmental Science',
      logoUrl: 'https://picsum.photos/400/300?random=13',
      website: 'https://environment.bracu.ac.bd',
      email: 'environment@bracu.ac.bd',
      phone: '+880 1234 567813',
      advisor: 'Dr. Green Expert',
      foundedYear: 2010,
      vision: 'To protect our environment',
      mission: 'Creating environmental awareness',
      activities: '["Tree Planting", "Clean-up Drives", "Awareness", "Research"]',
    },
    {
      name: 'Film & Media Club (BUFMC)',
      description: 'Film making, media production, and creative storytelling',
      category: 'Arts & Culture',
      department: 'Media Studies',
      logoUrl: 'https://picsum.photos/400/300?random=14',
      website: 'https://film.bracu.ac.bd',
      email: 'film@bracu.ac.bd',
      phone: '+880 1234 567814',
      advisor: 'Prof. Media Master',
      foundedYear: 2011,
      vision: 'To tell compelling stories',
      mission: 'Developing media professionals',
      activities: '["Film Making", "Documentaries", "Editing", "Screenings"]',
    },
    {
      name: 'Gaming Club (BUGC)',
      description: 'Esports, gaming tournaments, and digital entertainment',
      category: 'Technology',
      department: 'Computer Science',
      logoUrl: 'https://picsum.photos/400/300?random=15',
      website: 'https://gaming.bracu.ac.bd',
      email: 'gaming@bracu.ac.bd',
      phone: '+880 1234 567815',
      advisor: 'Prof. Game Designer',
      foundedYear: 2015,
      vision: 'To excel in competitive gaming',
      mission: 'Building esports champions',
      activities: '["Tournaments", "Training", "Game Development", "Streaming"]',
    },
    {
      name: 'Health & Wellness Club (BUHWC)',
      description: 'Health awareness, fitness programs, and wellness activities',
      category: 'Health & Fitness',
      department: 'Public Health',
      logoUrl: 'https://picsum.photos/400/300?random=16',
      website: 'https://health.bracu.ac.bd',
      email: 'health@bracu.ac.bd',
      phone: '+880 1234 567816',
      advisor: 'Dr. Health Expert',
      foundedYear: 2012,
      vision: 'To promote healthy living',
      mission: 'Building healthy communities',
      activities: '["Fitness Programs", "Health Camps", "Awareness", "Nutrition"]',
    },
    {
      name: 'Innovation & Technology Club (BUITC)',
      description: 'Innovation projects, technology trends, and research',
      category: 'Technology',
      department: 'Engineering',
      logoUrl: 'https://picsum.photos/400/300?random=17',
      website: 'https://innovation.bracu.ac.bd',
      email: 'innovation@bracu.ac.bd',
      phone: '+880 1234 567817',
      advisor: 'Dr. Innovation Leader',
      foundedYear: 2013,
      vision: 'To drive technological innovation',
      mission: 'Creating innovative solutions',
      activities: '["Research", "Prototyping", "Tech Talks", "Innovation Labs"]',
    },
    {
      name: 'Language Club (BULC)',
      description: 'Language learning, translation, and cultural exchange',
      category: 'Academic',
      department: 'Languages',
      logoUrl: 'https://picsum.photos/400/300?random=18',
      website: 'https://language.bracu.ac.bd',
      email: 'language@bracu.ac.bd',
      phone: '+880 1234 567818',
      advisor: 'Prof. Linguist',
      foundedYear: 2009,
      vision: 'To bridge linguistic barriers',
      mission: 'Promoting multilingual communication',
      activities: '["Language Classes", "Translation", "Cultural Events", "Exchange"]',
    },
    {
      name: 'Leadership Development Club (BULDC)',
      description: 'Leadership training, personal development, and mentoring',
      category: 'Professional Development',
      department: 'Management',
      logoUrl: 'https://picsum.photos/400/300?random=19',
      website: 'https://leadership.bracu.ac.bd',
      email: 'leadership@bracu.ac.bd',
      phone: '+880 1234 567819',
      advisor: 'Dr. Leadership Guru',
      foundedYear: 2007,
      vision: 'To develop future leaders',
      mission: 'Building leadership capabilities',
      activities: '["Workshops", "Mentoring", "Seminars", "Training"]',
    },
    {
      name: 'Mathematics Club (BUMC)',
      description: 'Mathematical problem solving, competitions, and research',
      category: 'Academic',
      department: 'Mathematics',
      logoUrl: 'https://picsum.photos/400/300?random=20',
      website: 'https://math.bracu.ac.bd',
      email: 'math@bracu.ac.bd',
      phone: '+880 1234 567820',
      advisor: 'Dr. Math Genius',
      foundedYear: 2005,
      vision: 'To explore mathematical beauty',
      mission: 'Promoting mathematical excellence',
      activities: '["Problem Solving", "Competitions", "Research", "Tutoring"]',
    },
    {
      name: 'Music Club (BUMC)',
      description: 'Musical performances, concerts, and music education',
      category: 'Arts & Culture',
      department: 'Music',
      logoUrl: 'https://picsum.photos/400/300?random=21',
      website: 'https://music.bracu.ac.bd',
      email: 'music@bracu.ac.bd',
      phone: '+880 1234 567821',
      advisor: 'Prof. Music Maestro',
      foundedYear: 2004,
      vision: 'To create beautiful music',
      mission: 'Nurturing musical talent',
      activities: '["Concerts", "Performances", "Music Lessons", "Competitions"]',
    },
    {
      name: 'Photography Club (BUPC)',
      description: 'Photography workshops, exhibitions, and visual storytelling',
      category: 'Arts & Culture',
      department: 'Visual Arts',
      logoUrl: 'https://picsum.photos/400/300?random=22',
      website: 'https://photography.bracu.ac.bd',
      email: 'photography@bracu.ac.bd',
      phone: '+880 1234 567822',
      advisor: 'Prof. Photo Artist',
      foundedYear: 2008,
      vision: 'To capture life through lens',
      mission: 'Developing photographic skills',
      activities: '["Photography", "Exhibitions", "Workshops", "Photo Walks"]',
    },
    {
      name: 'Psychology Club (BUPC)',
      description: 'Mental health awareness, psychological research, and counseling',
      category: 'Academic',
      department: 'Psychology',
      logoUrl: 'https://picsum.photos/400/300?random=23',
      website: 'https://psychology.bracu.ac.bd',
      email: 'psychology@bracu.ac.bd',
      phone: '+880 1234 567823',
      advisor: 'Dr. Mind Doctor',
      foundedYear: 2010,
      vision: 'To understand human behavior',
      mission: 'Promoting mental wellness',
      activities: '["Research", "Counseling", "Awareness", "Workshops"]',
    },
    {
      name: 'Science Club (BUSC)',
      description: 'Scientific research, experiments, and STEM education',
      category: 'Academic',
      department: 'Sciences',
      logoUrl: 'https://picsum.photos/400/300?random=24',
      website: 'https://science.bracu.ac.bd',
      email: 'science@bracu.ac.bd',
      phone: '+880 1234 567824',
      advisor: 'Dr. Science Explorer',
      foundedYear: 2006,
      vision: 'To advance scientific knowledge',
      mission: 'Promoting scientific literacy',
      activities: '["Experiments", "Research", "Science Fairs", "Education"]',
    },
    {
      name: 'Social Work Club (BUSWC)',
      description: 'Social welfare, community service, and humanitarian activities',
      category: 'Social Service',
      department: 'Social Work',
      logoUrl: 'https://picsum.photos/400/300?random=25',
      website: 'https://socialwork.bracu.ac.bd',
      email: 'socialwork@bracu.ac.bd',
      phone: '+880 1234 567825',
      advisor: 'Dr. Social Helper',
      foundedYear: 2005,
      vision: 'To serve humanity',
      mission: 'Building compassionate society',
      activities: '["Community Service", "Welfare", "Volunteering", "Advocacy"]',
    },
    {
      name: 'Table Tennis Club (BUTTC)',
      description: 'Table tennis training, tournaments, and sports development',
      category: 'Sports & Recreation',
      department: 'Sports',
      logoUrl: 'https://picsum.photos/400/300?random=26',
      website: 'https://tabletennis.bracu.ac.bd',
      email: 'tabletennis@bracu.ac.bd',
      phone: '+880 1234 567826',
      advisor: 'Coach TT Master',
      foundedYear: 2007,
      vision: 'To excel in table tennis',
      mission: 'Developing table tennis skills',
      activities: '["Training", "Tournaments", "Coaching", "Competitions"]',
    },
    {
      name: 'Theatre Club (BUTC)',
      description: 'Drama productions, acting workshops, and theatrical performances',
      category: 'Arts & Culture',
      department: 'Theatre Arts',
      logoUrl: 'https://picsum.photos/400/300?random=27',
      website: 'https://theatre.bracu.ac.bd',
      email: 'theatre@bracu.ac.bd',
      phone: '+880 1234 567827',
      advisor: 'Prof. Drama Queen',
      foundedYear: 2004,
      vision: 'To bring stories to life',
      mission: 'Developing theatrical talent',
      activities: '["Drama", "Acting", "Productions", "Workshops"]',
    },
    {
      name: 'Travel Club (BUTC)',
      description: 'Travel planning, cultural exploration, and adventure trips',
      category: 'Travel & Tourism',
      department: 'Tourism',
      logoUrl: 'https://picsum.photos/400/300?random=28',
      website: 'https://travel.bracu.ac.bd',
      email: 'travel@bracu.ac.bd',
      phone: '+880 1234 567828',
      advisor: 'Prof. Wanderlust',
      foundedYear: 2011,
      vision: 'To explore the world',
      mission: 'Promoting cultural understanding',
      activities: '["Trips", "Cultural Exchange", "Planning", "Photography"]',
    },
    {
      name: 'Volunteer Club (BUVC)',
      description: 'Volunteer coordination, social impact, and community engagement',
      category: 'Social Service',
      department: 'Community Service',
      logoUrl: 'https://picsum.photos/400/300?random=29',
      website: 'https://volunteer.bracu.ac.bd',
      email: 'volunteer@bracu.ac.bd',
      phone: '+880 1234 567829',
      advisor: 'Dr. Volunteer Spirit',
      foundedYear: 2006,
      vision: 'To make a difference',
      mission: 'Building volunteer culture',
      activities: '["Volunteering", "Community Work", "Social Impact", "Coordination"]',
    },
    {
      name: 'Web Development Club (BUWDC)',
      description: 'Web development, digital solutions, and tech innovation',
      category: 'Technology',
      department: 'Computer Science',
      logoUrl: 'https://picsum.photos/400/300?random=30',
      website: 'https://webdev.bracu.ac.bd',
      email: 'webdev@bracu.ac.bd',
      phone: '+880 1234 567830',
      advisor: 'Prof. Web Wizard',
      foundedYear: 2012,
      vision: 'To build the digital future',
      mission: 'Creating innovative web solutions',
      activities: '["Web Development", "Workshops", "Projects", "Hackathons"]',
    },
    {
      name: 'Writing Club (BUWC)',
      description: 'Creative writing, publications, and literary activities',
      category: 'Academic',
      department: 'English',
      logoUrl: 'https://picsum.photos/400/300?random=31',
      website: 'https://writing.bracu.ac.bd',
      email: 'writing@bracu.ac.bd',
      phone: '+880 1234 567831',
      advisor: 'Prof. Word Magician',
      foundedYear: 2009,
      vision: 'To express through words',
      mission: 'Nurturing writing talent',
      activities: '["Creative Writing", "Publications", "Workshops", "Competitions"]',
    },
  ]

  // Create clubs
  for (const clubData of clubs) {
    await prisma.club.create({
      data: {
        ...clubData,
        status: 'ACTIVE',
      }
    })
  }

  // Create some sample events
  console.log('🎉 Creating sample events...')
  const programmingClub = await prisma.club.findFirst({
    where: { name: 'BRAC University Programming Club' }
  })

  if (programmingClub) {
    await prisma.event.create({
      data: {
        title: 'ICPC Programming Contest 2025',
        description: 'Annual programming contest for competitive programming enthusiasts',
        date: new Date('2025-02-15T10:00:00Z'),
        location: 'Computer Lab 1',
        capacity: 100,
        clubId: programmingClub.id,
        status: 'APPROVED',
      }
    })

    await prisma.event.create({
      data: {
        title: 'Web Development Workshop',
        description: 'Learn modern web development with React and Next.js',
        date: new Date('2025-01-25T14:00:00Z'),
        location: 'Auditorium',
        capacity: 50,
        clubId: programmingClub.id,
        status: 'PENDING',
      }
    })
  }

  // Create some membership applications
  console.log('👥 Creating membership applications...')
  if (programmingClub) {
    await prisma.membership.create({
      data: {
        userId: student.id,
        clubId: programmingClub.id,
        status: 'PENDING',
      }
    })
  }

  const roboticsClub = await prisma.club.findFirst({
    where: { name: 'BRAC University Robotics Club' }
  })

  if (roboticsClub) {
    await prisma.membership.create({
      data: {
        userId: student.id,
        clubId: roboticsClub.id,
        status: 'ACCEPTED',
      }
    })
  }

  console.log('✅ Database seeded successfully!')
  console.log(`📊 Created ${clubs.length} clubs`)
  console.log('🎯 Created sample events')
  console.log('👥 Created membership applications')
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
