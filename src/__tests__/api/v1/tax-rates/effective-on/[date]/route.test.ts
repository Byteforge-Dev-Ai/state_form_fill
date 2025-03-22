import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { GET } from '@/app/api/v1/tax-rates/effective-on/[date]/route';
import { createMockNextRequest, parseNextResponseJson } from '../../../../../helpers/testUtils';
import { NextResponse } from 'next/server';
import { TaxRate } from '@/types/database';

// Mock authentication middleware
jest.mock('@/lib/auth/middleware', () => ({
  authenticateUser: jest.fn().mockImplementation(() => Promise.resolve({
    id: 'user-123',
    email: 'test@example.com',
    role: 'admin'
  }))
}));

// Mock tax rate service and factory
const mockGetEffectiveOnDate = jest.fn();

jest.mock('@/lib/factories/serviceFactory', () => ({
  createTaxRateService: jest.fn().mockImplementation(() => ({
    getEffectiveOnDate: mockGetEffectiveOnDate
  }))
}));

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

describe('GET /api/v1/tax-rates/effective-on/[date]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();
    mockGetEffectiveOnDate.mockClear();
  });
  
  it('should return a tax rate effective on the given date', async () => {
    // Mock tax rate data
    const mockTaxRate: TaxRate = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      rate: 0.0595,
      multiplier: 1.12,
      effective_from: "2023-01-01",
      effective_to: "2023-12-31",
      created_at: "2022-12-15T14:30:00Z",
      created_by: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
    };
    
    // Setup mock
    mockGetEffectiveOnDate.mockResolvedValueOnce(mockTaxRate);
    
    // Create request
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/tax-rates/effective-on/2023-06-15', null, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler with params
    const response = await GET(request, { params: { date: '2023-06-15' } });
    
    // Parse the JSON response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(data).toEqual(mockTaxRate);
    
    // Verify service call
    expect(mockGetEffectiveOnDate).toHaveBeenCalledTimes(1);
    expect(mockGetEffectiveOnDate).toHaveBeenCalledWith('2023-06-15');
  });
  
  it('should return 400 if date format is invalid', async () => {
    // Create request with invalid date format
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/tax-rates/effective-on/invalid-date', null, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler with params
    const response = await GET(request, { params: { date: 'invalid-date' } });
    
    // Parse the JSON response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(400);
    expect(data.code).toBe('INVALID_DATE_FORMAT');
    
    // Verify service was not called
    expect(mockGetEffectiveOnDate).not.toHaveBeenCalled();
  });
  
  it('should return 404 if no tax rate found for the date', async () => {
    // Setup mock to return null (no tax rate found)
    mockGetEffectiveOnDate.mockResolvedValueOnce(null);
    
    // Create request
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/tax-rates/effective-on/2020-01-01', null, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler with params
    const response = await GET(request, { params: { date: '2020-01-01' } });
    
    // Parse the JSON response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(404);
    expect(data.code).toBe('TAX_RATE_NOT_FOUND');
    
    // Verify service call was made
    expect(mockGetEffectiveOnDate).toHaveBeenCalledTimes(1);
    expect(mockGetEffectiveOnDate).toHaveBeenCalledWith('2020-01-01');
  });
}); 