#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TEST_DIR = path.resolve(__dirname, '../test');
const TEMPLATE_HEADER = `import { describe, it, expect, beforeEach, beforeAll } from 'vitest';
import { BASE_URL } from './setup';
import axios from 'axios';
import { createAuthenticatedApi, createApi, generateTestData } from './utils';

`;

const TEMPLATE_BEFORE_ALL = `  // Generate a unique test user for this test run
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
        baseURL: \`\${BASE_URL}/api\`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${userToken}\`
        }
      });
    } catch (error) {
      console.error('Setup failed:', error.response?.data || error.message);
      throw error;
    }
  });

`;

// Function to convert a test file from MSW to real API
async function convertTestFile(filename) {
  if (!filename.endsWith('.test.js') && !filename.endsWith('.spec.js')) {
    return;
  }
  
  // Skip already converted files
  if (filename === 'auth.test.js') {
    console.log(`Skipping already converted file: ${filename}`);
    return;
  }
  
  const filePath = path.join(TEST_DIR, filename);
  const content = await fs.readFile(filePath, 'utf8');
  
  // Check if file uses MSW
  if (!content.includes('msw') && !content.includes('server.use')) {
    console.log(`Skipping file that doesn't use MSW: ${filename}`);
    return;
  }
  
  console.log(`Converting ${filename} to use real HTTP requests...`);
  
  // Extract the describe block name
  const describeMatch = content.match(/describe\(['"](.+?)['"]/);
  if (!describeMatch) {
    console.log(`Could not find describe block in ${filename}`);
    return;
  }
  const apiName = describeMatch[1];
  
  // Get all test names
  const testMatches = content.match(/it\(['"](.+?)['"]/g);
  if (!testMatches) {
    console.log(`No tests found in ${filename}`);
    return;
  }
  
  // Create new file content
  let newContent = TEMPLATE_HEADER;
  newContent += `describe('${apiName}', () => {\n`;
  newContent += TEMPLATE_BEFORE_ALL;
  
  // Add test templates
  for (const testMatch of testMatches) {
    const testNameMatch = testMatch.match(/it\(['"](.+?)['"]/);
    if (!testNameMatch) continue;
    
    const testName = testNameMatch[1];
    const endpoint = testName.split('>')[0].trim();
    const action = testName.split('>')[1]?.trim() || 'perform an action';
    
    // Skip if we can't parse the endpoint
    if (!endpoint.startsWith('/')) {
      console.log(`Skipping test with unknown endpoint: ${testName}`);
      continue;
    }
    
    // Determine HTTP method from test name
    let method = 'get';
    if (testName.includes('create') || testName.includes('POST')) method = 'post';
    if (testName.includes('update') || testName.includes('PUT')) method = 'put';
    if (testName.includes('delete') || testName.includes('DELETE')) method = 'delete';
    
    // Build test template
    newContent += `  it('${testName}', async () => {\n`;
    newContent += `    try {\n`;
    
    // Add test-specific code based on method
    if (method === 'post' || method === 'put') {
      newContent += `      const payload = {\n`;
      newContent += `        // Add appropriate fields for this endpoint\n`;
      newContent += `        field1: 'value1',\n`;
      newContent += `        field2: 'value2'\n`;
      newContent += `      };\n\n`;
      newContent += `      const response = await authApi.${method}('${endpoint}', payload);\n`;
    } else {
      newContent += `      const response = await authApi.${method}('${endpoint}');\n`;
    }
    
    newContent += `      \n`;
    newContent += `      expect(response.status).toBe(${method === 'post' ? '201' : '200'});\n`;
    newContent += `      expect(response.data).toBeDefined();\n`;
    newContent += `      \n`;
    newContent += `      console.log('${action} successfully:', response.data);\n`;
    newContent += `    } catch (error) {\n`;
    newContent += `      console.error('Failed to ${action.toLowerCase()}:', error.response?.data || error.message);\n`;
    newContent += `      throw error;\n`;
    newContent += `    }\n`;
    newContent += `  });\n\n`;
  }
  
  newContent += '});';
  
  // Write the new file
  const backupPath = `${filePath}.bak`;
  await fs.writeFile(backupPath, content);
  await fs.writeFile(filePath, newContent);
  console.log(`Converted ${filename} (backup saved as ${path.basename(backupPath)})`);
}

// Main function
async function main() {
  try {
    // Get all test files
    const files = await fs.readdir(TEST_DIR);
    
    // Convert each file
    for (const file of files) {
      await convertTestFile(file);
    }
    
    console.log('All test files have been processed');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main(); 