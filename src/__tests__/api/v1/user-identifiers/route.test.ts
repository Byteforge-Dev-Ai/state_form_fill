import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { GET, POST } from '@/app/api/v1/user-identifiers/route';
import { createMockNextRequest, parseNextResponseJson } from '../../../helpers/testUtils';
import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

// Mock dependencies
jest.mock('next/server', () => {
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

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  supabaseClient: {
    auth: {
      getUser: jest.fn()
    }
  }
}));

// Create mock service functions
const mockGetUserByEmail = jest.fn();
const mockGetAllByUserId = jest.fn();
const mockCreate = jest.fn();

// Mock service factories
jest.mock('@/lib/factories/serviceFactory', () => ({
  createUserService: jest.fn(() => ({
    getUserByEmail: mockGetUserByEmail
  })),
  createUserIdentifierService: jest.fn(() => ({
    getAllByUserId: mockGetAllByUserId,
    create: mockCreate
  }))
}));

// Mock validators
jest.mock('@/lib/validators/userIdentifierValidator', () => ({
  createUserIdentifierSchema: {
    parse: jest.fn()
  },
  CreateUserIdentifierInput: {}
}));

// Import mocked dependencies to use in tests
const { supabaseClient } = require('@/lib/supabase/client');
const { createUserIdentifierSchema } = require('@/lib/validators/userIdentifierValidator');

describe('GET /api/v1/user-identifiers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();
  });
  
  it('should return 401 when no authorization header is provided', async () => {
    // Create request without auth header
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/user-identifiers');
    
    // Call the handler
    const response = await GET(request);
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(401);
    expect(data).toEqual({
      status: 401,
      message: 'Unauthorized',
      code: 'UNAUTHORIZED'
    });
  });
  
  it('should return 401 when authorization token is invalid', async () => {
    // Setup Supabase auth mock to return error
    supabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid token' }
    });
    
    // Create request with invalid token
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/user-identifiers', null, {
      authorization: 'Bearer invalid-token'
    });
    
    // Call the handler
    const response = await GET(request);
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(401);
    expect(data).toEqual({
      status: 401,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
    
    // Verify token was passed to Supabase
    expect(supabaseClient.auth.getUser).toHaveBeenCalledWith('invalid-token');
  });
  
  it('should return 400 when user email is missing', async () => {
    // Setup Supabase auth mock to return user without email
    supabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { 
        user: { 
          id: 'auth-user-123',
          email: null
        } 
      },
      error: null
    });
    
    // Create request with valid token
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/user-identifiers', null, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler
    const response = await GET(request);
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(400);
    expect(data).toEqual({
      status: 400,
      message: 'User email is missing',
      code: 'EMAIL_MISSING'
    });
  });
  
  it('should return 404 when user is not found in database', async () => {
    // Setup Supabase auth mock to return valid user
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
    mockGetUserByEmail.mockResolvedValueOnce(null);
    
    // Create request with valid token
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/user-identifiers', null, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler
    const response = await GET(request);
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(404);
    expect(data).toEqual({
      status: 404,
      message: 'User not found',
      code: 'USER_NOT_FOUND'
    });
    
    // Verify getUserByEmail was called with correct email
    expect(mockGetUserByEmail).toHaveBeenCalledWith('test@example.com');
  });
  
  it('should return 200 with user identifiers on success', async () => {
    // Setup Supabase auth mock to return valid user
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
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User'
    };
    mockGetUserByEmail.mockResolvedValueOnce(mockUser);
    
    // Setup user identifier service mock to return identifiers
    const mockIdentifiers = [
      {
        id: 'identifier-1',
        user_id: 'user-123',
        legal_name: 'Business Name 1',
        nc_dor_id: '123456789',
        created_at: '2024-01-01T00:00:00Z'
      },
      {
        id: 'identifier-2',
        user_id: 'user-123',
        legal_name: 'Business Name 2',
        nc_dor_id: '987654321',
        created_at: '2024-01-02T00:00:00Z'
      }
    ];
    mockGetAllByUserId.mockResolvedValueOnce(mockIdentifiers);
    
    // Create request with valid token
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/user-identifiers', null, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler
    const response = await GET(request);
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(data).toEqual(mockIdentifiers);
    
    // Verify service calls
    expect(mockGetUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockGetAllByUserId).toHaveBeenCalledWith('user-123');
  });
  
  it('should handle errors and return 500', async () => {
    // Setup Supabase auth mock to return valid user
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
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User'
    };
    mockGetUserByEmail.mockResolvedValueOnce(mockUser);
    
    // Setup user identifier service mock to throw error
    mockGetAllByUserId.mockRejectedValueOnce(new Error('Database error'));
    
    // Create request with valid token
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/user-identifiers', null, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler
    const response = await GET(request);
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(500);
    expect(data).toEqual({
      status: 500,
      message: 'Failed to fetch user identifiers',
      code: 'USER_IDENTIFIER_FETCH_FAILED'
    });
  });
});

