const { User } = require('../models');
const { Logger } = require('../utils');

const facultyData = [
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@faculty.college.edu',
    password: 'Faculty123!',
    role: 'faculty',
    employeeId: 'EMP1001',
    department: 'Computer Science',
    phone: '+1234567892',
    isActive: true
  },
  {
    name: 'Prof. Michael Brown',
    email: 'michael.brown@faculty.college.edu',
    password: 'Faculty123!',
    role: 'faculty',
    employeeId: 'EMP1002',
    department: 'Mathematics',
    phone: '+1234567893',
    isActive: true
  },
  {
    name: 'Dr. Emily Davis',
    email: 'emily.davis@faculty.college.edu',
    password: 'Faculty123!',
    role: 'faculty',
    employeeId: 'EMP1003',
    department: 'Physics',
    phone: '+1234567894',
    isActive: true
  },
  {
    name: 'Prof. Robert Wilson',
    email: 'robert.wilson@faculty.college.edu',
    password: 'Faculty123!',
    role: 'faculty',
    employeeId: 'EMP1004',
    department: 'Chemistry',
    phone: '+1234567895',
    isActive: true
  },
  {
    name: 'Dr. Lisa Anderson',
    email: 'lisa.anderson@faculty.college.edu',
    password: 'Faculty123!',
    role: 'faculty',
    employeeId: 'EMP1005',
    department: 'Biology',
    phone: '+1234567896',
    isActive: true
  },
  {
    name: 'Prof. David Martinez',
    email: 'david.martinez@faculty.college.edu',
    password: 'Faculty123!',
    role: 'faculty',
    employeeId: 'EMP1006',
    department: 'English',
    phone: '+1234567897',
    isActive: true
  },
  {
    name: 'Dr. Jennifer Taylor',
    email: 'jennifer.taylor@faculty.college.edu',
    password: 'Faculty123!',
    role: 'faculty',
    employeeId: 'EMP1007',
    department: 'History',
    phone: '+1234567898',
    isActive: true
  },
  {
    name: 'Prof. James Garcia',
    email: 'james.garcia@faculty.college.edu',
    password: 'Faculty123!',
    role: 'faculty',
    employeeId: 'EMP1008',
    department: 'Psychology',
    phone: '+1234567899',
    isActive: true
  }
];

const seedFaculty = async () => {
  try {
    // Check if faculty already exist
    const existingFaculty = await User.countDocuments({ role: 'faculty' });
    
    if (existingFaculty > 0) {
      Logger.info('Faculty users already exist, skipping faculty seeding');
      return;
    }

    // Create faculty users
    const faculty = await User.create(facultyData);
    
    Logger.info(`Successfully seeded ${faculty.length} faculty users`);
    return faculty;
  } catch (error) {
    Logger.error('Error seeding faculty users:', error);
    throw error;
  }
};

module.exports = seedFaculty;