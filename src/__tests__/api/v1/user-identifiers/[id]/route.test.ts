import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { GET, PUT, DELETE } from '@/app/api/v1/user-identifiers/[id]/route';
import { createMockNextRequest, parseNextResponseJson } from '../../../../helpers/testUtils';
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

// Mock auth middleware
jest.mock('@/lib/auth/middleware', () => ({
  authenticateUser: jest.fn()
}));

// Create mock service functions
const mockGetById = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();

// Mock service factories
jest.mock('@/lib/factories/serviceFactory', () => ({
  createUserIdentifierService: jest.fn(() => ({
    getById: mockGetById,
    update: mockUpdate,
    delete: mockDelete
  }))
}));

// Mock validators
jest.mock('@/lib/validators/userIdentifierValidator', () => ({
  updateUserIdentifierSchema: {
    parse: jest.fn()
  }
}));

// Import mocked dependencies to use in tests
const { authenticateUser } = require('@/lib/auth/middleware');
const { updateUserIdentifierSchema } = require('@/lib/validators/userIdentifierValidator');
const { createUserIdentifierService } = require('@/lib/factories/serviceFactory');

describe('GET /api/v1/user-identifiers/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();
  });
  
  it('should return 401 when user is not authenticated', async () => {
    // Setup auth middleware to return null (not authenticated)
    authenticateUser.mockResolvedValueOnce(null);
    
    // Create request
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/user-identifiers/123');
    
    // Call the handler with params
    const response = await GET(request, { params: { id: '123' } });
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(401);
    expect(data).toEqual({
      status: 401,
      message: 'Unauthorized',
      code: 'UNAUTHORIZED'
    });
    
    // Verify authenticateUser was called
    expect(authenticateUser).toHaveBeenCalledWith(request);
  });
  
  it('should return 400 when identifier ID is missing', async () => {
    // Setup auth middleware to return a user
    authenticateUser.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com'
    });
    
    // Create request
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/user-identifiers/');
    
    // Call the handler with empty params
    const response = await GET(request, { params: { id: '' } });
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(400);
    expect(data).toEqual({
      status: 400,
      message: 'Missing identifier ID',
      code: 'MISSING_ID'
    });
  });
  
  it('should return 404 when user identifier is not found', async () => {
    // Setup auth middleware to return a user
    authenticateUser.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com'
    });
    
    // Setup user identifier service mock to return null (not found)
    mockGetById.mockResolvedValueOnce(null);
    
    // Create request
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/user-identifiers/123');
    
    // Call the handler with params
    const response = await GET(request, { params: { id: '123' } });
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(404);
    expect(data).toEqual({
      status: 404,
      message: 'User identifier not found',
      code: 'USER_IDENTIFIER_NOT_FOUND'
    });
    
    // Verify getById was called with correct params
    expect(mockGetById).toHaveBeenCalledWith('123', 'user-123');
  });
  
  it('should return 200 with user identifier details on success', async () => {
    // Setup auth middleware to return a user
    authenticateUser.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com'
    });
    
    // Setup user identifier service mock to return an identifier
    const mockIdentifier = {
      id: 'identifier-123',
      user_id: 'user-123',
      legal_name: 'Business Name',
      nc_dor_id: '123456789',
      trade_name: 'Trade Name',
      address: '123 Main St',
      city: 'Raleigh',
      state: 'NC',
      zip_code: '27601',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };
    mockGetById.mockResolvedValueOnce(mockIdentifier);
    
    // Create request
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/user-identifiers/identifier-123');
    
    // Call the handler with params
    const response = await GET(request, { params: { id: 'identifier-123' } });
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(data).toEqual(mockIdentifier);
    
    // Verify getById was called with correct params
    expect(mockGetById).toHaveBeenCalledWith('identifier-123', 'user-123');
  });
  
  it('should handle errors and return 500', async () => {
    // Setup auth middleware to return a user
    authenticateUser.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com'
    });
    
    // Setup user identifier service mock to throw error
    mockGetById.mockRejectedValueOnce(new Error('Database error'));
    
    // Create request
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/user-identifiers/123');
    
    // Call the handler with params
    const response = await GET(request, { params: { id: '123' } });
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(500);
    expect(data).toEqual({
      status: 500,
      message: 'Failed to fetch user identifier',
      code: 'USER_IDENTIFIER_FETCH_FAILED'
    });
  });
});

