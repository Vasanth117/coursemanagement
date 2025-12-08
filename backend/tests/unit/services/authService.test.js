const { authService } = require('../../../src/services');
const { User } = require('../../../src/models');
const { setupTestDB, teardownTestDB, clearTestDB } = require('../../setup');
const { testUsers } = require('../../fixtures/users');

describe('Auth Service', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('register', () => {
    test('should register a new user', async () => {
      const result = await authService.register(testUsers.student);
      
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(testUsers.student.email);
    });

    test('should throw error for duplicate email', async () => {
      await User.create(testUsers.student);
      
      await expect(authService.register(testUsers.student))
        .rejects.toThrow('User already exists');
    });
  });

  describe('login', () => {
    test('should login with valid credentials', async () => {
      await User.create(testUsers.student);
      
      const result = await authService.login(
        testUsers.student.email,
        testUsers.student.password
      );
      
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
    });

    test('should throw error for invalid credentials', async () => {
      await User.create(testUsers.student);
      
      await expect(authService.login(
        testUsers.student.email,
        'wrongpassword'
      )).rejects.toThrow('Invalid credentials');
    });
  });

  describe('verifyRole', () => {
    test('should verify valid role', () => {
      const user = { role: 'admin' };
      const result = authService.verifyRole(user, ['admin', 'faculty']);
      
      expect(result).toBe(true);
    });

    test('should throw error for invalid role', () => {
      const user = { role: 'student' };
      
      expect(() => authService.verifyRole(user, ['admin', 'faculty']))
        .toThrow('Access denied');
    });
  });
});