describe('POST /api/v1/user-identifiers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();
  });
  
  it('should return 401 when no authorization header is provided', async () => {
    // Create request without auth header
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/user-identifiers');
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(401);
    expect(data).toEqual({
      status: 401,
      message: 'Unauthorized',
      code: 'UNAUTHORIZED'
    });
  });
  
  it('should return 401 when authorization token is invalid', async () => {
    // Setup Supabase auth mock to return error
    supabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'Invalid token' }
    });
    
    // Create request with invalid token
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/user-identifiers', {}, {
      authorization: 'Bearer invalid-token'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(401);
    expect(data).toEqual({
      status: 401,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  });
  
  it('should return 400 when user email is missing', async () => {
    // Setup Supabase auth mock to return user without email
    supabaseClient.auth.getUser.mockResolvedValueOnce({
      data: { 
        user: { 
          id: 'auth-user-123',
          email: null
        } 
      },
      error: null
    });
    
    // Create request with valid token
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/user-identifiers', {}, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(400);
    expect(data).toEqual({
      status: 400,
      message: 'User email is missing',
      code: 'EMAIL_MISSING'
    });
  });
  
  it('should return 404 when user is not found in database', async () => {
    // Setup Supabase auth mock to return valid user
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
    mockGetUserByEmail.mockResolvedValueOnce(null);
    
    // Create request with valid token
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/user-identifiers', {}, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(404);
    expect(data).toEqual({
      status: 404,
      message: 'User not found',
      code: 'USER_NOT_FOUND'
    });
  });
  
  it('should return 400 when validation fails', async () => {
    // Setup Supabase auth mock to return valid user
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
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User'
    };
    mockGetUserByEmail.mockResolvedValueOnce(mockUser);
    
    // Setup validation to fail
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['legal_name'],
        message: 'Expected string, received number'
      }
    ]);
    createUserIdentifierSchema.parse.mockImplementationOnce(() => {
      throw zodError;
    });
    
    // Create request with invalid data
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/user-identifiers', {
      legal_name: 123 // Invalid type
    }, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(400);
    expect(data).toEqual({
      status: 400,
      message: 'Validation error',
      code: 'VALIDATION_ERROR',
      details: zodError.errors
    });
  });
  
  it('should return 201 with created user identifier on success', async () => {
    // Setup Supabase auth mock to return valid user
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
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User'
    };
    mockGetUserByEmail.mockResolvedValueOnce(mockUser);
    
    // Setup validation to succeed
    const validData = {
      legal_name: 'New Business Name',
      nc_dor_id: '123456789'
    };
    createUserIdentifierSchema.parse.mockReturnValueOnce(validData);
    
    // Setup user identifier service mock to return created identifier
    const newIdentifier = {
      id: 'new-identifier',
      user_id: 'user-123',
      legal_name: 'New Business Name',
      nc_dor_id: '123456789',
      created_at: '2024-01-01T00:00:00Z'
    };
    mockCreate.mockResolvedValueOnce(newIdentifier);
    
    // Create request with valid data
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/user-identifiers', validData, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(201);
    expect(data).toEqual(newIdentifier);
    
    // Verify service calls
    expect(mockGetUserByEmail).toHaveBeenCalledWith('test@example.com');
    expect(createUserIdentifierSchema.parse).toHaveBeenCalledWith(validData);
    expect(mockCreate).toHaveBeenCalledWith('user-123', validData);
  });
}); 