describe('PUT /api/v1/user-identifiers/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();
  });
  
  it('should return 401 when user is not authenticated', async () => {
    // Setup auth middleware to return null (not authenticated)
    authenticateUser.mockResolvedValueOnce(null);
    
    // Create request
    const request = createMockNextRequest('PUT', 'http://localhost:3000/api/v1/user-identifiers/123');
    
    // Call the handler with params
    const response = await PUT(request, { params: { id: '123' } });
    
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
  
  it('should return 400 when identifier ID is missing', async () => {
    // Setup auth middleware to return a user
    authenticateUser.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com'
    });
    
    // Create request
    const request = createMockNextRequest('PUT', 'http://localhost:3000/api/v1/user-identifiers/');
    
    // Call the handler with empty params
    const response = await PUT(request, { params: { id: '' } });
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(400);
    expect(data).toEqual({
      status: 400,
      message: 'Missing identifier ID',
      code: 'MISSING_ID'
    });
  });
  
  it('should return 400 when validation fails', async () => {
    // Setup auth middleware to return a user
    authenticateUser.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com'
    });
    
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
    updateUserIdentifierSchema.parse.mockImplementationOnce(() => {
      throw zodError;
    });
    
    // Create request with invalid data
    const request = createMockNextRequest('PUT', 'http://localhost:3000/api/v1/user-identifiers/123', {
      legal_name: 123 // Invalid type
    });
    
    // Call the handler with params
    const response = await PUT(request, { params: { id: '123' } });
    
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
  
  it('should return 404 when user identifier is not found', async () => {
    // Setup auth middleware to return a user
    authenticateUser.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com'
    });
    
    // Setup validation to succeed
    const validData = {
      legal_name: 'Updated Business Name',
      nc_dor_id: '987654321'
    };
    updateUserIdentifierSchema.parse.mockReturnValueOnce(validData);
    
    // Setup user identifier service mock to return null (not found)
    mockUpdate.mockResolvedValueOnce(null);
    
    // Create request with valid data
    const request = createMockNextRequest('PUT', 'http://localhost:3000/api/v1/user-identifiers/123', validData);
    
    // Call the handler with params
    const response = await PUT(request, { params: { id: '123' } });
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(404);
    expect(data).toEqual({
      status: 404,
      message: 'User identifier not found',
      code: 'USER_IDENTIFIER_NOT_FOUND'
    });
    
    // Verify update was called with correct params
    expect(mockUpdate).toHaveBeenCalledWith('123', 'user-123', validData);
  });
  
  it('should return 200 with updated user identifier on success', async () => {
    // Setup auth middleware to return a user
    authenticateUser.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com'
    });
    
    // Setup validation to succeed
    const validData = {
      legal_name: 'Updated Business Name',
      nc_dor_id: '987654321'
    };
    updateUserIdentifierSchema.parse.mockReturnValueOnce(validData);
    
    // Setup user identifier service mock to return updated identifier
    const updatedIdentifier = {
      id: 'identifier-123',
      user_id: 'user-123',
      legal_name: 'Updated Business Name',
      nc_dor_id: '987654321',
      trade_name: 'Trade Name',
      address: '123 Main St',
      city: 'Raleigh',
      state: 'NC',
      zip_code: '27601',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    };
    mockUpdate.mockResolvedValueOnce(updatedIdentifier);
    
    // Create request with valid data
    const request = createMockNextRequest('PUT', 'http://localhost:3000/api/v1/user-identifiers/identifier-123', validData);
    
    // Call the handler with params
    const response = await PUT(request, { params: { id: 'identifier-123' } });
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(data).toEqual(updatedIdentifier);
    
    // Verify update was called with correct params
    expect(mockUpdate).toHaveBeenCalledWith('identifier-123', 'user-123', validData);
  });
  
  it('should handle errors and return 500', async () => {
    // Setup auth middleware to return a user
    authenticateUser.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com'
    });
    
    // Setup validation to succeed
    const validData = {
      legal_name: 'Updated Business Name',
      nc_dor_id: '987654321'
    };
    updateUserIdentifierSchema.parse.mockReturnValueOnce(validData);
    
    // Setup user identifier service mock to throw error
    mockUpdate.mockRejectedValueOnce(new Error('Database error'));
    
    // Create request with valid data
    const request = createMockNextRequest('PUT', 'http://localhost:3000/api/v1/user-identifiers/123', validData);
    
    // Call the handler with params
    const response = await PUT(request, { params: { id: '123' } });
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(500);
    expect(data).toEqual({
      status: 500,
      message: 'Failed to update user identifier',
      code: 'USER_IDENTIFIER_UPDATE_FAILED'
    });
  });
});

