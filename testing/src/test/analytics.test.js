import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { BASE_URL } from './setup';
import axios from 'axios';
import { createAuthenticatedApi, createApi, generateTestData } from './utils';

describe('Analytics & Reporting API', () => {
  // Generate a unique test user for this test run
  const testUser = generateTestData.user();
  let userToken = null;
  
  // Create fresh API clients
  const api = createApi();
  let authApi = null;

  beforeAll(async () => {
    try {
      // Register a test user
      const registerResponse = await api.post('/auth/register', testUser);
      expect(registerResponse.status).toBe(201);
      
      // Login to get a token
      const loginResponse = await api.post('/auth/login', {
        email: testUser.email,
        password: testUser.password
      });
      
      userToken = loginResponse.data.token;
      
      // Create authenticated API instance
      authApi = axios.create({
        baseURL: `${BASE_URL}/api`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
    } catch (error) {
      console.error('Setup failed:', error.response?.data || error.message);
      throw error;
    }
  });

});