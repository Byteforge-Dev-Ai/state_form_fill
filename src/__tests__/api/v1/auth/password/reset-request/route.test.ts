import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import { POST } from '@/app/api/v1/auth/password/reset-request/route';
import { resetSupabaseMocks } from '@/__tests__/mocks/supabase';
import { createMockNextRequest, parseNextResponseJson } from '@/__tests__/helpers/testUtils';

jest.mock('@/lib/factories/serviceFactory', () => ({
  createUserService: jest.fn().mockReturnValue({
    getUserByEmail: jest.fn()
  })
}));

describe('POST /api/v1/auth/password/reset-request', () => {
  beforeEach(() => {
    // Reset mocks before each test
    resetSupabaseMocks();
    jest.clearAllMocks();
    
    // Get references to mocked functions
    const { createUserService } = require('@/lib/factories/serviceFactory');
    const mockUserService = createUserService();
    
    // Reset the mocked user service methods
    mockUserService.getUserByEmail.mockReset();
  });

  it('should return 400 for invalid email', async () => {
    // Create request with invalid email
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/password/reset-request', {
      email: 'invalid-email'
    });

    // Call the endpoint
    const response = await POST(request);
    const data = await parseNextResponseJson(response);

    // Assertions
    expect(response.status).toBe(400);
    expect(data.status).toBe(400);
    expect(data.code).toBe('INVALID_INPUT');
  });

  it('should send password reset email for valid request', async () => {
    // Mock dependencies
    const { supabaseClient } = require('@/lib/supabase/client');
    const { createUserService } = require('@/lib/factories/serviceFactory');
    
    // Mock user service to return a user
    createUserService().getUserByEmail.mockResolvedValue({ id: '1', email: 'test@example.com' });
    
    // Mock Supabase resetPasswordForEmail to succeed
    supabaseClient.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

    // Create request with valid email
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/password/reset-request', {
      email: 'test@example.com'
    });

    // Call the endpoint
    const response = await POST(request);
    const data = await parseNextResponseJson(response);

    // Assertions
    expect(response.status).toBe(200);
    expect(data.message).toBe('Password reset email sent if account exists');
    expect(supabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      'test@example.com',
      expect.objectContaining({
        redirectTo: expect.any(String)
      })
    );
  });

  it('should return success even if user does not exist (for security)', async () => {
    // Mock dependencies
    const { supabaseClient } = require('@/lib/supabase/client');
    const { createUserService } = require('@/lib/factories/serviceFactory');
    
    // Mock user service to return null (user not found)
    createUserService().getUserByEmail.mockResolvedValue(null);
    
    // Mock Supabase resetPasswordForEmail to succeed
    supabaseClient.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

    // Create request with valid email
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/password/reset-request', {
      email: 'nonexistent@example.com'
    });

    // Call the endpoint
    const response = await POST(request);
    const data = await parseNextResponseJson(response);

    // Assertions
    expect(response.status).toBe(200);
    expect(data.message).toBe('Password reset email sent if account exists');
    // Should still call the Supabase method even if user doesn't exist
    expect(supabaseClient.auth.resetPasswordForEmail).toHaveBeenCalled();
  });

  it('should return success even if Supabase encounters an error (for security)', async () => {
    // Mock dependencies
    const { supabaseClient } = require('@/lib/supabase/client');
    const { createUserService } = require('@/lib/factories/serviceFactory');
    
    // Mock user service to return a user
    createUserService().getUserByEmail.mockResolvedValue({ id: '1', email: 'test@example.com' });
    
    // Mock Supabase resetPasswordForEmail to fail
    supabaseClient.auth.resetPasswordForEmail.mockResolvedValue({ 
      error: { message: 'Some error' } 
    });

    // Create request with valid email
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/password/reset-request', {
      email: 'test@example.com'
    });

    // Call the endpoint
    const response = await POST(request);
    const data = await parseNextResponseJson(response);

    // Assertions - should still return success for security reasons
    expect(response.status).toBe(200);
    expect(data.message).toBe('Password reset email sent if account exists');
  });

  it('should return 500 for unexpected errors', async () => {
    // Mock dependencies
    const { createUserService } = require('@/lib/factories/serviceFactory');
    
    // Mock user service to throw an error
    createUserService().getUserByEmail.mockRejectedValue(new Error('Unexpected error'));

    // Create request with valid email
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/auth/password/reset-request', {
      email: 'test@example.com'
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