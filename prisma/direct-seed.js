// Direct seeding script for SQLite database
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting direct database seeding...');
    
    // Create admin user if it doesn't exist
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@bracu.ac.bd' }
    });
    
    const admin = existingAdmin || await prisma.user.create({
      data: {
        id: 'admin-user-id',
        name: 'OCA Admin',
        email: 'admin@bracu.ac.bd',
        // This is a pre-hashed version of 'admin123'
        password: '$2a$12$K8GpVyiUWnV5wMqQIDYJMuSKNg9M/M/57mZV3AHTH7kORzzO0/Dc6',
        role: 'ADMIN',
        department: 'Office of Co-Curricular Activities',
        updatedAt: new Date()
      }
    });
    
    console.log('Admin user created or verified');
    
    // Create some clubs
    const clubs = [
      {
        id: 'bucc-club-id',
        name: 'BRAC University Computer Club (BUCC)',
        description: 'A community for tech enthusiasts to learn, innovate, and collaborate on computing projects.',
        category: 'Academic',
        department: 'CSE',
        status: 'ACTIVE',
        vision: 'To be a center of technological innovation.',
        mission: 'To foster a passion for computing.',
        activities: 'Hackathons, Workshops, Tech Talks',
        leaderId: admin.id,
        updatedAt: new Date()
      },
      {
        id: 'cultural-club-id',
        name: 'BRAC University Cultural Club',
        description: 'Promotes and preserves the rich cultural heritage of Bangladesh through various events and performances.',
        category: 'Arts & Culture',
        department: 'All',
        status: 'ACTIVE',
        vision: 'To be the cultural heart of the university.',
        mission: 'To celebrate diversity through cultural expression.',
        activities: 'Cultural Shows, Music Festivals, Dance Workshops',
        leaderId: admin.id,
        updatedAt: new Date()
      },
      {
        id: 'photo-club-id',
        name: 'BRAC University Art and Photography Society',
        description: 'A hub for creative minds to express themselves through various art forms and photography.',
        category: 'Arts & Culture',
        department: 'All',
        status: 'ACTIVE',
        vision: 'To be a leading platform for artistic expression.',
        mission: 'To foster creativity and collaboration.',
        activities: 'Workshops, Exhibitions, Photo-walks',
        leaderId: admin.id,
        updatedAt: new Date()
      }
    ];
    
    // First delete existing clubs
    console.log('Deleting existing clubs...');
    await prisma.club.deleteMany({});
    
    // Create each club
    for (const club of clubs) {
      await prisma.club.create({ data: club });
    }
    
    const clubCount = await prisma.club.count();
    console.log(`Successfully seeded ${clubCount} clubs to the database`);
    
  } catch (error) {
    console.error('Error during direct seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
