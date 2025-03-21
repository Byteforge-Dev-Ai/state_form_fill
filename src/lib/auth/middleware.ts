import { NextRequest, NextResponse } from 'next/server';
import { createUserService } from '../factories/serviceFactory';
import { supabaseClient } from '../supabase/client';

export async function authenticateUser(request: NextRequest) {
  // Extract token from Authorization header
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  if (!token) {
    return null;
  }
  
  try {
    // Verify the token with Supabase Auth
    const { data: { user: authUser }, error } = await supabaseClient.auth.getUser(token);
    
    if (error || !authUser) {
      return null;
    }
    
    // Get the full user profile from our repository
    const userService = createUserService();
    const user = await userService.getUser(authUser.id);
    
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