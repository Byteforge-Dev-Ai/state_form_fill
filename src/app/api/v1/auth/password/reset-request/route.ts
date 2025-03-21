import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createUserService } from '@/lib/factories/serviceFactory';
import { supabaseClient } from '@/lib/supabase/client';

// Validation schema
const resetRequestSchema = z.object({
  email: z.string().email()
});

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    
    // Validate input
    const validationResult = resetRequestSchema.safeParse(body);
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
    
    const { email } = validationResult.data;
    
    // Check if the user exists in our database first
    const userService = createUserService();
    const user = await userService.getUserByEmail(email);
    
    // Even if user doesn't exist, we don't reveal that for security reasons
    // We just proceed with the reset request which will silently fail on Supabase's end
    
    // Send password reset email via Supabase Auth
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
    });
    
    if (error) {
      console.error('Password reset request error:', error);
      // Don't expose error details to client for security
    }
    
    // Always return success for security reasons (prevents email enumeration)
    return NextResponse.json({
      message: 'Password reset email sent if account exists'
    });
    
  } catch (error) {
    console.error('Password reset request error:', error);
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