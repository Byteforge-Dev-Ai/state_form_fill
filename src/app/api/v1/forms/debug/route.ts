import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth/middleware';
import { supabaseClient } from '@/lib/supabase/client';

/**
 * @swagger
 * /api/v1/forms/debug:
 *   get:
 *     summary: Debug authentication issues
 *     tags: [Forms]
 *     description: Provides detailed information about the authentication process
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Debug information
 *       401:
 *         description: Unauthorized
 */
export async function GET(request: NextRequest) {
  try {
    // Capture headers safely for debugging
    const headersObj: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headersObj[key] = value;
    });
    
    // Extract token from Authorization header
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    let token = null;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    
    // Try to authenticate the user
    const user = await authenticateUser(request);
    
    // Try a basic Supabase operation to test connection
    let supabaseTest = null;
    try {
      const { data, error } = await supabaseClient.auth.getSession();
      supabaseTest = {
        session: data.session ? true : false,
        error: error ? error.message : null
      };
    } catch (e) {
      supabaseTest = {
        error: `Supabase error: ${e instanceof Error ? e.message : String(e)}`
      };
    }
    
    // Return status and debug info
    return NextResponse.json({
      auth_status: user ? 'authenticated' : 'unauthenticated',
      user_id: user?.id || null,
      user_email: user?.email || null,
      user_role: user?.role || null,
      token_present: !!token,
      token_length: token ? token.length : 0,
      headers: {
        authorization: headersObj.authorization || headersObj.Authorization || null,
        'content-type': headersObj['content-type'] || null
      },
      supabase_test: supabaseTest
    });
  } catch (error) {
    console.error('Auth debug error:', error);
    return NextResponse.json(
      { 
        status: 500, 
        message: 'Auth debug error', 
        error: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 