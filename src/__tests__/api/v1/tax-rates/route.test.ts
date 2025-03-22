import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { GET, POST } from '@/app/api/v1/tax-rates/route';
import { createMockNextRequest, parseNextResponseJson } from '../../../helpers/testUtils';
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

// Mock permissions middleware
jest.mock('@/lib/auth/permissions', () => ({
  requirePermission: jest.fn().mockImplementation(() => () => true)
}));

// Mock tax rate service and factory
const mockGetCurrent = jest.fn();
const mockGetAll = jest.fn();
const mockCreate = jest.fn();

jest.mock('@/lib/factories/serviceFactory', () => ({
  createTaxRateService: jest.fn().mockImplementation(() => ({
    getCurrent: mockGetCurrent,
    getAll: mockGetAll,
    create: mockCreate
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

describe('GET /api/v1/tax-rates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();
    mockGetCurrent.mockClear();
    mockGetAll.mockClear();
  });
  
  it('should return current and previous tax rates', async () => {
    // Mock tax rate data
    const mockCurrentRate: TaxRate = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      rate: 0.0595,
      multiplier: 1.12,
      effective_from: "2024-01-01",
      effective_to: null,
      created_at: "2023-12-15T14:30:00Z",
      created_by: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
    };
    
    const mockAllRates: TaxRate[] = [
      mockCurrentRate,
      {
        id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        rate: 0.0525,
        multiplier: 1.10,
        effective_from: "2023-01-01",
        effective_to: "2023-12-31",
        created_at: "2022-12-10T09:00:00Z",
        created_by: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
      },
      {
        id: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
        rate: 0.0500,
        multiplier: 1.08,
        effective_from: "2022-01-01",
        effective_to: "2022-12-31",
        created_at: "2021-12-15T11:30:00Z",
        created_by: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
      }
    ];
    
    // Setup mocks
    mockGetCurrent.mockResolvedValueOnce(mockCurrentRate);
    mockGetAll.mockResolvedValueOnce(mockAllRates);
    
    // Create request
    const request = createMockNextRequest('GET', 'http://localhost:3000/api/v1/tax-rates', null, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler
    const response = await GET(request);
    
    // Parse the JSON response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('current_rate');
    expect(data).toHaveProperty('previous_rates');
    expect(Array.isArray(data.previous_rates)).toBe(true);
    expect(data.previous_rates.length).toBe(2);
    
    // Verify service calls
    expect(mockGetCurrent).toHaveBeenCalledTimes(1);
    expect(mockGetAll).toHaveBeenCalledTimes(1);
  });
});

describe('POST /api/v1/tax-rates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();
    mockCreate.mockClear();
  });
  
  it('should create a new tax rate', async () => {
    // Test data
    const taxRateData = {
      rate: 0.0625,
      multiplier: 1.15,
      effective_from: '2025-01-01'
    };
    
    const mockCreatedRate: TaxRate = {
      id: "34e7b810-9dad-11d1-80b4-00c04fd430c8",
      rate: taxRateData.rate,
      multiplier: taxRateData.multiplier,
      effective_from: taxRateData.effective_from,
      effective_to: null,
      created_at: "2024-01-01T00:00:00.000Z",
      created_by: "user-123"
    };
    
    // Setup mock
    mockCreate.mockResolvedValueOnce(mockCreatedRate);
    
    // Create request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/tax-rates', taxRateData, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse the JSON response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(201);
    expect(data).toEqual(mockCreatedRate);
    
    // Verify service call
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith('user-123', taxRateData);
  });
  
  it('should return 400 if missing required fields', async () => {
    // Test with missing data
    const incompleteData = {
      rate: 0.0625 // missing multiplier and effective_from
    };
    
    // Create request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/tax-rates', incompleteData, {
      authorization: 'Bearer valid-token'
    });
    
    // Call the handler
    const response = await POST(request);
    
    // Parse the JSON response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(400);
    expect(data.code).toBe('MISSING_REQUIRED_FIELDS');
    
    // Verify service was not called
    expect(mockCreate).not.toHaveBeenCalled();
  });
}); 