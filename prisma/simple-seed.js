// Simple seeding script for the Discover Clubs page
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating a simple club for the Discover Clubs page...');
    
    // First check if we have any clubs already
    const clubCount = await prisma.club.count();
    
    if (clubCount > 0) {
      console.log(`Database already has ${clubCount} clubs, no need to seed.`);
      return;
    }
    
    // Create an admin user if needed
    let adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (!adminUser) {
      console.log('Creating admin user...');
      adminUser = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: 'admin@bracu.ac.bd',
          password: '$2a$12$K8GpVyiUWnV5wMqQIDYJMuSKNg9M/M/57mZV3AHTH7kORzzO0/Dc6', // admin123
          role: 'ADMIN',
          updatedAt: new Date()
        }
      });
    }
    
    // Create a minimal club that should work with any schema
    console.log('Creating BUCC club...');
    await prisma.club.create({
      data: {
        name: 'BRAC University Computer Club (BUCC)',
        description: 'A community for tech enthusiasts to learn, innovate, and collaborate on computing projects.',
        status: 'ACTIVE',
        leaderId: adminUser.id,
        updatedAt: new Date()
      }
    });
    
    // Check that the club was created
    const newCount = await prisma.club.count();
    console.log(`Successfully created ${newCount} clubs.`);
    
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
