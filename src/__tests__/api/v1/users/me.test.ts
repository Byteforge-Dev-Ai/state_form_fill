import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { resetSupabaseMocks } from '../../../mocks/supabase';
import { GET, PUT } from '@/app/api/v1/users/me/route';
import { NextRequest } from 'next/server';
import { createMockNextRequest, parseNextResponseJson } from '../../../helpers/testUtils';

// Mock createUserService
jest.mock('@/lib/factories/serviceFactory', () => ({
  createUserService: jest.fn().mockReturnValue({
    getUserByEmail: jest.fn(),
    updateUser: jest.fn()
  })
}));

// Mock Supabase
jest.mock('@/lib/supabase/client', () => {
  return {
    supabaseClient: {
      auth: {
        getUser: jest.fn(),
      },
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      update: jest.fn().mockReturnThis(),
      match: jest.fn().mockReturnThis(),
    },
  };
});

describe('GET /api/v1/users/me', () => {
  // Reset mocks before each test
  beforeEach(() => {
    resetSupabaseMocks();
    jest.clearAllMocks();
    
    // Get references to mocked functions
    const { createUserService } = require('@/lib/factories/serviceFactory');
    const mockUserService = createUserService();
    
    // Reset the mocked user service methods
    mockUserService.getUserByEmail.mockReset();
    mockUserService.updateUser.mockReset();
  });
  
  it('should return 401 if authorization header is missing', async () => {
    // Create request without authorization header
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/users/me');
    
    // Call the handler
    const response = await GET(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(401);
    expect(data.status).toBe(401);
    expect(data.code).toBe('UNAUTHORIZED');
  });
  
  it('should return 401 if token is invalid', async () => {
    // Setup Supabase mock to return an error
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid token' }
    });
    
    // Create request with invalid token
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/users/me', null, {
      authorization: 'Bearer invalid-token'
    });
    
    // Call the handler
    const response = await GET(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(401);
    expect(data.status).toBe(401);
    expect(data.code).toBe('INVALID_TOKEN');
    
    // Verify that Supabase getUser was called with correct token
    expect(supabaseClient.auth.getUser).toHaveBeenCalledWith('invalid-token');
  });
  
  it('should return 404 if user is not found in database', async () => {
    // Setup Supabase auth mock to return valid user
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { 
        user: { 
          id: 'auth-user-123',
          email: 'test@example.com'
        } 
      },
      error: null
    });
    
    // Setup user service mock to return null (user not found)
    const { createUserService } = require('@/lib/factories/serviceFactory');
    const mockUserService = createUserService();
    mockUserService.getUserByEmail.mockResolvedValueOnce(null);
    
    // Create request with valid token
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/users/me', null, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler
    const response = await GET(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(404);
    expect(data.status).toBe(404);
    expect(data.code).toBe('USER_NOT_FOUND');
    
    // Verify that getUserByEmail was called with the correct email
    expect(mockUserService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
  });
  
  it('should return 200 with user profile on success', async () => {
    // Setup Supabase auth mock to return valid user
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { 
        user: { 
          id: 'auth-user-123',
          email: 'test@example.com'
        } 
      },
      error: null
    });
    
    // Setup user service mock to return a user
    const { createUserService } = require('@/lib/factories/serviceFactory');
    const mockUserService = createUserService();
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      company_name: 'Test Company',
      role: 'vendor',
      auth_provider: 'email',
      created_at: '2024-01-01T00:00:00Z',
      last_login: '2024-01-01T12:00:00Z',
      subscription_status: 'active',
      subscription_expiry: '2025-01-01T00:00:00Z'
    };
    mockUserService.getUserByEmail.mockResolvedValueOnce(mockUser);
    
    // Create request with valid token
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/users/me', null, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler
    const response = await GET(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(data).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      company_name: 'Test Company',
      role: 'vendor',
      auth_provider: 'email',
      created_at: '2024-01-01T00:00:00Z',
      last_login: '2024-01-01T12:00:00Z',
      subscription_status: 'active',
      subscription_expiry: '2025-01-01T00:00:00Z'
    });
  });
  
  it('should handle unexpected errors', async () => {
    // Setup Supabase mock to throw an error
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.getUser.mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });
    
    // Create request with valid token
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/users/me', null, {
      authorization: 'Bearer valid-token'
    });
    
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Call the handler
    const response = await GET(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(500);
    expect(data.status).toBe(500);
    expect(data.code).toBe('SERVER_ERROR');
    
    // Verify that error was logged
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
});

