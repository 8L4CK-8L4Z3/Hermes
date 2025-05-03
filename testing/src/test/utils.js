import axios from 'axios';
import { mockToken, BASE_URL, ADMIN_KEY } from './setup';
import { generateTestData } from '../utils/generateTestData.js';

// Create an authenticated API instance with token
export const createAuthenticatedApi = () => {
  const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token') || mockToken}`
    }
  });
  
  return api;
};

// Create a regular API instance
export const createApi = () => {
  return axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

// Create an authenticated API instance for admin operations
export const createAdminApi = (token) => {
  const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || localStorage.getItem('token') || mockToken}`,
      'admin-key': ADMIN_KEY
    }
  });
  
  return api;
};

// Helper to validate common response structures
export const validateResponse = (response, type) => {
  switch (type) {
    case 'auth':
      expect(response).toHaveProperty('token');
      expect(response).toHaveProperty('user');
      break;
    case 'trip':
      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('title');
      expect(response).toHaveProperty('destination');
      break;
    case 'experience':
      expect(response).toHaveProperty('id');
      expect(response).toHaveProperty('title');
      expect(response).toHaveProperty('location');
      break;
    default:
      throw new Error(`Unknown response type: ${type}`);
  }
};

export { generateTestData }; 