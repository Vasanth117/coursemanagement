const request = require('supertest');
const app = require('../../src/app');
const { User, Course, Enrollment } = require('../../src/models');
const { setupTestDB, teardownTestDB, clearTestDB } = require('../setup');
const { testUsers, testCourse } = require('../fixtures/users');

describe('Course Enrollment E2E', () => {
  let adminToken, facultyToken, studentToken;
  let faculty, student, course;

  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();

    // Create users
    const admin = await User.create(testUsers.admin);
    faculty = await User.create(testUsers.faculty);
    student = await User.create(testUsers.student);

    // Generate tokens
    adminToken = admin.getSignedJwtToken();
    facultyToken = faculty.getSignedJwtToken();
    studentToken = student.getSignedJwtToken();

    // Create course
    course = await Course.create({
      ...testCourse,
      faculty: faculty._id,
      createdBy: admin._id
    });
  });

  test('Complete enrollment workflow', async () => {
    // 1. Student requests enrollment
    const enrollmentResponse = await request(app)
      .post('/api/v1/enrollments')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        student: student._id,
        course: course._id,
        status: 'pending'
      })
      .expect(201);

    expect(enrollmentResponse.body.success).toBe(true);
    const enrollmentId = enrollmentResponse.body.data._id;

    // 2. Faculty approves enrollment
    const approvalResponse = await request(app)
      .put(`/api/v1/enrollments/${enrollmentId}/approve`)
      .set('Authorization', `Bearer ${facultyToken}`)
      .expect(200);

    expect(approvalResponse.body.success).toBe(true);
    expect(approvalResponse.body.data.status).toBe('enrolled');

    // 3. Verify student can access course
    const studentCoursesResponse = await request(app)
      .get(`/api/v1/enrollments/student/${student._id}`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(studentCoursesResponse.body.success).toBe(true);
    expect(studentCoursesResponse.body.data.enrollments).toHaveLength(1);
    expect(studentCoursesResponse.body.data.enrollments[0].status).toBe('enrolled');

    // 4. Faculty can see enrolled students
    const courseEnrollmentsResponse = await request(app)
      .get(`/api/v1/enrollments/course/${course._id}`)
      .set('Authorization', `Bearer ${facultyToken}`)
      .expect(200);

    expect(courseEnrollmentsResponse.body.success).toBe(true);
    expect(courseEnrollmentsResponse.body.data.enrollments).toHaveLength(1);
  });

  test('Enrollment rejection workflow', async () => {
    // Create pending enrollment
    const enrollment = await Enrollment.create({
      student: student._id,
      course: course._id,
      status: 'pending',
      enrolledBy: student._id
    });

    // Faculty rejects enrollment
    const rejectionResponse = await request(app)
      .put(`/api/v1/enrollments/${enrollment._id}/reject`)
      .set('Authorization', `Bearer ${facultyToken}`)
      .send({ reason: 'Prerequisites not met' })
      .expect(200);

    expect(rejectionResponse.body.success).toBe(true);
    expect(rejectionResponse.body.data.status).toBe('rejected');
    expect(rejectionResponse.body.data.rejectionReason).toBe('Prerequisites not met');
  });
});