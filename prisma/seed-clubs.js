// Simple JavaScript seeder for BRAC University Clubs
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with BRAC University Clubs...');

  try {
    // Find an admin user to assign as club leader
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!admin) {
      console.log('No admin user found. Creating one...');
      // Create an admin if none exists
      await prisma.user.create({
        data: {
          name: 'OCA Admin',
          email: 'admin@bracu.ac.bd',
          password: '$2a$12$K8GpVyiUWnV5wMqQIDYJMuSKNg9M/M/57mZV3AHTH7kORzzO0/Dc6', // admin123
          role: 'ADMIN',
          department: 'Office of Co-Curricular Activities',
        }
      });
    }

    // Find the admin again (either existing or newly created)
    const leader = await prisma.user.findFirst();

    if (!leader) {
      throw new Error('Failed to find or create an admin user');
    }

    // List of BRAC University clubs
    const bracuClubs = [
      { 
        name: "BRAC University Art and Photography Society", 
        category: 'Arts & Culture', 
        department: 'All', 
        description: 'A hub for creative minds to express themselves through various art forms and photography.', 
        vision: 'To be a leading platform for artistic expression.', 
        mission: 'To foster creativity and collaboration.', 
        activities: 'Workshops, Exhibitions, Photo-walks', 
        status: 'ACTIVE',
        leaderId: leader.id 
      },
      { 
        name: "BRAC University Computer Club (BUCC)", 
        category: 'Academic', 
        department: 'CSE', 
        description: 'A community for tech enthusiasts to learn, innovate, and collaborate on computing projects.', 
        vision: 'To be a center of technological innovation.', 
        mission: 'To foster a passion for computing.', 
        activities: 'Hackathons, Workshops, Tech Talks', 
        status: 'ACTIVE',
        leaderId: leader.id 
      },
      { 
        name: "BRAC University Cultural Club", 
        category: 'Arts & Culture', 
        department: 'All', 
        description: 'Promotes and preserves the rich cultural heritage of Bangladesh through various events and performances.', 
        vision: 'To be the cultural heart of the university.', 
        mission: 'To celebrate diversity through cultural expression.', 
        activities: 'Cultural Shows, Music Festivals, Dance Workshops', 
        status: 'ACTIVE',
        leaderId: leader.id 
      }
    ];

    // Delete existing clubs first
    await prisma.club.deleteMany({});
    console.log('Cleared existing clubs from the database.');

    // Create clubs
    for (const club of bracuClubs) {
      await prisma.club.create({
        data: club
      });
    }

    const clubCount = await prisma.club.count();
    console.log(`Seeding complete. Created ${clubCount} clubs.`);

  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
