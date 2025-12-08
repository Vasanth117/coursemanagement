const testUsers = {
  admin: {
    name: 'Test Admin',
    email: 'admin@test.com',
    password: 'Test123!',
    role: 'admin',
    employeeId: 'EMP0001',
    department: 'Administration',
    isActive: true
  },
  
  faculty: {
    name: 'Test Faculty',
    email: 'faculty@test.com',
    password: 'Test123!',
    role: 'faculty',
    employeeId: 'EMP1001',
    department: 'Computer Science',
    isActive: true
  },
  
  student: {
    name: 'Test Student',
    email: 'student@test.com',
    password: 'Test123!',
    role: 'student',
    studentId: '2024001',
    department: 'Computer Science',
    isActive: true
  }
};

const testCourse = {
  title: 'Test Course',
  code: 'TEST101',
  description: 'Test course description',
  credits: 3,
  department: 'Computer Science',
  maxStudents: 30,
  semester: 'Fall',
  year: 2024,
  isActive: true
};

module.exports = {
  testUsers,
  testCourse
};