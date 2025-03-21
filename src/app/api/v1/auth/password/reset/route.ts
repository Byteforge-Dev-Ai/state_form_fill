import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseClient } from '@/lib/supabase/client';

// Validation schema
const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters long')
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validationResult = resetPasswordSchema.safeParse(body);
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
    
    const { token, password } = validationResult.data;
    
    // Update password using Supabase Auth
    const { error } = await supabaseClient.auth.updateUser({
      password
    }, {
      accessToken: token
    });
    
    if (error) {
      console.error('Password reset error:', error);
      
      // Common errors that can be user-friendly
      if (error.status === 401) {
        return NextResponse.json(
          {
            status: 401,
            message: 'Invalid or expired reset token',
            code: 'INVALID_TOKEN'
          },
          { status: 401 }
        );
      }
      
      if (error.message.includes('Password')) {
        return NextResponse.json(
          {
            status: 400,
            message: error.message,
            code: 'PASSWORD_POLICY_FAILED'
          },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        {
          status: 400,
          message: 'Failed to reset password',
          code: 'RESET_FAILED'
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      message: 'Password has been reset'
    });
    
  } catch (error) {
    console.error('Password reset error:', error);
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