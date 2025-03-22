import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from './middleware';

/**
 * Middleware to check if the authenticated user has the required permission
 * @param permission The permission string to check for
 * @returns A middleware function that checks if the user has the permission
 */
export function requirePermission(permission: string) {
  return async (req: NextRequest, res: NextResponse | null, next: () => boolean) => {
    // Authenticate the user first
    const user = await authenticateUser(req);
    if (!user) {
      if (res) {
        return NextResponse.json(
          { 
            status: 401, 
            message: 'Unauthorized', 
            code: 'UNAUTHORIZED' 
          },
          { status: 401 }
        );
      } else {
        return false;
      }
    }

    // For admin users, grant all permissions
    if (user.role === 'admin') {
      return next();
    }

    // Map of roles to their permissions
    const rolePermissions: Record<string, string[]> = {
      admin: ['users:read', 'users:write', 'forms:read', 'forms:write', 'forms:delete', 'forms:submit', 'forms:generate', 
              'entries:read', 'entries:write', 'entries:delete', 'identifiers:read', 'identifiers:write', 
              'payments:read', 'payments:process', 'tax:read', 'tax:write'],
      vendor: ['forms:read', 'forms:write', 'forms:delete', 'forms:submit', 'forms:generate',
               'entries:read', 'entries:write', 'entries:delete', 'identifiers:read', 'identifiers:write',
               'payments:read', 'tax:read'],
      readonly: ['forms:read', 'entries:read', 'identifiers:read', 'payments:read', 'tax:read']
    };

    // Check if the user's role has the required permission
    const userPermissions = rolePermissions[user.role] || [];
    
    if (userPermissions.includes(permission)) {
      return next();
    }

    // Permission denied
    if (res) {
      return NextResponse.json(
        { 
          status: 403, 
          message: 'Forbidden - Insufficient permissions', 
          code: 'FORBIDDEN' 
        },
        { status: 403 }
      );
    } else {
      return false;
    }
  };
} 