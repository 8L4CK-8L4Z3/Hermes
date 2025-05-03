# Hermes API Testing CLI

A powerful command-line tool for testing the Hermes Trip Planning and Experience-Sharing Platform API. This CLI tool provides a comprehensive testing suite with an intuitive terminal interface.

## Features

- Complete test coverage for all major API endpoints
- Interactive terminal-based test runner
- Categorized test execution
- Detailed test results with colorized output
- Test coverage reporting
- **Real API Testing:** Tests run against your actual server

## Getting Started

1. Install dependencies:

```bash
yarn install
```

2. Start the server (required for tests):

```bash
# Open a terminal window and start the server
cd ../server && yarn dev
```

3. Run the CLI:

```bash
# Start the interactive CLI
yarn start

# Run all tests
yarn test

# Generate coverage report
yarn coverage
```

## CLI Options

```bash
# Start the interactive CLI
yarn start

# Run all tests
yarn start --all

# Run a specific test file
yarn start --test auth.test.js

# Run tests for a specific API group
yarn start --group auth
yarn start --group trips
yarn start --group experiences

# Run tests with coverage
yarn start --coverage

# Run tests in watch mode
yarn start --watch
```

## Important: Real API Testing

This test suite connects to your actual server to perform real API testing. Before running tests:

1. Ensure the server is running at http://localhost:3000
2. The MongoDB database should be properly set up and connected
3. Tests will create real data in your database

If the tests fail to connect to the server, you'll see an error message instructing you to start the server.

## ⚠️ Test Updates Required

**Note:** The tests are being converted from using MSW (Mock Service Worker) to making real HTTP requests to your server. Currently, you will see errors when running tests because:

1. We've configured the framework for real API testing
2. The test files still contain MSW mocking code

Please see `next-steps.md` for detailed instructions on how to update each test file for real API testing.

The first test file to fix is `auth.test.js` since it establishes the authentication flow for other tests.

## Test Categories

### Authentication Tests (`auth.test.js`)

- User registration
- User login
- Password reset
- Profile retrieval

### Admin Access Tests (`admin-access.test.js`)

- Admin authentication
- Dashboard API access
- User Management API access
- Content Approval API access
- System Management API access
- Analytics API access

> **Note:** The admin-access.test.js file demonstrates authentication with admin credentials, but shows that the admin account currently only has 'user' role, not 'admin'. This causes all admin API endpoints to return 403 Forbidden responses. To enable proper admin testing, the admin user needs to be assigned the 'admin' role in the database.

### Trip Tests (`trips.test.js`)

- Trip creation
- Trip retrieval
- Trip updates
- Itinerary management
- Visibility controls
- Trip deletion

### Experience Tests (`experiences.test.js`)

- Experience creation
- Experience retrieval
- Experience updates
- Media upload
- Trip-specific experiences
- Experience deletion

### Content Tests (`content.test.js`)

- Destinations management
- Activities management
- Comments management

### Admin Tests (`admin.test.js`)

- Dashboard statistics
- User management
- Approval workflows

### Analytics Tests (`analytics.test.js`)

- User analytics
- Content analytics
- Trip analytics
- Report management

### Notifications Tests (`notifications.test.js`)

- Notification sending
- Notification retrieval
- Notification preferences
- Notification templates

## Environment Configuration

The test suite uses the following environment variables from the backend:

- `PORT`: Backend server port (default: 3000)
- `JWT_SECRET`: JWT secret key for authentication
- Other environment variables as specified in the backend `.env` file

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
