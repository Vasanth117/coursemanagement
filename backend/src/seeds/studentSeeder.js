const { User } = require('../models');
const { Logger } = require('../utils');

const studentData = [
  {
    name: 'Alice Cooper',
    email: 'alice.cooper@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024001',
    department: 'Computer Science',
    phone: '+1234567900',
    isActive: true
  },
  {
    name: 'Bob Johnson',
    email: 'bob.johnson@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024002',
    department: 'Computer Science',
    phone: '+1234567901',
    isActive: true
  },
  {
    name: 'Carol Smith',
    email: 'carol.smith@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024003',
    department: 'Mathematics',
    phone: '+1234567902',
    isActive: true
  },
  {
    name: 'David Brown',
    email: 'david.brown@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024004',
    department: 'Mathematics',
    phone: '+1234567903',
    isActive: true
  },
  {
    name: 'Eva Davis',
    email: 'eva.davis@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024005',
    department: 'Physics',
    phone: '+1234567904',
    isActive: true
  },
  {
    name: 'Frank Wilson',
    email: 'frank.wilson@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024006',
    department: 'Physics',
    phone: '+1234567905',
    isActive: true
  },
  {
    name: 'Grace Miller',
    email: 'grace.miller@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024007',
    department: 'Chemistry',
    phone: '+1234567906',
    isActive: true
  },
  {
    name: 'Henry Garcia',
    email: 'henry.garcia@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024008',
    department: 'Chemistry',
    phone: '+1234567907',
    isActive: true
  },
  {
    name: 'Ivy Martinez',
    email: 'ivy.martinez@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024009',
    department: 'Biology',
    phone: '+1234567908',
    isActive: true
  },
  {
    name: 'Jack Anderson',
    email: 'jack.anderson@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024010',
    department: 'Biology',
    phone: '+1234567909',
    isActive: true
  },
  {
    name: 'Kate Taylor',
    email: 'kate.taylor@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024011',
    department: 'English',
    phone: '+1234567910',
    isActive: true
  },
  {
    name: 'Leo Thompson',
    email: 'leo.thompson@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024012',
    department: 'English',
    phone: '+1234567911',
    isActive: true
  },
  {
    name: 'Mia White',
    email: 'mia.white@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024013',
    department: 'History',
    phone: '+1234567912',
    isActive: true
  },
  {
    name: 'Noah Harris',
    email: 'noah.harris@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024014',
    department: 'History',
    phone: '+1234567913',
    isActive: true
  },
  {
    name: 'Olivia Clark',
    email: 'olivia.clark@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024015',
    department: 'Psychology',
    phone: '+1234567914',
    isActive: true
  },
  {
    name: 'Paul Lewis',
    email: 'paul.lewis@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024016',
    department: 'Psychology',
    phone: '+1234567915',
    isActive: true
  },
  {
    name: 'Quinn Walker',
    email: 'quinn.walker@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024017',
    department: 'Business',
    phone: '+1234567916',
    isActive: true
  },
  {
    name: 'Ruby Hall',
    email: 'ruby.hall@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024018',
    department: 'Business',
    phone: '+1234567917',
    isActive: true
  },
  {
    name: 'Sam Young',
    email: 'sam.young@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024019',
    department: 'Engineering',
    phone: '+1234567918',
    isActive: true
  },
  {
    name: 'Tina King',
    email: 'tina.king@student.college.edu',
    password: 'Student123!',
    role: 'student',
    studentId: '2024020',
    department: 'Engineering',
    phone: '+1234567919',
    isActive: true
  }
];

const seedStudents = async () => {
  try {
    // Check if students already exist
    const existingStudents = await User.countDocuments({ role: 'student' });
    
    if (existingStudents > 0) {
      Logger.info('Student users already exist, skipping student seeding');
      return;
    }

    // Create student users
    const students = await User.create(studentData);
    
    Logger.info(`Successfully seeded ${students.length} student users`);
    return students;
  } catch (error) {
    Logger.error('Error seeding student users:', error);
    throw error;
  }
};

module.exports = seedStudents;