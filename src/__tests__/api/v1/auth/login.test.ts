import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { resetSupabaseMocks } from '../../../mocks/supabase';
import { POST } from '@/app/api/v1/auth/login/route';
import { createMockNextRequest, parseNextResponseJson } from '../../../helpers/testUtils';
import { NextResponse } from 'next/server';

// Mock createUserService
jest.mock('@/lib/factories/serviceFactory', () => ({
  createUserService: jest.fn().mockReturnValue({
    getUserByEmail: jest.fn(),
    logUserLogin: jest.fn()
  })
}));

describe('POST /api/v1/auth/login', () => {
  // Reset mocks before each test
  beforeEach(() => {
    resetSupabaseMocks();
    jest.clearAllMocks();
    
    // Get references to mocked functions
    const { createUserService } = require('@/lib/factories/serviceFactory');
    const mockUserService = createUserService();
    
    // Reset the mocked user service methods
    mockUserService.getUserByEmail.mockReset();
    mockUserService.logUserLogin.mockReset();
  });
  
  it('should return 400 if email is missing', async () => {
    // Create request with missing email
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/login', {
      password: 'password123'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(400);
    expect(data.status).toBe(400);
    expect(data.code).toBe('INVALID_INPUT');
    expect(data.details.email).toBeDefined();
  });
  
  it('should return 400 if password is missing', async () => {
    // Create request with missing password
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/login', {
      email: 'test@example.com'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(400);
    expect(data.status).toBe(400);
    expect(data.code).toBe('INVALID_INPUT');
    expect(data.details.password).toBeDefined();
  });
  
  it('should return 401 if authentication fails', async () => {
    // Setup Supabase mock to return an error
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: {},
      error: { message: 'Invalid login credentials' }
    });
    
    // Create a valid request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(401);
    expect(data.status).toBe(401);
    expect(data.code).toBe('INVALID_CREDENTIALS');
    
    // Verify that Supabase auth was called with correct parameters
    expect(supabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
  
  it('should return 404 if user is not found in database', async () => {
    // Setup Supabase mock to return success
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        session: {
          access_token: 'fake-token',
          refresh_token: 'fake-refresh-token',
          expires_at: new Date().getTime() / 1000 + 3600
        }
      },
      error: null
    });
    
    // Setup user service mock to return null (user not found)
    const { createUserService } = require('@/lib/factories/serviceFactory');
    const mockUserService = createUserService();
    mockUserService.getUserByEmail.mockResolvedValueOnce(null);
    
    // Create a valid request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(404);
    expect(data.status).toBe(404);
    expect(data.code).toBe('USER_NOT_FOUND');
    
    // Verify that getUserByEmail was called with the correct email
    expect(mockUserService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
  });
  
  it('should return 200 with user data and tokens on successful login', async () => {
    // Mock current date for consistent testing
    const mockDate = new Date('2024-01-01T00:00:00Z');
    const origDate = global.Date;
    global.Date = jest.fn(() => mockDate) as any;
    global.Date.UTC = origDate.UTC;
    global.Date.parse = origDate.parse;
    global.Date.now = origDate.now;
    
    // Setup Supabase mock to return success
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: {
        session: {
          access_token: 'fake-token',
          refresh_token: 'fake-refresh-token',
          expires_at: 1704153600 // 2024-01-02T00:00:00Z
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
      created_at: '2023-12-25T00:00:00Z',
      last_login: '2023-12-31T00:00:00Z'
    };
    mockUserService.getUserByEmail.mockResolvedValueOnce(mockUser);
    mockUserService.logUserLogin.mockResolvedValueOnce(undefined);
    
    // Create a valid request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(data.user).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      company_name: 'Test Company',
      role: 'vendor',
      last_login: '2024-01-01T00:00:00.000Z'
    });
    expect(data.token).toBe('fake-token');
    expect(data.refresh_token).toBe('fake-refresh-token');
    expect(data.expires_at).toBe(1704153600);
    
    // Verify that logUserLogin was called with the correct user ID
    expect(mockUserService.logUserLogin).toHaveBeenCalledWith('user-123');
    
    // Restore the original Date
    global.Date = origDate;
  });
  
  it('should handle unexpected errors', async () => {
    // Setup Supabase mock to throw an error
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.signInWithPassword.mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });
    
    // Create a valid request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Call the handler
    const response = await POST(request);
    
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