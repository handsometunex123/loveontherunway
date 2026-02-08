#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Ensure DATABASE_URL exists for build time
if (!process.env.DATABASE_URL) {
  console.warn('⚠️  DATABASE_URL not found, using placeholder for build...');
  process.env.DATABASE_URL = 'postgresql://placeholder:placeholder@localhost:5432/placeholder';
}

try {
  // Generate Prisma client
  console.log('Generating Prisma client...');
  execSync('prisma generate', { stdio: 'inherit' });

  // Run Next.js build
  console.log('Building Next.js...');
  execSync('next build', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
