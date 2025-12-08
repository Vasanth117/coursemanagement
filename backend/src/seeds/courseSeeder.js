const { Course, User } = require('../models');
const { Logger } = require('../utils');

const courseData = [
  // Computer Science Courses
  {
    title: 'Introduction to Programming',
    code: 'CS101',
    description: 'Basic programming concepts using Python. Covers variables, control structures, functions, and basic data structures.',
    credits: 3,
    department: 'Computer Science',
    maxStudents: 30,
    semester: 'Fall',
    year: 2024,
    schedule: {
      days: ['Monday', 'Wednesday', 'Friday'],
      startTime: '09:00',
      endTime: '10:00',
      room: 'CS-101'
    },
    isActive: true
  },
  {
    title: 'Data Structures and Algorithms',
    code: 'CS201',
    description: 'Advanced data structures and algorithm design. Covers arrays, linked lists, trees, graphs, and sorting algorithms.',
    credits: 4,
    department: 'Computer Science',
    maxStudents: 25,
    semester: 'Spring',
    year: 2024,
    schedule: {
      days: ['Tuesday', 'Thursday'],
      startTime: '10:30',
      endTime: '12:00',
      room: 'CS-102'
    },
    isActive: true
  },
  {
    title: 'Database Systems',
    code: 'CS301',
    description: 'Database design, SQL, normalization, and database management systems.',
    credits: 3,
    department: 'Computer Science',
    maxStudents: 20,
    semester: 'Fall',
    year: 2024,
    schedule: {
      days: ['Monday', 'Wednesday'],
      startTime: '14:00',
      endTime: '15:30',
      room: 'CS-103'
    },
    isActive: true
  },

  // Mathematics Courses
  {
    title: 'Calculus I',
    code: 'MATH101',
    description: 'Limits, derivatives, and applications of derivatives. Introduction to integration.',
    credits: 4,
    department: 'Mathematics',
    maxStudents: 35,
    semester: 'Fall',
    year: 2024,
    schedule: {
      days: ['Monday', 'Wednesday', 'Friday'],
      startTime: '08:00',
      endTime: '09:00',
      room: 'MATH-201'
    },
    isActive: true
  },
  {
    title: 'Linear Algebra',
    code: 'MATH201',
    description: 'Vector spaces, matrices, determinants, eigenvalues, and linear transformations.',
    credits: 3,
    department: 'Mathematics',
    maxStudents: 30,
    semester: 'Spring',
    year: 2024,
    schedule: {
      days: ['Tuesday', 'Thursday'],
      startTime: '11:00',
      endTime: '12:30',
      room: 'MATH-202'
    },
    isActive: true
  },

  // Physics Courses
  {
    title: 'General Physics I',
    code: 'PHYS101',
    description: 'Mechanics, waves, and thermodynamics. Laboratory component included.',
    credits: 4,
    department: 'Physics',
    maxStudents: 25,
    semester: 'Fall',
    year: 2024,
    schedule: {
      days: ['Monday', 'Wednesday', 'Friday'],
      startTime: '10:00',
      endTime: '11:00',
      room: 'PHYS-101'
    },
    isActive: true
  },
  {
    title: 'Quantum Physics',
    code: 'PHYS301',
    description: 'Introduction to quantum mechanics, wave functions, and quantum systems.',
    credits: 3,
    department: 'Physics',
    maxStudents: 20,
    semester: 'Spring',
    year: 2024,
    schedule: {
      days: ['Tuesday', 'Thursday'],
      startTime: '13:00',
      endTime: '14:30',
      room: 'PHYS-201'
    },
    isActive: true
  },

  // Chemistry Courses
  {
    title: 'General Chemistry I',
    code: 'CHEM101',
    description: 'Atomic structure, chemical bonding, stoichiometry, and chemical reactions.',
    credits: 4,
    department: 'Chemistry',
    maxStudents: 30,
    semester: 'Fall',
    year: 2024,
    schedule: {
      days: ['Monday', 'Wednesday', 'Friday'],
      startTime: '11:00',
      endTime: '12:00',
      room: 'CHEM-101'
    },
    isActive: true
  },
  {
    title: 'Organic Chemistry',
    code: 'CHEM201',
    description: 'Structure, properties, and reactions of organic compounds.',
    credits: 4,
    department: 'Chemistry',
    maxStudents: 25,
    semester: 'Spring',
    year: 2024,
    schedule: {
      days: ['Tuesday', 'Thursday'],
      startTime: '09:00',
      endTime: '10:30',
      room: 'CHEM-201'
    },
    isActive: true
  },

  // Biology Courses
  {
    title: 'Introduction to Biology',
    code: 'BIO101',
    description: 'Cell structure, genetics, evolution, and ecology. Laboratory component included.',
    credits: 4,
    department: 'Biology',
    maxStudents: 30,
    semester: 'Fall',
    year: 2024,
    schedule: {
      days: ['Monday', 'Wednesday', 'Friday'],
      startTime: '13:00',
      endTime: '14:00',
      room: 'BIO-101'
    },
    isActive: true
  },
  {
    title: 'Molecular Biology',
    code: 'BIO301',
    description: 'DNA, RNA, protein synthesis, and gene regulation.',
    credits: 3,
    department: 'Biology',
    maxStudents: 20,
    semester: 'Spring',
    year: 2024,
    schedule: {
      days: ['Tuesday', 'Thursday'],
      startTime: '15:00',
      endTime: '16:30',
      room: 'BIO-201'
    },
    isActive: true
  },

  // English Courses
  {
    title: 'English Composition',
    code: 'ENG101',
    description: 'Academic writing, research methods, and critical thinking skills.',
    credits: 3,
    department: 'English',
    maxStudents: 25,
    semester: 'Fall',
    year: 2024,
    schedule: {
      days: ['Monday', 'Wednesday', 'Friday'],
      startTime: '15:00',
      endTime: '16:00',
      room: 'ENG-101'
    },
    isActive: true
  },
  {
    title: 'American Literature',
    code: 'ENG201',
    description: 'Survey of American literature from colonial period to present.',
    credits: 3,
    department: 'English',
    maxStudents: 30,
    semester: 'Spring',
    year: 2024,
    schedule: {
      days: ['Tuesday', 'Thursday'],
      startTime: '16:30',
      endTime: '18:00',
      room: 'ENG-201'
    },
    isActive: true
  },

  // History Courses
  {
    title: 'World History',
    code: 'HIST101',
    description: 'Survey of world civilizations from ancient times to present.',
    credits: 3,
    department: 'History',
    maxStudents: 35,
    semester: 'Fall',
    year: 2024,
    schedule: {
      days: ['Monday', 'Wednesday', 'Friday'],
      startTime: '16:00',
      endTime: '17:00',
      room: 'HIST-101'
    },
    isActive: true
  },

  // Psychology Courses
  {
    title: 'Introduction to Psychology',
    code: 'PSYC101',
    description: 'Basic principles of psychology, behavior, and mental processes.',
    credits: 3,
    department: 'Psychology',
    maxStudents: 40,
    semester: 'Fall',
    year: 2024,
    schedule: {
      days: ['Tuesday', 'Thursday'],
      startTime: '08:00',
      endTime: '09:30',
      room: 'PSYC-101'
    },
    isActive: true
  }
];

const seedCourses = async () => {
  try {
    // Check if courses already exist
    const existingCourses = await Course.countDocuments();
    
    if (existingCourses > 0) {
      Logger.info('Courses already exist, skipping course seeding');
      return;
    }

    // Get faculty members to assign to courses
    const facultyMembers = await User.find({ role: 'faculty' });
    
    if (facultyMembers.length === 0) {
      Logger.warn('No faculty members found. Please seed faculty first.');
      return;
    }

    // Assign faculty to courses based on department
    const coursesWithFaculty = courseData.map(course => {
      const facultyMember = facultyMembers.find(f => f.department === course.department);
      
      if (facultyMember) {
        return {
          ...course,
          faculty: facultyMember._id,
          createdBy: facultyMember._id
        };
      } else {
        // Assign to first available faculty if no department match
        return {
          ...course,
          faculty: facultyMembers[0]._id,
          createdBy: facultyMembers[0]._id
        };
      }
    });

    // Create courses
    const courses = await Course.create(coursesWithFaculty);
    
    Logger.info(`Successfully seeded ${courses.length} courses`);
    return courses;
  } catch (error) {
    Logger.error('Error seeding courses:', error);
    throw error;
  }
};

module.exports = seedCourses;