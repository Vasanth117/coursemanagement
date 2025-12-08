const { User } = require('../models');
const { Logger } = require('../utils');

const adminData = [
  {
    name: 'System Administrator',
    email: 'admin@college.edu',
    password: 'Admin123!',
    role: 'admin',
    employeeId: 'EMP0001',
    department: 'Administration',
    phone: '+1234567890',
    isActive: true
  },
  {
    name: 'John Smith',
    email: 'john.admin@admin.college.edu',
    password: 'Admin123!',
    role: 'admin',
    employeeId: 'EMP0002',
    department: 'IT Administration',
    phone: '+1234567891',
    isActive: true
  }
];

const seedAdmins = async () => {
  try {
    // Check if admins already exist
    const existingAdmins = await User.countDocuments({ role: 'admin' });
    
    if (existingAdmins > 0) {
      Logger.info('Admin users already exist, skipping admin seeding');
      return;
    }

    // Create admin users
    const admins = await User.create(adminData);
    
    Logger.info(`Successfully seeded ${admins.length} admin users`);
    return admins;
  } catch (error) {
    Logger.error('Error seeding admin users:', error);
    throw error;
  }
};

module.exports = seedAdmins;