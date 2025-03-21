import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { GET, POST } from '@/app/api/v1/forms/[id]/entries/route';
import { createMockNextRequest, parseNextResponseJson, mockSupabaseClient } from '../../../../../helpers/testUtils';
import { NextRequest, NextResponse } from 'next/server';

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

// Mock createUserService with a more controlled implementation
const mockGetUserByEmail = jest.fn();

jest.mock('@/lib/factories/serviceFactory', () => ({
  createUserService: jest.fn(() => ({
    getUserByEmail: mockGetUserByEmail
  }))
}));

jest.mock('@/lib/supabase/client', () => ({
  supabaseClient: {
    auth: {
      getUser: jest.fn()
    }
  }
}));

// Import the mocked modules
import { supabaseClient } from '@/lib/supabase/client';
import { createUserService } from '@/lib/factories/serviceFactory';

describe('GET /api/v1/forms/[id]/entries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();
    mockGetUserByEmail.mockReset();
    
    // Mock crypto.randomUUID
    if (!global.crypto) {
      global.crypto = {} as Crypto;
    }
    global.crypto.randomUUID = jest.fn().mockReturnValue('mocked-uuid');
  });
  
  it('should return 401 when no authorization header is provided', async () => {
    // Create request without auth header
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/forms/123/entries');
    
    // Call the handler
    const response = await GET(request, { params: { id: '123' } });
    
    // Verify response
    expect(response.status).toBe(401);
    const data = await parseNextResponseJson(response);
    expect(data.code).toBe('AUTH_REQUIRED');
  });
  
  it('should return 401 when token verification fails', async () => {
    // Setup supabase auth to return error
    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' }
    });
    
    // Create request with auth header
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/forms/123/entries', null, {
      'Authorization': 'Bearer fake-token'
    });
    
    // Call the handler
    const response = await GET(request, { params: { id: '123' } });
    
    // Verify response
    expect(response.status).toBe(401);
    const data = await parseNextResponseJson(response);
    expect(data.code).toBe('INVALID_TOKEN');
  });
  
  it('should return 401 when user not found', async () => {
    // Setup supabase auth to return user
    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { email: 'test@example.com' } },
      error: null
    });
    
    // Setup user service to return no user
    mockGetUserByEmail.mockResolvedValue(null);
    
    // Create request with auth header
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/forms/123/entries', null, {
      'Authorization': 'Bearer fake-token'
    });
    
    // Call the handler
    const response = await GET(request, { params: { id: '123' } });
    
    // Verify response
    expect(response.status).toBe(401);
    const data = await parseNextResponseJson(response);
    expect(data.code).toBe('USER_NOT_FOUND');
  });
  
  it('should return entries when user is authenticated', async () => {
    // Mock Supabase to return a valid user
    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValueOnce({
      data: { user: { email: 'test@example.com' }, error: null }
    });
    
    // Mock user service to return a valid user
    mockGetUserByEmail.mockResolvedValueOnce({
      id: '123',
      email: 'test@example.com',
      name: 'Test User'
    });
    
    // Create request with auth header
    const request = createMockNextRequest(
      'GET', 
      'http://localhost:3000/api/v1/forms/123/entries?page=1&limit=10', 
      null, 
      { 'Authorization': 'Bearer fake-token' }
    );
    
    // Call the handler
    const response = await GET(request, { params: { id: '123' } });
    
    // Verify response
    expect(response.status).toBe(200);
    const data = await parseNextResponseJson(response);
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('pagination');
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.pagination).toHaveProperty('total');
    expect(data.pagination).toHaveProperty('page');
    expect(data.pagination).toHaveProperty('limit');
    
    // Verify crypto.randomUUID was called
    expect(global.crypto.randomUUID).toHaveBeenCalled();
  });
});

