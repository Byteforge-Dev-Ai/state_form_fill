import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseClient } from '@/lib/supabase/client';

// Validation schema
const refreshSchema = z.object({
  refresh_token: z.string()
});

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refresh authentication token
 *     tags: [Auth]
 *     description: Refresh an expired authentication token using the refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: The refresh token received during login
 *     responses:
 *       200:
 *         description: Token successfully refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: New JWT authentication token
 *                 refresh_token:
 *                   type: string
 *                   description: New refresh token
 *                 expires_at:
 *                   type: string
 *                   format: date-time
 *                   description: New token expiration timestamp
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Invalid or expired refresh token
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validationResult = refreshSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          status: 400,
          message: 'Invalid input data',
          code: 'INVALID_INPUT',
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }
    
    const { refresh_token } = validationResult.data;
    
    // Exchange refresh token for new tokens
    const { data, error } = await supabaseClient.auth.refreshSession({
      refresh_token
    });
    
    if (error) {
      return NextResponse.json(
        {
          status: 401,
          message: 'Invalid or expired refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        },
        { status: 401 }
      );
    }
    
    // Return new tokens
    return NextResponse.json({
      token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      expires_at: data.session?.expires_at
    });
    
  } catch (error) {
    console.error('Token refresh error:', error);
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