describe('PUT /api/v1/users/me', () => {
  // Reset mocks before each test
  beforeEach(() => {
    resetSupabaseMocks();
    jest.clearAllMocks();
    
    // Get references to mocked functions
    const { createUserService } = require('@/lib/factories/serviceFactory');
    const mockUserService = createUserService();
    
    // Reset the mocked user service methods
    mockUserService.getUserByEmail.mockReset();
    mockUserService.updateUser.mockReset();
  });
  
  it('should return 401 if authorization header is missing', async () => {
    // Create request without authorization header
    const request = createMockNextRequest('PUT', 'http://localhost:3000/api/v1/users/me', {
      company_name: 'Updated Company Name'
    });
    
    // Call the handler
    const response = await PUT(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(401);
    expect(data.status).toBe(401);
    expect(data.code).toBe('UNAUTHORIZED');
  });
  
  it('should return 400 if input data is invalid', async () => {
    // Setup Supabase auth mock to return valid user
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { 
        user: { 
          id: 'auth-user-123',
          email: 'test@example.com'
        } 
      },
      error: null
    });
    
    // Create request with invalid email
    const request = createMockNextRequest('PUT', 'http://localhost:3000/api/v1/users/me', {
      email: 'invalid-email'
    }, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler
    const response = await PUT(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(400);
    expect(data.status).toBe(400);
    expect(data.code).toBe('INVALID_INPUT');
    expect(data.details.email).toBeDefined();
  });
  
  it('should return 404 if user is not found in database', async () => {
    // Setup Supabase auth mock to return valid user
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { 
        user: { 
          id: 'auth-user-123',
          email: 'test@example.com'
        } 
      },
      error: null
    });
    
    // Setup user service mock to return null (user not found)
    const { createUserService } = require('@/lib/factories/serviceFactory');
    const mockUserService = createUserService();
    mockUserService.getUserByEmail.mockResolvedValueOnce(null);
    
    // Create request with valid token
    const request = createMockNextRequest('PUT', 'http://localhost:3000/api/v1/users/me', {
      company_name: 'Updated Company Name'
    }, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler
    const response = await PUT(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(404);
    expect(data.status).toBe(404);
    expect(data.code).toBe('USER_NOT_FOUND');
  });
  
  it('should return 200 with updated user profile on success', async () => {
    // Mock current date for consistent testing
    const mockDate = new Date('2024-01-02T00:00:00Z');
    const origDate = global.Date;
    global.Date = jest.fn(() => mockDate) as any;
    global.Date.UTC = origDate.UTC;
    global.Date.parse = origDate.parse;
    global.Date.now = origDate.now;
    
    // Setup Supabase auth mock to return valid user
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { 
        user: { 
          id: 'auth-user-123',
          email: 'test@example.com'
        } 
      },
      error: null
    });
    
    // Setup user service mocks
    const { createUserService } = require('@/lib/factories/serviceFactory');
    const mockUserService = createUserService();
    
    // Existing user
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      company_name: 'Test Company',
      role: 'vendor',
      auth_provider: 'email',
      created_at: '2024-01-01T00:00:00Z'
    };
    mockUserService.getUserByEmail.mockResolvedValueOnce(mockUser);
    
    // Updated user
    const updatedUser = {
      ...mockUser,
      company_name: 'Updated Company Name',
      updated_at: '2024-01-02T00:00:00.000Z'
    };
    mockUserService.updateUser.mockResolvedValueOnce(updatedUser);
    
    // Create request with valid token and update data
    const request = createMockNextRequest('PUT', 'http://localhost:3000/api/v1/users/me', {
      company_name: 'Updated Company Name'
    }, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler
    const response = await PUT(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(data).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      company_name: 'Updated Company Name',
      updated_at: '2024-01-02T00:00:00.000Z'
    });
    
    // Verify that updateUser was called with correct parameters
    expect(mockUserService.updateUser).toHaveBeenCalledWith('user-123', {
      company_name: 'Updated Company Name'
    });
    
    // Restore the original Date
    global.Date = origDate;
  });
  
  it('should handle database error during update', async () => {
    // Setup Supabase auth mock to return valid user
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { 
        user: { 
          id: 'auth-user-123',
          email: 'test@example.com'
        } 
      },
      error: null
    });
    
    // Setup user service mocks
    const { createUserService } = require('@/lib/factories/serviceFactory');
    const mockUserService = createUserService();
    
    // Existing user
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      company_name: 'Test Company',
      role: 'vendor',
      auth_provider: 'email',
      created_at: '2024-01-01T00:00:00Z'
    };
    mockUserService.getUserByEmail.mockResolvedValueOnce(mockUser);
    
    // Mock update to fail with database error
    mockUserService.updateUser.mockRejectedValueOnce(new Error('Database error occurred'));
    
    // Create request with valid token and update data
    const request = createMockNextRequest('PUT', 'http://localhost:3000/api/v1/users/me', {
      company_name: 'Updated Company Name'
    }, {
      authorization: 'Bearer valid-token'
    });
    
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Call the handler
    const response = await PUT(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(500);
    expect(data.status).toBe(500);
    expect(data.code).toBe('SERVER_ERROR');
    
    // Verify that error was logged
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
  
  it('should handle empty request body', async () => {
    // Mock Supabase response for auth user
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.getUser.mockResolvedValue({
      data: {
        user: { 
          id: 'auth-user-123',
          email: 'test@example.com'
        }
      },
      error: null
    });
    
    // Create request with null body
    const request = createMockNextRequest('PUT', 'http://localhost:3000/api/v1/users/me', null, {
      authorization: 'Bearer valid-token'
    });
    
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Call the handler
    const response = await PUT(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Verify response
    expect(response.status).toBe(400);
    expect(data.code).toBe('INVALID_INPUT');
    
    // Cleanup
    consoleErrorSpy.mockRestore();
  });
}); 