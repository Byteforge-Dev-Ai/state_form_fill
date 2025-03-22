import { NextRequest, NextResponse } from 'next/server';
import { createUserService } from '../factories/serviceFactory';
import { supabaseClient, getServiceSupabase } from '../supabase/client';

export async function authenticateUser(request: NextRequest) {
  console.log('=== Authentication Debug ===');
  console.log('URL:', request.url);
  
  // Log headers safely without using spread operator
  const headersObj: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headersObj[key] = value;
  });
  console.log('Headers:', JSON.stringify(headersObj));
  
  // Extract token from Authorization header - check both casing options
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  console.log('Auth header found:', !!authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No valid auth header found');
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    console.log('No token found in auth header');
    return null;
  }
  
  try {
    console.log('Verifying token with Supabase...');
    // Step 1: Verify the token with Supabase Auth
    const { data: { user: authUser }, error } = await supabaseClient.auth.getUser(token);
    
    console.log('Auth response:', JSON.stringify({
      user: authUser ? {
        id: authUser.id,
        email: authUser.email,
        app_metadata: authUser.app_metadata,
        user_metadata: authUser.user_metadata
      } : null,
      error: error ? { message: error.message, status: error.status } : null
    }));
    
    if (error) {
      console.log('Supabase auth error:', error);
      return null;
    }
    
    if (!authUser) {
      console.log('No auth user found');
      return null;
    }
    
    // Skip admin API check for now
    
    console.log('Auth user found:', authUser.id);
    
    // Get user data from our database using email instead of ID
    const userService = createUserService();
    
    console.log('Attempting to get user by email as primary method');
    if (!authUser.email) {
      console.log('No email found in token, unable to look up user');
      return null;
    }
    
    const userByEmail = await userService.getUserByEmail(authUser.email);
    
    if (!userByEmail) {
      console.log('User not found by email, trying by ID as fallback');
      const userById = await userService.getUser(authUser.id);
      
      if (!userById) {
        console.log('User not found by ID either');
        return null;
      }
      
      console.log('User found by ID:', userById.id, userById.email, userById.role);
      return userById;
    }
    
    console.log('User found by email:', userByEmail.id, userByEmail.email, userByEmail.role);
    return userByEmail;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
} 