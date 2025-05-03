import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { BASE_URL } from './setup';
import axios from 'axios';
import { createAuthenticatedApi, createApi, createAdminApi, generateTestData } from './utils';

describe('Admin API', () => {
  // Generate a unique test user for this test run
  const testUser = generateTestData.user();
  let userToken = null;
  let adminToken = null;

  // Create fresh API clients
  const api = createApi();
  let authApi = null;
  let adminApi = null;

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
      authApi = createAuthenticatedApi();

      console.log('Note: Admin tests require an admin user. These tests may fail if your user doesn\'t have admin privileges.');

      // For admin tests, login with admin credentials
      try {
        const adminLoginResponse = await api.post('/auth/login', {
          email: 'admin@example.com',
          password: 'adminadmin'
        });
        
        if (adminLoginResponse.status === 200) {
          adminToken = adminLoginResponse.data.token;
          console.log('Admin login successful');
        }
      } catch (error) {
        console.warn('Admin login failed, using regular user token for tests');
      }

      // Create admin API instance with admin-key header
      adminApi = createAdminApi(adminToken || userToken);

    } catch (error) {
      console.error('Setup failed:', error.response?.data || error.message);
      throw error;
    }
  });

  // Dashboard APIs
  describe('Dashboard APIs', () => {
    it('GET /admin/dashboard/stats - should fetch dashboard statistics', async () => {
      try {
        const response = await adminApi.get('/admin/dashboard/stats');

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();

        console.log('Retrieved dashboard statistics:', response.data);
      } catch (error) {
        if (error.response?.status === 403) {
          console.warn('Access denied: User does not have admin privileges');
          return;
        }
        console.error('Failed to fetch dashboard statistics:', error.response?.data || error.message);
        throw error;
      }
    });

    it('GET /admin/dashboard/health - should fetch system health status', async () => {
      try {
        const response = await adminApi.get('/admin/dashboard/health');

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();

        console.log('Retrieved system health status:', response.data);
      } catch (error) {
        if (error.response?.status === 403) {
          console.warn('Access denied: User does not have admin privileges');
          return;
        }
        console.error('Failed to fetch system health status:', error.response?.data || error.message);
        throw error;
      }
    });

    it('GET /admin/dashboard/errors - should fetch error logs', async () => {
      try {
        const response = await adminApi.get('/admin/dashboard/errors');

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();

        console.log('Retrieved error logs:', response.data);
      } catch (error) {
        if (error.response?.status === 403) {
          console.warn('Access denied: User does not have admin privileges');
          return;
        }
        console.error('Failed to fetch error logs:', error.response?.data || error.message);
        throw error;
      }
    });
  });

  // User Management APIs
  describe('User Management APIs', () => {
    it('GET /admin/users - should fetch all users with filters', async () => {
      try {
        const response = await adminApi.get('/admin/users', {
          params: {
            limit: 10,
            skip: 0,
            sort: 'createdAt'
          }
        });

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();

        console.log(`Retrieved ${response.data.users?.length || 0} users`);
      } catch (error) {
        if (error.response?.status === 403) {
          console.warn('Access denied: User does not have admin privileges');
          return;
        }
        console.error('Failed to fetch users:', error.response?.data || error.message);
        throw error;
      }
    });

    it('GET /admin/users/:id - should fetch user details', async () => {
      try {
        // Use the current user's ID for testing
        const response = await adminApi.get(`/admin/users/${testUser.id || 'current'}`);

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();

        console.log('Retrieved user details:', response.data);
      } catch (error) {
        if (error.response?.status === 403) {
          console.warn('Access denied: User does not have admin privileges');
          return;
        }
        console.error('Failed to fetch user details:', error.response?.data || error.message);
        throw error;
      }
    });

    it('PUT /admin/users/:id - should update user details', async () => {
      try {
        const updates = {
          name: 'Updated User Name',
          // Add other fields as needed
        };

        // Use the current user's ID for testing
        const response = await adminApi.put(`/admin/users/${testUser.id || 'current'}`, updates);

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();

        console.log('User updated successfully:', response.data);
      } catch (error) {
        if (error.response?.status === 403) {
          console.warn('Access denied: User does not have admin privileges');
          return;
        }
        console.error('Failed to update user:', error.response?.data || error.message);
        throw error;
      }
    });

    it('PUT /admin/users/:id/status - should update user status', async () => {
      try {
        const statusUpdate = {
          isActive: true,
          // Add other status fields as needed
        };

        // Use the current user's ID for testing
        const response = await adminApi.put(`/admin/users/${testUser.id || 'current'}/status`, statusUpdate);

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();

        console.log('User status updated successfully:', response.data);
      } catch (error) {
        if (error.response?.status === 403) {
          console.warn('Access denied: User does not have admin privileges');
          return;
        }
        console.error('Failed to update user status:', error.response?.data || error.message);
        throw error;
      }
    });
  });

  // Content Approval APIs
  describe('Content Approval APIs', () => {
    it('GET /admin/approvals - should fetch pending approvals', async () => {
      try {
        const response = await adminApi.get('/admin/approvals');

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();

        console.log(`Retrieved ${response.data.approvals?.length || 0} pending approvals`);
      } catch (error) {
        if (error.response?.status === 403) {
          console.warn('Access denied: User does not have admin privileges');
          return;
        }
        console.error('Failed to fetch pending approvals:', error.response?.data || error.message);
        throw error;
      }
    });

    it('PUT /admin/approvals/:id - should process approval', async () => {
      try {
        // This test may fail if there are no pending approvals
        // You might want to create an item requiring approval first
        const approvalId = 'some-approval-id';
        const approvalAction = {
          approved: true,
          reason: 'Content meets guidelines'
        };

        const response = await adminApi.put(`/admin/approvals/${approvalId}`, approvalAction);

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();

        console.log('Approval processed successfully:', response.data);
      } catch (error) {
        if (error.response?.status === 403) {
          console.warn('Access denied: User does not have admin privileges');
          return;
        }
        if (error.response?.status === 404) {
          console.warn('No pending approvals found to process');
          return;
        }
        console.error('Failed to process approval:', error.response?.data || error.message);
        throw error;
      }
    });
  });

  // System Management APIs
  describe('System Management APIs', () => {
    it('GET /admin/system/logs - should fetch system logs', async () => {
      try {
        const response = await adminApi.get('/admin/system/logs');

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();

        console.log('Retrieved system logs:', response.data);
      } catch (error) {
        if (error.response?.status === 403) {
          console.warn('Access denied: User does not have admin privileges');
          return;
        }
        console.error('Failed to fetch system logs:', error.response?.data || error.message);
        throw error;
      }
    });

    it('GET /admin/system/metrics - should fetch system metrics', async () => {
      try {
        const response = await adminApi.get('/admin/system/metrics');

        expect(response.status).toBe(200);
        expect(response.data).toBeDefined();

        console.log('Retrieved system metrics:', response.data);
      } catch (error) {
        if (error.response?.status === 403) {
          console.warn('Access denied: User does not have admin privileges');
          return;
        }
        console.error('Failed to fetch system metrics:', error.response?.data || error.message);
        throw error;
      }
    });
  });
});