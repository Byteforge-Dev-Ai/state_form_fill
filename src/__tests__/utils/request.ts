import { NextRequest } from 'next/server';

/**
 * Create a mock Next.js request for testing API routes
 * 
 * @param method - HTTP method ('GET', 'POST', etc.)
 * @param url - Request URL
 * @param body - Optional request body
 * @param headers - Optional request headers
 * @returns Mock NextRequest instance
 */
export function createMockNextRequest(
  method: string, 
  url: string, 
  body: any = null,
  headers: Record<string, string> = {}
): NextRequest {
  // Create URL instance
  const requestUrl = new URL(url);
  
  // Setup request init
  const requestInit: RequestInit = {
    method,
    headers: new Headers(headers),
  };
  
  // Add body if provided
  if (body !== null) {
    requestInit.body = JSON.stringify(body);
  }
  
  // Create the Request instance
  const request = new Request(requestUrl, requestInit);
  
  // Create NextRequest
  const nextRequest = new NextRequest(request, {
    ip: '127.0.0.1',
    geo: {
      city: 'Test City',
      country: 'Test Country',
      region: 'Test Region'
    },
  });
  
  return nextRequest;
}

/**
 * Parse JSON response from Next.js API route handler
 * 
 * @param response - Response from NextRequest handler
 * @returns Parsed JSON data
 */
export async function parseNextResponseJson(response: Response): Promise<any> {
  const text = await response.text();
  
  try {
    return JSON.parse(text);
  } catch (e) {
    return text;
  }
} 