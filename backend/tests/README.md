# Testing Guide

## Test Structure

```
tests/
├── unit/           # Unit tests for individual components
│   ├── models/     # Model tests
│   ├── services/   # Service tests
│   └── utils/      # Utility tests
├── integration/    # Integration tests for API endpoints
│   └── routes/     # Route tests
├── e2e/           # End-to-end workflow tests
├── fixtures/      # Test data
└── setup.js       # Test configuration
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test type
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

## Test Categories

### Unit Tests
- Test individual functions and methods
- Mock external dependencies
- Fast execution
- High code coverage

### Integration Tests
- Test API endpoints
- Test middleware integration
- Use test database
- Verify request/response flow

### End-to-End Tests
- Test complete user workflows
- Test multiple components together
- Simulate real user scenarios
- Verify business logic

## Writing Tests

### Test Structure
```javascript
describe('Component Name', () => {
  beforeAll(async () => {
    // Setup before all tests
  });

  afterAll(async () => {
    // Cleanup after all tests
  });

  beforeEach(async () => {
    // Setup before each test
  });

  afterEach(async () => {
    // Cleanup after each test
  });

  test('should do something', async () => {
    // Test implementation
  });
});
```

### Best Practices
- Use descriptive test names
- Test both success and error cases
- Keep tests isolated and independent
- Use fixtures for consistent test data
- Mock external services
- Assert on meaningful outcomes