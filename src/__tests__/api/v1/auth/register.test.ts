import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { resetSupabaseMocks } from '../../../mocks/supabase';
import { POST } from '@/app/api/v1/auth/register/route';
import { createMockNextRequest, parseNextResponseJson } from '../../../helpers/testUtils';

// Mock createUserService
jest.mock('@/lib/factories/serviceFactory', () => ({
  createUserService: jest.fn().mockReturnValue({
    createUser: jest.fn()
  })
}));

describe('POST /api/v1/auth/register', () => {
  // Reset mocks before each test
  beforeEach(() => {
    resetSupabaseMocks();
    jest.clearAllMocks();
    
    // Get references to mocked functions
    const { createUserService } = require('@/lib/factories/serviceFactory');
    const mockUserService = createUserService();
    
    // Reset the mocked user service methods
    mockUserService.createUser.mockReset();
  });
  
  it('should return 400 if email is missing', async () => {
    // Create request with missing email
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/register', {
      password: 'password123',
      company_name: 'Test Company'
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
  
  it('should return 400 if password is too short', async () => {
    // Create request with short password
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/register', {
      email: 'test@example.com',
      password: 'pass', // Less than 8 characters
      company_name: 'Test Company'
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
  
  it('should return 400 if role is invalid', async () => {
    // Create request with invalid role
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/register', {
      email: 'test@example.com',
      password: 'password123',
      company_name: 'Test Company',
      role: 'superuser' // Invalid role
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(400);
    expect(data.status).toBe(400);
    expect(data.code).toBe('INVALID_INPUT');
    expect(data.details.role).toBeDefined();
  });
  
  it('should return 400 if Supabase auth signup fails', async () => {
    // Setup Supabase mock to return an error
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.signUp.mockResolvedValueOnce({
      data: {},
      error: { message: 'Email already in use' }
    });
    
    // Create a valid request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/register', {
      email: 'test@example.com',
      password: 'password123',
      company_name: 'Test Company'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(400);
    expect(data.status).toBe(400);
    expect(data.code).toBe('AUTH_ERROR');
    
    // Verify that Supabase auth was called with correct parameters
    expect(supabaseClient.auth.signUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123'
    });
  });
  
  it('should return 500 if session creation fails after user creation', async () => {
    // Setup Supabase mock for auth signup (success)
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.signUp.mockResolvedValueOnce({
      data: {
        user: {
          id: 'auth-user-123'
        }
      },
      error: null
    });
    
    // Setup user service mock (success)
    const { createUserService } = require('@/lib/factories/serviceFactory');
    const mockUserService = createUserService();
    mockUserService.createUser.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com',
      company_name: 'Test Company',
      role: 'vendor',
      created_at: '2024-01-01T00:00:00Z'
    });
    
    // Setup Supabase signin to fail
    supabaseClient.auth.signInWithPassword.mockResolvedValueOnce({
      data: {},
      error: { message: 'Failed to create session' }
    });
    
    // Create a valid request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/register', {
      email: 'test@example.com',
      password: 'password123',
      company_name: 'Test Company'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(500);
    expect(data.status).toBe(500);
    expect(data.code).toBe('SESSION_ERROR');
    
    // Verify user was created
    expect(mockUserService.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      company_name: 'Test Company',
      role: 'vendor',
      auth_provider: 'email',
      provider_user_id: 'auth-user-123'
    });
  });
  
  it('should return 201 with user data and tokens on successful registration', async () => {
    // Setup Supabase mock for auth signup (success)
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.signUp.mockResolvedValueOnce({
      data: {
        user: {
          id: 'auth-user-123'
        }
      },
      error: null
    });
    
    // Setup user service mock (success)
    const { createUserService } = require('@/lib/factories/serviceFactory');
    const mockUserService = createUserService();
    mockUserService.createUser.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com',
      company_name: 'Test Company',
      role: 'vendor',
      created_at: '2024-01-01T00:00:00Z'
    });
    
    // Setup Supabase signin to succeed
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
    
    // Create a valid request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/register', {
      email: 'test@example.com',
      password: 'password123',
      company_name: 'Test Company',
      role: 'vendor'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(201);
    expect(data.user).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      company_name: 'Test Company',
      role: 'vendor',
      created_at: '2024-01-01T00:00:00Z'
    });
    expect(data.token).toBe('fake-token');
    expect(data.refresh_token).toBe('fake-refresh-token');
    expect(data.expires_at).toBe(1704153600);
    
    // Verify createUser was called with correct params
    expect(mockUserService.createUser).toHaveBeenCalledWith({
      email: 'test@example.com',
      company_name: 'Test Company',
      role: 'vendor',
      auth_provider: 'email',
      provider_user_id: 'auth-user-123'
    });
  });
  
  it('should handle unexpected errors', async () => {
    // Setup Supabase mock to throw an error
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.signUp.mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });
    
    // Create a valid request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/register', {
      email: 'test@example.com',
      password: 'password123',
      company_name: 'Test Company'
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