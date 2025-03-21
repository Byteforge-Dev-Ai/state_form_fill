import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient, getServiceSupabase } from '@/lib/supabase/client';

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     description: End a user session and invalidate tokens
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       204:
 *         description: Successfully logged out
 *       401:
 *         description: Unauthorized
 */
export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        {
          status: 401,
          message: 'Unauthorized',
          code: 'UNAUTHORIZED'
        },
        { status: 401 }
      );
    }
    
    // Extract token from header
    const token = authHeader.replace('Bearer ', '');
    
    try {
      // First verify the token to get the user
      const { data: { user }, error: verifyError } = await supabaseClient.auth.getUser(token);
      
      if (verifyError || !user) {
        return NextResponse.json(
          {
            status: 401,
            message: 'Invalid token',
            code: 'INVALID_TOKEN'
          },
          { status: 401 }
        );
      }
      
      // Use the admin service role to revoke all sessions for this user
      // This is a stronger approach than relying on client-side signOut
      const adminClient = getServiceSupabase();
      
      // Sign out all sessions for this user (stronger than just the current session)
      const { error } = await adminClient.auth.admin.signOut(token);
      
      if (error) {
        console.error('Admin logout error:', error);
        return NextResponse.json(
          {
            status: 500,
            message: 'Error during logout',
            code: 'LOGOUT_ERROR'
          },
          { status: 500 }
        );
      }
      
      // Return success with status 200 instead of 204 to ensure body is sent
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (tokenError) {
      console.error('Token verification error:', tokenError);
      return NextResponse.json(
        {
          status: 401,
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      {
        status: 500,
        message: 'Internal server error',
        code: 'SERVER_ERROR'
      },
      { status: 500 }
    );
  }
} 