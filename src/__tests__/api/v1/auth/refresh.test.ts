import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { resetSupabaseMocks } from '../../../mocks/supabase';
import { POST } from '@/app/api/v1/auth/refresh/route';
import { createMockNextRequest, parseNextResponseJson } from '../../../helpers/testUtils';

describe('POST /api/v1/auth/refresh', () => {
  // Reset mocks before each test
  beforeEach(() => {
    resetSupabaseMocks();
    jest.clearAllMocks();
  });
  
  it('should return 400 if refresh_token is missing', async () => {
    // Create request with missing refresh_token
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/refresh', {});
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(400);
    expect(data.status).toBe(400);
    expect(data.code).toBe('INVALID_INPUT');
    expect(data.details.refresh_token).toBeDefined();
  });
  
  it('should return 401 if refresh token is invalid', async () => {
    // Setup Supabase mock to return an error
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.refreshSession.mockResolvedValueOnce({
      data: {},
      error: { message: 'Invalid refresh token' }
    });
    
    // Create a valid request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/refresh', {
      refresh_token: 'invalid-refresh-token'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(401);
    expect(data.status).toBe(401);
    expect(data.code).toBe('INVALID_REFRESH_TOKEN');
    
    // Verify that Supabase refreshSession was called with correct parameters
    expect(supabaseClient.auth.refreshSession).toHaveBeenCalledWith({
      refresh_token: 'invalid-refresh-token'
    });
  });
  
  it('should return 200 with new tokens on successful refresh', async () => {
    // Setup Supabase mock to return success
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.refreshSession.mockResolvedValueOnce({
      data: {
        session: {
          access_token: 'new-access-token',
          refresh_token: 'new-refresh-token',
          expires_at: 1704153600 // 2024-01-02T00:00:00Z
        }
      },
      error: null
    });
    
    // Create a valid request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/refresh', {
      refresh_token: 'valid-refresh-token'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response data
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(data.token).toBe('new-access-token');
    expect(data.refresh_token).toBe('new-refresh-token');
    expect(data.expires_at).toBe(1704153600);
    
    // Verify that Supabase refreshSession was called with correct parameters
    expect(supabaseClient.auth.refreshSession).toHaveBeenCalledWith({
      refresh_token: 'valid-refresh-token'
    });
  });
  
  it('should handle unexpected errors', async () => {
    // Setup Supabase mock to throw an error
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.refreshSession.mockImplementationOnce(() => {
      throw new Error('Unexpected error');
    });
    
    // Create a valid request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/refresh', {
      refresh_token: 'valid-refresh-token'
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