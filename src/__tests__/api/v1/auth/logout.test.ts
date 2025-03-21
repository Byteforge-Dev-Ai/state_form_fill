import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { resetSupabaseMocks } from '../../../mocks/supabase';
import { POST } from '@/app/api/v1/auth/logout/route';
import { createMockNextRequest } from '../../../helpers/testUtils';
import { NextResponse } from 'next/server';

// Mock NextResponse
jest.mock('next/server', () => {
  // Return a basic mock implementation
  return {
    NextResponse: {
      json: jest.fn().mockImplementation((body: any, init?: any) => {
        return {
          status: init?.status || 200,
          json: async () => body
        };
      }),
      next: jest.fn(),
      redirect: jest.fn()
    }
  };
});

describe('POST /api/v1/auth/logout', () => {
  // Reset mocks before each test
  beforeEach(() => {
    resetSupabaseMocks();
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();
  });
  
  it('should return 401 if authorization header is missing', async () => {
    // Create request with no auth header
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/logout');
    
    // Call the handler
    const response = await POST(request);
    
    // Assert status and response
    expect(response.status).toBe(401);
    
    // Parse the JSON response
    const data = await response.json();
    
    // Further assertions
    expect(data.status).toBe(401);
    expect(data.code).toBe('UNAUTHORIZED');
  });
  
  it('should return success on successful logout', async () => {
    // Import supabase mocks
    const { supabaseClient, getServiceSupabase } = require('@/lib/supabase/client');
    
    // Mock token verification to return a valid user
    supabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null
    });
    
    // Get the mock admin client
    const adminClient = getServiceSupabase();
    
    // Mock admin signOut to return success
    adminClient.auth.admin.signOut.mockResolvedValueOnce({
      error: null
    });
    
    // Create request with auth header
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/logout', null, {
      authorization: 'Bearer fake-token'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse the JSON response
    const data = await response.json();
    
    // Verify success response
    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    
    // Verify that token was verified
    expect(supabaseClient.auth.getUser).toHaveBeenCalledWith('fake-token');
    
    // Verify that admin signOut was called
    expect(adminClient.auth.admin.signOut).toHaveBeenCalledWith('fake-token');
  });
  
  it('should return 401 if token verification fails', async () => {
    // Import supabase mock
    const { supabaseClient } = require('@/lib/supabase/client');
    
    // Mock token verification to return an error
    supabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid token' }
    });
    
    // Create request with auth header
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/logout', null, {
      authorization: 'Bearer fake-token'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response data
    const data = await response.json();
    
    // Assertions
    expect(response.status).toBe(401);
    expect(data.status).toBe(401);
    expect(data.code).toBe('INVALID_TOKEN');
  });
  
  it('should return 500 if admin signOut returns an error', async () => {
    // Import supabase mocks
    const { supabaseClient, getServiceSupabase } = require('@/lib/supabase/client');
    
    // Mock token verification to return a valid user
    supabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: { id: 'user-123', email: 'test@example.com' } },
      error: null
    });
    
    // Get the mock admin client
    const adminClient = getServiceSupabase();
    
    // Mock admin signOut to return an error
    adminClient.auth.admin.signOut.mockResolvedValueOnce({
      error: { message: 'Error during signout' }
    });
    
    // Create request with auth header
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/logout', null, {
      authorization: 'Bearer fake-token'
    });
    
    // Spy on console.error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response data
    const data = await response.json();
    
    // Assertions
    expect(response.status).toBe(500);
    expect(data.status).toBe(500);
    expect(data.code).toBe('LOGOUT_ERROR');
    
    // Verify that error was logged
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
  
  it('should handle unexpected errors during token verification', async () => {
    // Import supabase mocks
    const { supabaseClient, getServiceSupabase } = require('@/lib/supabase/client');
    
    // Mock token verification to throw an unexpected error
    supabaseClient.auth.getUser.mockImplementationOnce(() => {
      throw new Error('Unexpected server error');
    });
    
    // Create request with auth header
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/logout', null, {
      authorization: 'Bearer fake-token'
    });
    
    // Spy on console.error to avoid polluting the test output
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    try {
      // Call the handler
      const response = await POST(request);
      
      // Parse response data
      const data = await response.json();
      
      // Assertions - route handles unexpected token verification errors with a 401 status
      expect(response.status).toBe(401);
      expect(data.status).toBe(401);
      expect(data.code).toBe('INVALID_TOKEN');
      
      // Verify that error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith('Token verification error:', expect.any(Error));
    } finally {
      // Always restore console.error to avoid affecting other tests
      consoleErrorSpy.mockRestore();
    }
  });
}); 