describe('POST /api/v1/forms/[id]/entries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();
    mockGetUserByEmail.mockReset();
  });
  
  it('should return 401 when no authorization header is provided', async () => {
    // Create request without auth header
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/forms/123/entries');
    
    // Call the handler
    const response = await POST(request, { params: { id: '123' } });
    
    // Verify response
    expect(response.status).toBe(401);
    const data = await parseNextResponseJson(response);
    expect(data.code).toBe('UNAUTHORIZED');
  });
  
  it('should return 401 when token verification fails', async () => {
    // Setup supabase auth to return error
    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' }
    });
    
    // Create request with auth header
    const request = createMockNextRequest(
      'POST', 
      'http://localhost:3000/api/v1/forms/123/entries',
      { date_of_sale: '2023-05-15' },
      { 'Authorization': 'Bearer fake-token' }
    );
    
    // Call the handler
    const response = await POST(request, { params: { id: '123' } });
    
    // Verify response
    expect(response.status).toBe(401);
    const data = await parseNextResponseJson(response);
    expect(data.code).toBe('INVALID_TOKEN');
  });
  
  it('should return 400 when required fields are missing', async () => {
    // Setup supabase auth to return user
    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { email: 'test@example.com' } },
      error: null
    });
    
    // Setup user service to return a user
    mockGetUserByEmail.mockResolvedValue({
      id: '123',
      email: 'test@example.com',
      name: 'Test User'
    });
    
    // Create request with incomplete data
    const request = createMockNextRequest(
      'POST', 
      'http://localhost:3000/api/v1/forms/123/entries',
      { date_of_sale: '2023-05-15', vendor_name: 'Test Vendor' }, // Missing other required fields
      { 'Authorization': 'Bearer fake-token' }
    );
    
    // Call the handler
    const response = await POST(request, { params: { id: '123' } });
    
    // Verify response
    expect(response.status).toBe(400);
    const data = await parseNextResponseJson(response);
    expect(data.code).toBe('VALIDATION_ERROR');
  });
  
  it('should create an entry when user is authenticated and data is valid', async () => {
    // Mock crypto.randomUUID
    const originalRandomUUID = global.crypto.randomUUID;
    global.crypto.randomUUID = jest.fn().mockReturnValue('mock-entry-id');
    
    // Setup date for consistent testing
    const mockDate = new Date('2024-01-01T00:00:00Z');
    const origDate = global.Date;
    global.Date = jest.fn(() => mockDate) as any;
    global.Date.UTC = origDate.UTC;
    global.Date.parse = origDate.parse;
    global.Date.now = origDate.now;
    global.Date.prototype.toISOString = jest.fn(() => '2024-01-01T00:00:00.000Z');
    
    // Setup supabase auth to return user
    (supabaseClient.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { email: 'test@example.com' } },
      error: null
    });
    
    // Setup user service to return a user
    mockGetUserByEmail.mockResolvedValue({
      id: '123',
      email: 'test@example.com',
      name: 'Test User'
    });
    
    // Create request with complete data
    const entryData = {
      date_of_sale: '2023-05-15',
      invoice_number: 'INV-001',
      vendor_name: 'Premium Cigars Inc.',
      cigar_description: 'Maduro Robusto',
      number_of_cigars: 25,
      cost_of_cigar: 12.99
    };
    
    const request = createMockNextRequest(
      'POST', 
      'http://localhost:3000/api/v1/forms/123/entries',
      entryData,
      { 'Authorization': 'Bearer fake-token' }
    );
    
    // Call the handler
    const response = await POST(request, { params: { id: '123' } });
    
    // Verify response
    expect(response.status).toBe(201);
    const data = await parseNextResponseJson(response);
    expect(data.id).toBe('mock-entry-id');
    expect(data.form_id).toBe('123');
    expect(data.date_of_sale).toBe(entryData.date_of_sale);
    expect(data.vendor_name).toBe(entryData.vendor_name);
    expect(data.cigar_description).toBe(entryData.cigar_description);
    expect(data.number_of_cigars).toBe(entryData.number_of_cigars);
    expect(data.cost_of_cigar).toBe(entryData.cost_of_cigar);
    expect(data.created_at).toBe('2024-01-01T00:00:00.000Z');
    
    // Restore original implementations
    global.crypto.randomUUID = originalRandomUUID;
    global.Date = origDate;
  });
}); 