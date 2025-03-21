import { NextRequest, NextResponse } from 'next/server';
import { createUserService } from '../factories/serviceFactory';
import { supabaseClient } from '../supabase/client';

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
    // Verify the token with Supabase Auth
    const { data: { user: authUser }, error } = await supabaseClient.auth.getUser(token);
    
    if (error) {
      console.log('Supabase auth error:', error);
      return null;
    }
    
    if (!authUser) {
      console.log('No auth user found');
      return null;
    }
    
    console.log('Auth user found:', authUser.id);
    
    // Get the full user profile from our repository
    const userService = createUserService();
    const user = await userService.getUser(authUser.id);
    
    if (!user) {
      console.log('User not found in database');
    } else {
      console.log('User found:', user.id, user.email, user.role);
    }
    
    return user;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function requirePermission(permission: string) {
  return async (request: NextRequest) => {
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { status: 401, message: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    
    // Implement role-based permission check
    // For simplicity, we're just checking roles directly
    // In production, this would connect to a proper permission system
    const rolePermissions: Record<string, string[]> = {
      admin: ['*'],
      vendor: ['forms:read', 'forms:write', 'forms:generate', 'forms:submit'],
      readonly: ['forms:read']
    };
    
    const userPermissions = rolePermissions[user.role] || [];
    const hasPermission = userPermissions.includes('*') || userPermissions.includes(permission);
    
    if (!hasPermission) {
      return NextResponse.json(
        { status: 403, message: 'Forbidden', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }
    
    return NextResponse.next();
  };
} 