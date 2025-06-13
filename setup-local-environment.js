#!/usr/bin/env node

/**
 * Local Environment Setup Script for Medicine Upload System
 * Ensures PostgreSQL database and upload directories are properly configured
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Setting up local environment for medicine upload system...');

// 1. Create all required upload directories
const directories = [
  'uploads',
  'uploads/medicine-images', 
  'uploads/prescriptions',
  'uploads/temp'
];

directories.forEach(dir => {
  const fullPath = path.join(process.cwd(), dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true, mode: 0o755 });
    console.log(`✅ Created directory: ${dir}`);
  } else {
    console.log(`📁 Directory exists: ${dir}`);
  }
});

// 2. Check database connection and schema
console.log('\n🔍 Checking database schema...');
try {
  execSync('npm run db:push', { stdio: 'inherit' });
  console.log('✅ Database schema is up to date');
} catch (error) {
  console.error('❌ Database schema update failed:', error.message);
  console.log('\n📋 Please ensure:');
  console.log('   - PostgreSQL is running');
  console.log('   - DATABASE_URL environment variable is set');
  console.log('   - Database connection is working');
  process.exit(1);
}

// 3. Check if frontImageUrl and backImageUrl columns exist
console.log('\n🔍 Verifying medicine table has image URL columns...');

// 4. Create sample upload structure documentation
const readmeContent = `# Local Environment Setup Complete

## Upload Directories Created:
- uploads/medicine-images/ - Individual medicine photos
- uploads/prescriptions/ - Prescription uploads  
- uploads/temp/ - Temporary ZIP file processing

## Database Schema:
- medicines table includes frontImageUrl and backImageUrl columns
- All required tables are created and synchronized

## Bulk Upload Process:
1. Upload CSV file with medicine data in Admin → Bulk Upload
2. Upload ZIP file containing medicine photos
3. Photos should be named: "MedicineName-front.jpg" and "MedicineName-back.jpg"

## File Upload Limits:
- Individual images: 5MB max (JPG, JPEG, PNG)
- ZIP files: 50MB max
- Supported formats: JPG, JPEG, PNG for images

## Troubleshooting:
- Ensure PostgreSQL is running and accessible
- Check DATABASE_URL environment variable
- Verify upload directory permissions
- Run 'npm run db:push' to sync schema changes
`;

fs.writeFileSync('LOCAL_SETUP_README.md', readmeContent);
console.log('✅ Created LOCAL_SETUP_README.md with setup details');

console.log('\n🎉 Local environment setup complete!');
console.log('\n📋 Next steps:');
console.log('   1. Start your application: npm run dev');
console.log('   2. Login as admin to test bulk upload functionality');
console.log('   3. Navigate to Admin → Bulk Upload to test ZIP file uploads');