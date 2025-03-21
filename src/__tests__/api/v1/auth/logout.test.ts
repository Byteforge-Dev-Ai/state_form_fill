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
    // Setup Supabase mock to return success
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.signOut.mockResolvedValueOnce({
      error: null
    });
    
    // Create request with auth header
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/logout', null, {
      authorization: 'Bearer fake-token'
    });
    
    // Call the handler
    await POST(request);
    
    // Verify that Supabase auth signOut was called
    expect(supabaseClient.auth.signOut).toHaveBeenCalled();
  });
  
  it('should return 500 if Supabase signOut returns an error', async () => {
    // Setup Supabase mock to return an error
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.signOut.mockResolvedValueOnce({
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
  
  it('should handle unexpected errors', async () => {
    // Setup Supabase mock to throw an error
    const { supabaseClient } = require('@/lib/supabase/client');
    supabaseClient.auth.signOut.mockImplementationOnce(() => {
      throw new Error('Unexpected error');
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
    expect(data.code).toBe('SERVER_ERROR');
    
    // Verify that error was logged
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });
}); 