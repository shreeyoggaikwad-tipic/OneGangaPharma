#!/usr/bin/env node

/**
 * Setup script for medicine image upload functionality
 * Ensures all necessary directories and permissions are configured for local development
 */

const fs = require('fs');
const path = require('path');

const setupDirectories = () => {
  const baseUploadDir = path.resolve(process.cwd(), 'uploads');
  const directories = [
    baseUploadDir,
    path.join(baseUploadDir, 'medicine-images'),
    path.join(baseUploadDir, 'prescriptions'),
    path.join(baseUploadDir, 'temp')
  ];

  console.log('🔧 Setting up upload directories...');
  
  directories.forEach(dir => {
    try {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
        console.log(`✅ Created: ${dir}`);
      } else {
        console.log(`✓ Exists: ${dir}`);
      }
      
      // Verify write permissions
      fs.accessSync(dir, fs.constants.W_OK);
      console.log(`✓ Writable: ${dir}`);
      
    } catch (error) {
      console.error(`❌ Failed to setup ${dir}:`, error.message);
      process.exit(1);
    }
  });
};

const createGitignoreEntry = () => {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  const uploadEntries = [
    '',
    '# Upload directories',
    'uploads/',
    '!uploads/.gitkeep',
    ''
  ].join('\n');

  try {
    if (fs.existsSync(gitignorePath)) {
      const content = fs.readFileSync(gitignorePath, 'utf8');
      if (!content.includes('uploads/')) {
        fs.appendFileSync(gitignorePath, uploadEntries);
        console.log('✅ Updated .gitignore with upload directories');
      } else {
        console.log('✓ .gitignore already configured');
      }
    } else {
      fs.writeFileSync(gitignorePath, uploadEntries);
      console.log('✅ Created .gitignore with upload directories');
    }
  } catch (error) {
    console.warn('⚠️ Could not update .gitignore:', error.message);
  }
};

const createKeepFiles = () => {
  const directories = [
    'uploads/medicine-images',
    'uploads/prescriptions',
    'uploads/temp'
  ];

  directories.forEach(dir => {
    const keepFile = path.join(process.cwd(), dir, '.gitkeep');
    try {
      if (!fs.existsSync(keepFile)) {
        fs.writeFileSync(keepFile, '# Keep this directory in git\n');
        console.log(`✅ Created: ${keepFile}`);
      }
    } catch (error) {
      console.warn(`⚠️ Could not create ${keepFile}:`, error.message);
    }
  });
};

const validateEnvironment = () => {
  console.log('🔍 Validating environment...');
  
  // Check Node.js version
  const nodeVersion = process.version;
  console.log(`✓ Node.js version: ${nodeVersion}`);
  
  // Check write permissions in current directory
  try {
    const testFile = path.join(process.cwd(), '.write-test');
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    console.log('✓ Current directory is writable');
  } catch (error) {
    console.error('❌ Current directory is not writable:', error.message);
    process.exit(1);
  }
};

// Main setup function
const main = () => {
  console.log('🚀 Starting medicine upload setup...\n');
  
  validateEnvironment();
  setupDirectories();
  createGitignoreEntry();
  createKeepFiles();
  
  console.log('\n✅ Medicine upload setup completed successfully!');
  console.log('\n📋 Setup Summary:');
  console.log('   • Upload directories created with proper permissions');
  console.log('   • .gitignore configured to exclude uploaded files');
  console.log('   • .gitkeep files added to preserve directory structure');
  console.log('\n🎯 You can now upload medicine images in both individual and bulk modes.');
};

// Run setup if called directly
if (require.main === module) {
  main();
}

module.exports = { setupDirectories, validateEnvironment };