import { beforeAll, afterEach, afterAll, vi } from 'vitest';

// Mock localStorage for Node environment
const localStorageMock = {
  store: {},
  getItem: vi.fn((key) => localStorageMock.store[key] || null),
  setItem: vi.fn((key, value) => {
    localStorageMock.store[key] = value.toString();
  }),
  removeItem: vi.fn((key) => {
    delete localStorageMock.store[key];
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {};
  }),
};

// Add localStorage to global object in Node environment
globalThis.localStorage = localStorageMock;

// Define base URL for tests - ensure this matches your actual server
export const BASE_URL = 'http://localhost:3000';

// Admin key for admin API access
export const ADMIN_KEY = 'your_admin_key_here';

// Mock token for authorization - you may want to get a real token from your auth endpoint
export const mockToken = 'test-jwt-token';

// Start tests
beforeAll(() => {
  // Set up any global test data
  localStorage.setItem('token', mockToken);
  console.log('Starting tests with REAL HTTP requests to server at', BASE_URL);
});

// Reset after each test
afterEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

// Clean up after all tests
afterAll(() => {
  console.log('Finished all tests');
}); 