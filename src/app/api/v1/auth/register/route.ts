import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUserService } from '@/lib/services/userService';
import { supabaseClient } from '@/lib/supabase/client';

// Validation schema
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  company_name: z.string().optional(),
  role: z.enum(['admin', 'vendor', 'readonly']).optional().default('vendor')
});

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     description: Create a new user account with role-based permissions
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - company_name
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password (min 8 characters)
 *                 example: password123
 *               company_name:
 *                 type: string
 *                 description: User's company or business name
 *                 example: Example Cigar Co.
 *               role:
 *                 type: string
 *                 description: User role (defaults to "vendor")
 *                 enum: [admin, vendor, readonly]
 *                 example: vendor
 *     responses:
 *       201:
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                       description: User ID
 *                     email:
 *                       type: string
 *                       format: email
 *                       description: User's email
 *                     company_name:
 *                       type: string
 *                       description: User's company name
 *                     role:
 *                       type: string
 *                       description: User's role
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                       description: Account creation timestamp
 *                 token:
 *                   type: string
 *                   description: JWT authentication token
 *                 refresh_token:
 *                   type: string
 *                   description: Refresh token for token renewal
 *                 expires_at:
 *                   type: string
 *                   format: date-time
 *                   description: Token expiration timestamp
 *       400:
 *         description: Invalid request data
 *       409:
 *         description: Email already in use
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
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
    
    const { email, password, company_name, role } = validationResult.data;
    
    // Create auth user in Supabase
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
      email,
      password,
    });
    
    if (authError) {
      return NextResponse.json(
        {
          status: 400,
          message: authError.message,
          code: 'AUTH_ERROR'
        },
        { status: 400 }
      );
    }
    
    // Create user record in our database
    const userService = createUserService();
    
    const user = await userService.createUser({
      email,
      company_name,
      role,
      auth_provider: 'email',
      provider_user_id: authData.user?.id
    });
    
    // Sign in to get JWT tokens
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (sessionError) {
      return NextResponse.json(
        {
          status: 500,
          message: 'User created but failed to generate session',
          code: 'SESSION_ERROR'
        },
        { status: 500 }
      );
    }
    
    // Return user data with tokens
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          company_name: user.company_name,
          role: user.role,
          created_at: user.created_at
        },
        token: sessionData.session?.access_token,
        refresh_token: sessionData.session?.refresh_token,
        expires_at: sessionData.session?.expires_at
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Registration error:', error);
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