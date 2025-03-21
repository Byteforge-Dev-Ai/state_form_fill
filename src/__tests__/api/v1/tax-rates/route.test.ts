import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { GET, POST } from '@/app/api/v1/tax-rates/route';
import { createMockNextRequest, parseNextResponseJson } from '../../../helpers/testUtils';
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

describe('GET /api/v1/tax-rates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();
  });
  
  it('should return current and previous tax rates', async () => {
    // Call the handler
    const response = await GET();
    
    // Parse the JSON response
    const data = await parseNextResponseJson(response);
    
    // Assertions for structure and data types
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('current_rate');
    expect(data).toHaveProperty('previous_rates');
    expect(Array.isArray(data.previous_rates)).toBe(true);
    
    // Assertions for current rate
    expect(data.current_rate).toHaveProperty('id');
    expect(data.current_rate).toHaveProperty('rate');
    expect(data.current_rate).toHaveProperty('multiplier');
    expect(data.current_rate).toHaveProperty('effective_from');
    expect(data.current_rate).toHaveProperty('effective_to');
    expect(data.current_rate).toHaveProperty('created_at');
    expect(data.current_rate).toHaveProperty('created_by');
    
    // Assertions for data types
    expect(typeof data.current_rate.id).toBe('string');
    expect(typeof data.current_rate.rate).toBe('number');
    expect(typeof data.current_rate.multiplier).toBe('number');
    expect(data.current_rate.effective_to).toBeNull();
  });
});

describe('POST /api/v1/tax-rates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();
  });
  
  it('should create a new tax rate', async () => {
    // Mock date for consistent testing
    const mockDate = new Date('2024-01-01T00:00:00Z');
    const origDate = global.Date;
    global.Date = jest.fn(() => mockDate) as any;
    global.Date.UTC = origDate.UTC;
    global.Date.parse = origDate.parse;
    global.Date.now = origDate.now;
    
    // Create test data
    const taxRateData = {
      rate: 0.0625,
      multiplier: 1.15,
      effective_from: '2025-01-01'
    };
    
    // Create request
    const request = createMockNextRequest('POST', 'http://localhost:3000/api/v1/tax-rates', taxRateData);
    
    // Call the handler
    const response = await POST(request);
    
    // Parse the JSON response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(201);
    expect(data).toHaveProperty('id');
    expect(data.rate).toBe(taxRateData.rate);
    expect(data.multiplier).toBe(taxRateData.multiplier);
    expect(data.effective_from).toBe(taxRateData.effective_from);
    expect(data.effective_to).toBeNull();
    expect(data.created_at).toBe('2024-01-01T00:00:00.000Z');
    expect(data).toHaveProperty('created_by');
    
    // Restore original Date
    global.Date = origDate;
  });
}); 