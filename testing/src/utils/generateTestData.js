/**
 * Helper functions to generate test data that matches the server's expected fields
 */

export const generateTestData = {
  /**
   * Generate test user data
   * @returns {Object} Test user data including username, email, password, name
   */
  user: () => {
    const timestamp = Date.now();
    const username = `testuser${timestamp}`;
    return {
      username: username,
      email: `test${timestamp}@example.com`,
      password: 'Password123!',
      name: 'Test User'
    };
  },

  /**
   * Generate test trip data
   * @returns {Object} Test trip data
   */
  trip: () => ({
    title: `Test Trip ${Date.now()}`,
    destination: 'Test Destination',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isPublic: true,
    description: 'This is a test trip created by the API testing tool'
  }),

  /**
   * Generate test experience data
   * @returns {Object} Test experience data
   */
  experience: () => ({
    title: `Test Experience ${Date.now()}`,
    location: 'Test Location',
    description: 'This is a test experience created by the API testing tool',
    date: new Date().toISOString().split('T')[0],
    rating: 5
  }),

  /**
   * Generate test comment data
   * @returns {Object} Test comment data
   */
  comment: () => ({
    content: `Test comment ${Date.now()}`,
    rating: 4
  }),

  /**
   * Generate test destination data
   * @returns {Object} Test destination data
   */
  destination: () => ({
    name: `Test Destination ${Date.now()}`,
    location: 'Test Location',
    description: 'This is a test destination created by the API testing tool',
    images: ['https://example.com/image.jpg']
  }),

  /**
   * Generate test activity data
   * @returns {Object} Test activity data
   */
  activity: () => ({
    name: `Test Activity ${Date.now()}`,
    description: 'This is a test activity created by the API testing tool',
    location: 'Test Location',
    duration: 60,
    price: 100
  })
};

export default generateTestData; 