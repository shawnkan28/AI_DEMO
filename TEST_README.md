# Playwright API Testing Guide

## Overview
This directory contains comprehensive Playwright test cases for the My Library REST API. The tests cover all CRUD operations, validation scenarios, and edge cases.

## Prerequisites

1. **Node.js**: Version 16 or higher
2. **npm**: Comes with Node.js
3. **Flask API**: Must be running on `http://localhost:5000`

## Installation

### Step 1: Install Node.js Dependencies

```powershell
npm install
```

This will install:
- `@playwright/test` - Playwright testing framework

### Step 2: Install Playwright Browsers (Optional)
If you plan to run browser-based tests in the future:

```powershell
npx playwright install
```

## Running Tests

### Before Running Tests
**IMPORTANT**: Make sure your Flask API is running!

```powershell
# In a separate terminal
python app.py
```

The API must be accessible at `http://localhost:5000` before running tests.

### Run All Tests

```powershell
npm test
```

Or directly with Playwright:

```powershell
npx playwright test
```

### Run Tests in UI Mode (Interactive)

```powershell
npm run test:ui
```

This opens an interactive UI where you can:
- Run individual tests
- See test execution in real-time
- Debug failing tests
- View test history

### Run Tests in Debug Mode

```powershell
npm run test:debug
```

### Run Specific Test File

```powershell
npx playwright test tests/test_api.spec.js
```

### Run Specific Test Suite

```powershell
npx playwright test --grep "GET /api/shows"
```

### View Test Report

After tests run, view the HTML report:

```powershell
npm run test:report
```

Or:

```powershell
npx playwright show-report
```

## Test Structure

### Test Organization

```
tests/
└── test_api.spec.js          # Main API test suite
    ├── GET /api/shows         # Test getting all shows with filters
    ├── POST /api/shows        # Test creating shows with validation
    ├── GET /api/shows/:id     # Test getting single show
    ├── PUT /api/shows/:id     # Test updating shows
    ├── DELETE /api/shows/:id  # Test deleting shows
    ├── Data Validation        # Edge cases and validation tests
    └── Response Structure     # Verify response formats
```

## Test Coverage

### ✅ GET /api/shows - Get All TV Shows
- Get all shows
- Filter by title (partial match)
- Filter by status (ended/in_progress)
- Combine multiple filters
- Verify array response

### ✅ POST /api/shows - Create TV Show
- Create valid TV show
- Reject missing title
- Reject missing cover_image_url
- Reject non-HTTPS URLs
- Reject invalid IMDB titles
- Reject duplicate titles
- Handle both true/false for is_ended

### ✅ GET /api/shows/:id - Get Single Show
- Get show by valid ID
- Return 404 for non-existent show
- Verify response structure

### ✅ PUT /api/shows/:id - Update TV Show
- Update show successfully
- Reject missing fields
- Reject invalid URLs
- Return 404 for non-existent show
- Verify IMDB validation on title change

### ✅ DELETE /api/shows/:id - Delete TV Show
- Delete show successfully
- Return 404 for non-existent show
- Verify show is actually deleted

### ✅ Data Validation & Edge Cases
- Empty title
- Whitespace-only title
- Malformed URLs
- Case-insensitive duplicate detection
- Response structure validation
- Error message format

## Configuration

### playwright.config.js

Key settings:
- **Test Directory**: `./tests`
- **Timeout**: 30 seconds per test
- **Parallel Execution**: Disabled (sequential tests)
- **Base URL**: `http://localhost:5000`
- **Reporters**: HTML and List

### Customizing Tests

To modify the API base URL, edit `test_api.spec.js`:

```javascript
const API_BASE_URL = 'http://your-server:port/api';
```

## Continuous Integration (CI)

### GitHub Actions Example

Create `.github/workflows/test.yml`:

```yaml
name: API Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install Python dependencies
        run: |
          pip install -r requirements.txt
      
      - name: Initialize database
        run: python init_db.py
      
      - name: Start Flask server
        run: python app.py &
        
      - name: Wait for server
        run: sleep 5
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install test dependencies
        run: npm install
      
      - name: Run Playwright tests
        run: npm test
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests Fail with "Connection Refused"
**Solution**: Make sure Flask server is running:
```powershell
python app.py
```

### Tests Fail Due to Existing Data
**Solution**: Tests may fail if shows already exist with the same titles. You can:
1. Use a fresh database for testing
2. Clear the database before running tests
3. Modify test data to use unique titles

### Port 5000 Already in Use
**Solution**: 
1. Stop other services using port 5000
2. Or change the Flask port in `app.py`:
   ```python
   app.run(debug=True, port=5001)
   ```
   And update `API_BASE_URL` in tests

### Timeout Errors
**Solution**: Increase timeout in `playwright.config.js`:
```javascript
timeout: 60 * 1000, // 60 seconds
```

## Best Practices

1. **Always run tests against a test database**, not production
2. **Run tests sequentially** for API tests to avoid data conflicts
3. **Clean up test data** after tests complete
4. **Use meaningful test descriptions**
5. **Group related tests** in describe blocks
6. **Test both success and failure scenarios**

## Test Data Management

### Creating Test Data

Tests automatically create and clean up their own data. However, you can also:

```javascript
// In your test file
test.beforeAll(async ({ request }) => {
  // Create test data
});

test.afterAll(async ({ request }) => {
  // Clean up test data
});
```

### Using a Separate Test Database

Modify `app.py` to use different database for testing:

```python
import os

DATABASE = os.getenv('TEST_DB', 'library.db')
```

Then run tests with:
```powershell
$env:TEST_DB="test_library.db"; npm test
```

## Advanced Usage

### Custom Assertions

Add custom assertions in tests:

```javascript
test('custom assertion', async ({ request }) => {
  const response = await request.get(`${API_BASE_URL}/shows`);
  const shows = await response.json();
  
  // Custom validation
  expect(shows.every(s => s.title.length > 0)).toBeTruthy();
});
```

### Performance Testing

Add timing checks:

```javascript
test('response time should be under 1 second', async ({ request }) => {
  const start = Date.now();
  await request.get(`${API_BASE_URL}/shows`);
  const duration = Date.now() - start;
  
  expect(duration).toBeLessThan(1000);
});
```

## Resources

- [Playwright Documentation](https://playwright.dev)
- [Playwright API Testing](https://playwright.dev/docs/api-testing)
- [REST API Testing Best Practices](https://playwright.dev/docs/best-practices)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review Playwright documentation
3. Check the API documentation in `API_DOCUMENTATION.md`
