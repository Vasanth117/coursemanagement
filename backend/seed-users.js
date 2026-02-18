const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});

    // Create test users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@sece.ac.in',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        department: 'Administration',
        isEmailVerified: true
      },
      {
        name: 'Faculty User',
        email: 'faculty@sece.ac.in',
        password: await bcrypt.hash('faculty123', 10),
        role: 'faculty',
        department: 'cse',
        employeeId: 'EMP001',
        isEmailVerified: true
      },
      {
        name: 'Student User',
        email: 'student@sece.ac.in',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        department: 'cse',
        studentId: '2024001',
        isEmailVerified: true
      }
    ];

    await User.insertMany(users);
    console.log('✅ Test users created successfully');
    console.log('Login credentials:');
    console.log('Admin: admin@sece.ac.in / admin123');
    console.log('Faculty: faculty@sece.ac.in / faculty123');
    console.log('Student: student@sece.ac.in / student123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();