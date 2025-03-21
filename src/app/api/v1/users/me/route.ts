import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseClient } from '@/lib/supabase/client';
import { createUserService } from '@/lib/factories/serviceFactory';

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     description: Get current user profile with role information
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                   format: email
 *                 company_name:
 *                   type: string
 *                 role:
 *                   type: string
 *                 auth_provider:
 *                   type: string
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 last_login:
 *                   type: string
 *                   format: date-time
 *                 subscription_status:
 *                   type: string
 *                 subscription_expiry:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     description: Update the current user's profile information
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               company_name:
 *                 type: string
 *                 description: User's company or business name
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 email:
 *                   type: string
 *                   format: email
 *                 company_name:
 *                   type: string
 *                 updated_at:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */

// Validation schema for profile update
const updateProfileSchema = z.object({
  email: z.string().email().optional(),
  company_name: z.string().optional()
});

export async function GET(request: NextRequest) {
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
    
    // Verify token with Supabase
    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !authUser) {
      return NextResponse.json(
        {
          status: 401,
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        },
        { status: 401 }
      );
    }
    
    // Get user data from our database
    const userService = createUserService();
    const user = await userService.getUserByEmail(authUser.email);
    
    if (!user) {
      return NextResponse.json(
        {
          status: 404,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    // Return user profile
    return NextResponse.json({
      id: user.id,
      email: user.email,
      company_name: user.company_name,
      role: user.role,
      auth_provider: user.auth_provider,
      created_at: user.created_at,
      last_login: user.last_login,
      subscription_status: user.subscription_status,
      subscription_expiry: user.subscription_expiry
    });
    
  } catch (error) {
    console.error('Get user profile error:', error);
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

export async function PUT(request: NextRequest) {
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
    
    // Verify token with Supabase
    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !authUser) {
      return NextResponse.json(
        {
          status: 401,
          message: 'Invalid token',
          code: 'INVALID_TOKEN'
        },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validationResult = updateProfileSchema.safeParse(body);
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
    
    const updateData = validationResult.data;
    
    // Get user data from our database
    const userService = createUserService();
    const user = await userService.getUserByEmail(authUser.email);
    
    if (!user) {
      return NextResponse.json(
        {
          status: 404,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    // Update email in Supabase Auth if it has changed
    if (updateData.email && updateData.email !== user.email) {
      const { error: updateAuthError } = await supabaseClient.auth.updateUser({
        email: updateData.email
      });
      
      if (updateAuthError) {
        return NextResponse.json(
          {
            status: 400,
            message: 'Failed to update email',
            code: 'EMAIL_UPDATE_FAILED',
            details: updateAuthError.message
          },
          { status: 400 }
        );
      }
    }
    
    // Update user in our database
    const updatedUser = await userService.updateUser(user.id, updateData);
    
    if (!updatedUser) {
      return NextResponse.json(
        {
          status: 500,
          message: 'Failed to update user profile',
          code: 'UPDATE_FAILED'
        },
        { status: 500 }
      );
    }
    
    // Return updated user data
    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      company_name: updatedUser.company_name,
      updated_at: updatedUser.updated_at
    });
    
  } catch (error) {
    console.error('Update user profile error:', error);
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