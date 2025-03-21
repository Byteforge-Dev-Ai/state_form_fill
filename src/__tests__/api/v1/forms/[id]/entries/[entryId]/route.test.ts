import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { PUT, DELETE } from '@/app/api/v1/forms/[id]/entries/[entryId]/route';
import { createMockNextRequest, parseNextResponseJson } from '../../../../../../helpers/testUtils';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies
jest.mock('next/server', () => {
  const mockNextResponse = {
    json: jest.fn().mockImplementation((body: any, init?: any) => {
      return {
        status: init?.status || 200,
        json: async () => body
      };
    }),
    next: jest.fn()
  };
  
  // Create a proper constructor for NextResponse
  const MockNextResponse = function(body?: any, init?: any) {
    return {
      status: init?.status || 200,
      json: async () => body || null
    };
  };
  
  return {
    NextRequest: jest.fn(),
    NextResponse: {
      ...mockNextResponse,
      ...MockNextResponse
    }
  };
});

describe('PUT /api/v1/forms/[id]/entries/[entryId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NextResponse.json as jest.Mock).mockClear();
  });
  
  it('should update an entry successfully', async () => {
    // Mock date for consistent testing
    const mockDate = new Date('2024-01-01T00:00:00Z');
    const origDate = global.Date;
    global.Date = jest.fn(() => mockDate) as any;
    global.Date.UTC = origDate.UTC;
    global.Date.parse = origDate.parse;
    global.Date.now = origDate.now;
    global.Date.prototype.toISOString = jest.fn(() => '2024-01-01T00:00:00.000Z');
    
    // Create test data
    const entryData = {
      date_of_sale: '2023-06-15',
      invoice_number: 'INV-002',
      vendor_name: 'Updated Cigars Inc.',
      cigar_description: 'Churchill Natural',
      number_of_cigars: 30,
      cost_of_cigar: 14.99
    };
    
    // Create request
    const request = createMockNextRequest(
      'PUT', 
      'http://localhost:3000/api/v1/forms/123/entries/456', 
      entryData
    );
    
    // Call the handler
    const response = await PUT(request, { params: { id: '123', entryId: '456' } });
    
    // Parse the JSON response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(200);
    expect(data.id).toBe('456');
    expect(data.form_id).toBe('123');
    expect(data.date_of_sale).toBe(entryData.date_of_sale);
    expect(data.invoice_number).toBe(entryData.invoice_number);
    expect(data.vendor_name).toBe(entryData.vendor_name);
    expect(data.cigar_description).toBe(entryData.cigar_description);
    expect(data.number_of_cigars).toBe(entryData.number_of_cigars);
    expect(data.cost_of_cigar).toBe(entryData.cost_of_cigar);
    expect(data.updated_at).toBe('2024-01-01T00:00:00.000Z');
    
    // Restore original Date
    global.Date = origDate;
  });
  
  it('should handle errors during update', async () => {
    // Mock implementation to throw an error
    const originalJson = NextResponse.json;
    (NextResponse.json as jest.Mock).mockImplementationOnce(() => {
      throw new Error('Database error');
    });
    
    // Create request
    const request = createMockNextRequest(
      'PUT', 
      'http://localhost:3000/api/v1/forms/123/entries/456', 
      { 
        date_of_sale: '2023-06-15',
        vendor_name: 'Error Test' 
      }
    );
    
    // Call the handler
    const response = await PUT(request, { params: { id: '123', entryId: '456' } });
    
    // Parse the JSON response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error', 'Failed to update entry');
    
    // Restore the original implementation
    (NextResponse.json as jest.Mock).mockImplementation(originalJson);
  });
});

describe('DELETE /api/v1/forms/[id]/entries/[entryId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should delete an entry successfully', async () => {
    // Create a simple mock for NextResponse.json
    const mockResponse = {
      status: 204
    };
    
    // Mock the NextResponse.json method
    const originalJson = NextResponse.json;
    (NextResponse.json as jest.Mock).mockReturnValueOnce(mockResponse);
    
    // Create request
    const request = createMockNextRequest(
      'DELETE', 
      'http://localhost:3000/api/v1/forms/123/entries/456'
    );
    
    // Call the handler
    const response = await DELETE(request, { params: { id: '123', entryId: '456' } });
    
    // Assertions
    expect(response.status).toBe(204);
    
    // Restore original implementation
    (NextResponse.json as jest.Mock).mockImplementation(originalJson);
  });
  
  it('should handle errors during deletion', async () => {
    // Mock console.error to avoid test output noise
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Create a mock for the error case
    const errorResponse = {
      status: 500,
      json: async () => ({ error: 'Failed to delete entry' })
    };
    
    // Setup NextResponse.json to throw and then return an error response
    const originalJson = NextResponse.json;
    
    // First mock throwing an error, then mock returning the error response
    (NextResponse.json as jest.Mock)
      .mockImplementationOnce(() => {
        throw new Error('Deletion error');
      })
      .mockReturnValueOnce(errorResponse);
    
    // Create request
    const request = createMockNextRequest(
      'DELETE', 
      'http://localhost:3000/api/v1/forms/123/entries/456'
    );
    
    // Call the handler
    const response = await DELETE(request, { params: { id: '123', entryId: '456' } });
    
    // Parse the JSON response
    const data = await parseNextResponseJson(response);
    
    // Assertions
    expect(response.status).toBe(500);
    expect(data).toHaveProperty('error', 'Failed to delete entry');
    
    // Restore original implementation
    (NextResponse.json as jest.Mock).mockImplementation(originalJson);
    (console.error as jest.Mock).mockRestore();
  });
}); 