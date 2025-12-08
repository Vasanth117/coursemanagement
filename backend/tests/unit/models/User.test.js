const { User } = require('../../../src/models');
const { setupTestDB, teardownTestDB, clearTestDB } = require('../../setup');
const { testUsers } = require('../../fixtures/users');

describe('User Model', () => {
  beforeAll(async () => {
    await setupTestDB();
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  beforeEach(async () => {
    await clearTestDB();
  });

  describe('User Creation', () => {
    test('should create a valid user', async () => {
      const user = new User(testUsers.student);
      const savedUser = await user.save();
      
      expect(savedUser._id).toBeDefined();
      expect(savedUser.email).toBe(testUsers.student.email);
      expect(savedUser.role).toBe('student');
    });

    test('should hash password before saving', async () => {
      const user = new User(testUsers.student);
      const savedUser = await user.save();
      
      expect(savedUser.password).not.toBe(testUsers.student.password);
      expect(savedUser.password).toMatch(/^\$2[ayb]\$.{56}$/);
    });

    test('should require email', async () => {
      const userData = { ...testUsers.student };
      delete userData.email;
      
      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    test('should require unique email', async () => {
      await User.create(testUsers.student);
      
      const duplicateUser = new User(testUsers.student);
      await expect(duplicateUser.save()).rejects.toThrow();
    });
  });

  describe('User Methods', () => {
    test('should match correct password', async () => {
      const user = await User.create(testUsers.student);
      const isMatch = await user.matchPassword('Test123!');
      
      expect(isMatch).toBe(true);
    });

    test('should not match incorrect password', async () => {
      const user = await User.create(testUsers.student);
      const isMatch = await user.matchPassword('wrongpassword');
      
      expect(isMatch).toBe(false);
    });

    test('should generate JWT token', async () => {
      const user = await User.create(testUsers.student);
      const token = user.getSignedJwtToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });
});