describe('DELETE /api/v1/user-identifiers/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();
  });
  
  it('should return 401 when user is not authenticated', async () => {
    // Setup auth middleware to return null (not authenticated)
    authenticateUser.mockResolvedValueOnce(null);
    
    // Create request
    const request = createMockNextRequest('DELETE', 'http://localhost:3000/api/v1/user-identifiers/123');
    
    // Call the handler with params
    const response = await DELETE(request, { params: { id: '123' } });
    
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
  
  it('should return 400 when identifier ID is missing', async () => {
    // Setup auth middleware to return a user
    authenticateUser.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com'
    });
    
    // Create request
    const request = createMockNextRequest('DELETE', 'http://localhost:3000/api/v1/user-identifiers/');
    
    // Call the handler with empty params
    const response = await DELETE(request, { params: { id: '' } });
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(400);
    expect(data).toEqual({
      status: 400,
      message: 'Missing identifier ID',
      code: 'MISSING_ID'
    });
  });
  
  it('should return 404 when user identifier is not found', async () => {
    // Setup auth middleware to return a user
    authenticateUser.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com'
    });
    
    // Setup user identifier service mock to return false (not found/not deleted)
    mockDelete.mockResolvedValueOnce(false);
    
    // Create request
    const request = createMockNextRequest('DELETE', 'http://localhost:3000/api/v1/user-identifiers/123');
    
    // Call the handler with params
    const response = await DELETE(request, { params: { id: '123' } });
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(404);
    expect(data).toEqual({
      status: 404,
      message: 'User identifier not found',
      code: 'USER_IDENTIFIER_NOT_FOUND'
    });
    
    // Verify delete was called with correct params
    expect(mockDelete).toHaveBeenCalledWith('123', 'user-123');
  });
  
  it('should return 204 with no content on successful deletion', async () => {
    // Setup auth middleware to return a user
    authenticateUser.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com'
    });
    
    // Setup user identifier service mock to return true (deleted)
    mockDelete.mockResolvedValueOnce(true);
    
    // Create request
    const request = createMockNextRequest('DELETE', 'http://localhost:3000/api/v1/user-identifiers/identifier-123');
    
    // Call the handler with params
    const response = await DELETE(request, { params: { id: 'identifier-123' } });
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(204);
    
    // Verify delete was called with correct params
    expect(mockDelete).toHaveBeenCalledWith('identifier-123', 'user-123');
  });
  
  it('should handle errors and return 500', async () => {
    // Setup auth middleware to return a user
    authenticateUser.mockResolvedValueOnce({
      id: 'user-123',
      email: 'test@example.com'
    });
    
    // Setup user identifier service mock to throw error
    mockDelete.mockRejectedValueOnce(new Error('Database error'));
    
    // Create request
    const request = createMockNextRequest('DELETE', 'http://localhost:3000/api/v1/user-identifiers/123');
    
    // Call the handler with params
    const response = await DELETE(request, { params: { id: '123' } });
    
    // Parse response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(500);
    expect(data).toEqual({
      status: 500,
      message: 'Failed to delete user identifier',
      code: 'USER_IDENTIFIER_DELETE_FAILED'
    });
  });
}); 