const request = require('supertest');
const app = require('../../../src/app');
const { User } = require('../../../src/models');
const { setupTestDB, teardownTestDB, clearTestDB } = require('../../setup');
const { testUsers } = require('../../fixtures/users');

describe('Auth Routes', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('POST /api/v1/auth/register', () => {
    test('should register a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(testUsers.student)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(testUsers.student.email);
    });

    test('should return 400 for invalid data', async () => {
      const invalidUser = { ...testUsers.student };
      delete invalidUser.email;

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    test('should login with valid credentials', async () => {
      await User.create(testUsers.student);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUsers.student.email,
          password: testUsers.student.password
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    test('should return 401 for invalid credentials', async () => {
      await User.create(testUsers.student);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUsers.student.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    test('should get current user with valid token', async () => {
      const user = await User.create(testUsers.student);
      const token = user.getSignedJwtToken();

      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(testUsers.student.email);
    });

    test('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });
});