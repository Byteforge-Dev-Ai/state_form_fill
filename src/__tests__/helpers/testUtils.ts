import { createMocks } from 'node-mocks-http';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

/**
 * Helper function to mock Next.js API route requests and responses
 */
export function mockNextApiRequest(
  method: string = 'GET',
  body: any = {},
  query: any = {},
  headers: Record<string, string> = {}
) {
  const { req, res } = createMocks({
    method: method as any,
    body,
    query,
    headers,
  });

  return { req, res };
}

/**
 * Create a mock NextRequest for App Router API route tests
 */
export function createMockNextRequest(
  method: string = 'GET',
  url: string = 'http://localhost:3000',
  body: any = null,
  headers: HeadersInit = {}
): NextRequest {
  // Create the headers
  const headersObj = new Headers(headers);

  // Create the Request object
  const request = new Request(url, {
    method: method as RequestInit['method'],
    headers: headersObj,
    body: body ? JSON.stringify(body) : null,
  });

  // Cast to NextRequest (not all properties will be available but sufficient for testing)
  return request as unknown as NextRequest;
}

/**
 * Parse a NextResponse's JSON data
 */
export async function parseNextResponseJson(response: NextResponse): Promise<any> {
  return await response.json();
}

/**
 * Mock Supabase client
 */
export const mockSupabaseClient = {
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    refreshSession: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
  },
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  single: jest.fn(),
  insert: jest.fn(),
  update: jest.fn(),
}; 