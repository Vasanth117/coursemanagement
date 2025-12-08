const mongoose = require('mongoose');
const { Logger } = require('../utils');

// Import seeders
const seedAdmins = require('./adminSeeder');
const seedFaculty = require('./facultySeeder');
const seedStudents = require('./studentSeeder');
const seedCourses = require('./courseSeeder');

// Main seeder function
const runSeeders = async () => {
  try {
    Logger.info('Starting database seeding...');

    // Check database connection
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Database not connected. Please ensure MongoDB is running and connected.');
    }

    // Run seeders in order (dependencies matter)
    Logger.info('Seeding admin users...');
    await seedAdmins();

    Logger.info('Seeding faculty users...');
    await seedFaculty();

    Logger.info('Seeding student users...');
    await seedStudents();

    Logger.info('Seeding courses...');
    await seedCourses();

    Logger.info('Database seeding completed successfully!');
    
    return {
      success: true,
      message: 'All seeders completed successfully'
    };
  } catch (error) {
    Logger.error('Database seeding failed:', error);
    throw error;
  }
};

// Individual seeder functions for selective seeding
const seeders = {
  admins: seedAdmins,
  faculty: seedFaculty,
  students: seedStudents,
  courses: seedCourses,
  all: runSeeders
};

// Run specific seeder
const runSeeder = async (seederName) => {
  try {
    if (!seeders[seederName]) {
      throw new Error(`Seeder '${seederName}' not found. Available seeders: ${Object.keys(seeders).join(', ')}`);
    }

    Logger.info(`Running ${seederName} seeder...`);
    const result = await seeders[seederName]();
    Logger.info(`${seederName} seeder completed successfully`);
    
    return result;
  } catch (error) {
    Logger.error(`${seederName} seeder failed:`, error);
    throw error;
  }
};

// Clear all data (use with caution)
const clearDatabase = async () => {
  try {
    Logger.warn('Clearing all database data...');
    
    const { User, Course, Enrollment, Assignment, Submission, Grade, Announcement, Resource, Attendance } = require('../models');
    
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Enrollment.deleteMany({}),
      Assignment.deleteMany({}),
      Submission.deleteMany({}),
      Grade.deleteMany({}),
      Announcement.deleteMany({}),
      Resource.deleteMany({}),
      Attendance.deleteMany({})
    ]);
    
    Logger.info('Database cleared successfully');
    return { success: true, message: 'Database cleared' };
  } catch (error) {
    Logger.error('Error clearing database:', error);
    throw error;
  }
};

// Reset database (clear and reseed)
const resetDatabase = async () => {
  try {
    Logger.info('Resetting database...');
    
    await clearDatabase();
    await runSeeders();
    
    Logger.info('Database reset completed successfully');
    return { success: true, message: 'Database reset completed' };
  } catch (error) {
    Logger.error('Database reset failed:', error);
    throw error;
  }
};

// CLI interface for running seeders
const runCLI = async () => {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    // Connect to database if not already connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI);
      Logger.info('Connected to MongoDB for seeding');
    }

    switch (command) {
      case 'seed':
        const seederName = args[1] || 'all';
        await runSeeder(seederName);
        break;
        
      case 'clear':
        await clearDatabase();
        break;
        
      case 'reset':
        await resetDatabase();
        break;
        
      default:
        console.log(`
Usage: node seeds/index.js <command> [options]

Commands:
  seed [seeder]  - Run specific seeder or all seeders
                   Available seeders: admins, faculty, students, courses, all
  clear          - Clear all database data (WARNING: This will delete all data)
  reset          - Clear database and run all seeders

Examples:
  node seeds/index.js seed all      - Run all seeders
  node seeds/index.js seed admins   - Run only admin seeder
  node seeds/index.js clear         - Clear all data
  node seeds/index.js reset         - Reset database
        `);
        break;
    }
    
    // Close database connection
    await mongoose.connection.close();
    Logger.info('Database connection closed');
    process.exit(0);
    
  } catch (error) {
    Logger.error('CLI operation failed:', error);
    process.exit(1);
  }
};

// Export functions
module.exports = {
  runSeeders,
  runSeeder,
  clearDatabase,
  resetDatabase,
  seeders
};

// Run CLI if this file is executed directly
if (require.main === module) {
  runCLI();
}