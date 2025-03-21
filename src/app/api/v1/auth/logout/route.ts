import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase/client';

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
    
    // Sign out from Supabase Auth
    const { error } = await supabaseClient.auth.signOut();
    
    if (error) {
      console.error('Logout error:', error);
      return NextResponse.json(
        {
          status: 500,
          message: 'Error during logout',
          code: 'LOGOUT_ERROR'
        },
        { status: 500 }
      );
    }
    
    // Return success
    return new NextResponse(null, { status: 204 });
    
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