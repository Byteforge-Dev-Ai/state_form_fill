import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import { POST } from '@/app/api/v1/auth/password/reset/route';
import { resetSupabaseMocks } from '@/__tests__/mocks/supabase';
import { createMockNextRequest, parseNextResponseJson } from '@/__tests__/helpers/testUtils';

describe('POST /api/v1/auth/password/reset', () => {
  beforeEach(() => {
    // Reset mocks before each test
    resetSupabaseMocks();
    jest.clearAllMocks();
  });

  it('should return 400 for invalid input', async () => {
    // Create request with missing token
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/password/reset', {
      password: 'newpassword123' // Missing token
    });

    // Call the endpoint
    const response = await POST(request);
    const data = await parseNextResponseJson(response);

    // Assertions
    expect(response.status).toBe(400);
    expect(data.status).toBe(400);
    expect(data.code).toBe('INVALID_INPUT');
  });

  it('should return 400 for password too short', async () => {
    // Create request with short password
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/password/reset', {
      token: 'valid-token', 
      password: 'short' // Less than 8 characters
    });

    // Call the endpoint
    const response = await POST(request);
    const data = await parseNextResponseJson(response);

    // Assertions
    expect(response.status).toBe(400);
    expect(data.status).toBe(400);
    expect(data.code).toBe('INVALID_INPUT');
  });

  it('should reset password with valid token and password', async () => {
    // Mock dependencies
    const { supabaseClient } = require('@/lib/supabase/client');
    
    // Mock Supabase updateUser to succeed
    supabaseClient.auth.updateUser.mockResolvedValue({ error: null });

    // Create valid request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/password/reset', {
      token: 'valid-reset-token', 
      password: 'newpassword123' 
    });

    // Call the endpoint
    const response = await POST(request);
    const data = await parseNextResponseJson(response);

    // Assertions
    expect(response.status).toBe(200);
    expect(data.message).toBe('Password has been reset');
    expect(supabaseClient.auth.updateUser).toHaveBeenCalledWith(
      { password: 'newpassword123' },
      { accessToken: 'valid-reset-token' }
    );
  });

  it('should return 401 for invalid token', async () => {
    // Mock dependencies
    const { supabaseClient } = require('@/lib/supabase/client');
    
    // Mock Supabase updateUser to fail with 401 error
    supabaseClient.auth.updateUser.mockResolvedValue({ 
      error: { 
        status: 401,
        message: 'Invalid token'
      }
    });

    // Create request with invalid token
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/password/reset', {
      token: 'invalid-token', 
      password: 'newpassword123' 
    });

    // Call the endpoint
    const response = await POST(request);
    const data = await parseNextResponseJson(response);

    // Assertions
    expect(response.status).toBe(401);
    expect(data.status).toBe(401);
    expect(data.code).toBe('INVALID_TOKEN');
  });

  it('should return 400 for password policy failure', async () => {
    // Mock dependencies
    const { supabaseClient } = require('@/lib/supabase/client');
    
    // Mock Supabase updateUser to fail with password policy error
    supabaseClient.auth.updateUser.mockResolvedValue({ 
      error: { 
        message: 'Password must contain at least one number'
      }
    });

    // Create request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/password/reset', {
      token: 'valid-token', 
      password: 'newpassword' 
    });

    // Call the endpoint
    const response = await POST(request);
    const data = await parseNextResponseJson(response);

    // Assertions
    expect(response.status).toBe(400);
    expect(data.status).toBe(400);
    expect(data.code).toBe('PASSWORD_POLICY_FAILED');
  });

  it('should return 400 for other reset failures', async () => {
    // Mock dependencies
    const { supabaseClient } = require('@/lib/supabase/client');
    
    // Mock Supabase updateUser to fail with generic error
    supabaseClient.auth.updateUser.mockResolvedValue({ 
      error: { 
        message: 'Some other error'
      }
    });

    // Create request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/password/reset', {
      token: 'valid-token', 
      password: 'newpassword123' 
    });

    // Call the endpoint
    const response = await POST(request);
    const data = await parseNextResponseJson(response);

    // Assertions
    expect(response.status).toBe(400);
    expect(data.status).toBe(400);
    expect(data.code).toBe('RESET_FAILED');
  });

  it('should return 500 for unexpected errors', async () => {
    // Mock dependencies
    const { supabaseClient } = require('@/lib/supabase/client');
    
    // Mock Supabase updateUser to throw error
    supabaseClient.auth.updateUser.mockRejectedValue(new Error('Unexpected error'));

    // Create request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/password/reset', {
      token: 'valid-token', 
      password: 'newpassword123' 
    });

    // Call the endpoint
    const response = await POST(request);
    const data = await parseNextResponseJson(response);

    // Assertions
    expect(response.status).toBe(500);
    expect(data.status).toBe(500);
    expect(data.code).toBe('SERVER_ERROR');
  });
}); 