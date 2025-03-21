import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUserService } from '@/lib/factories/serviceFactory';
import { supabaseClient } from '@/lib/supabase/client';

// Validation schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validationResult = loginSchema.safeParse(body);
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
    
    const { email, password } = validationResult.data;
    
    // Sign in with Supabase Auth
    const { data: sessionData, error: sessionError } = await supabaseClient.auth.signInWithPassword({
      email,
      password
    });
    
    if (sessionError) {
      return NextResponse.json(
        {
          status: 401,
          message: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }
    
    // Get user data from our database
    const userService = createUserService();
    const user = await userService.getUserByEmail(email);
    
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
    
    // Update last login timestamp
    await userService.logUserLogin(user.id);
    
    // Return user data with tokens
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        company_name: user.company_name,
        role: user.role,
        last_login: new Date().toISOString()
      },
      token: sessionData.session?.access_token,
      refresh_token: sessionData.session?.refresh_token,
      expires_at: sessionData.session?.expires_at
    });
    
  } catch (error) {
    console.error('Login error:', error);
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