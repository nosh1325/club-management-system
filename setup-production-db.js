#!/usr/bin/env node

/**
 * Setup production database for Club Connect
 * Run this script locally with production DATABASE_URL to set up Supabase
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🏗️  Setting up Club Connect production database...');

// Check if we have the required environment variables
if (!process.env.DATABASE_URL || !process.env.DIRECT_URL) {
  console.error('❌ Missing required environment variables:');
  console.error('   DATABASE_URL - Your Supabase connection string');
  console.error('   DIRECT_URL - Your Supabase direct connection string');
  console.error('\nPlease set these in your .env file or environment.');
  process.exit(1);
}

console.log('✅ Environment variables found');

try {
  // 1. Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });

  // 2. Push schema to database (this creates tables)
  console.log('🗄️  Creating database tables...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });

  // 3. Run seed script
  console.log('🌱 Seeding database with initial data...');
  execSync('npx prisma db seed', { stdio: 'inherit' });

  console.log('\n✅ Production database setup completed!');
  console.log('🚀 Your Club Connect app is ready for deployment.');
  
} catch (error) {
  console.error('\n❌ Database setup failed:', error.message);
  console.error('\nTroubleshooting:');
  console.error('1. Check your Supabase connection strings');
  console.error('2. Ensure your Supabase project is active');
  console.error('3. Verify network connectivity to Supabase');
  process.exit(1);
}
