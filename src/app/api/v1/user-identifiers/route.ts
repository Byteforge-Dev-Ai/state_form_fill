import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase/client';
import { createUserService, createUserIdentifierService } from '@/lib/factories/serviceFactory';
import { createUserIdentifierSchema, CreateUserIdentifierInput } from '@/lib/validators/userIdentifierValidator';
import { ZodError } from 'zod';

export async function GET(request: NextRequest) {
  console.log('=== User-Identifiers GET Request ===');
  console.log('URL:', request.url);
  
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (!authHeader) {
      console.log('No auth header found');
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
    console.log('Token extracted successfully');
    
    // Verify token with Supabase
    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !authUser) {
      console.log('Invalid token or no auth user', authError);
      return NextResponse.json(
        { 
          status: 401, 
          message: 'Invalid token', 
          code: 'INVALID_TOKEN' 
        },
        { status: 401 }
      );
    }
    
    console.log('Auth user found:', authUser.id);
    console.log('Auth user email:', authUser.email);
    
    // Get user data from our database using email instead of ID
    const userService = createUserService();
    
    if (!authUser.email) {
      console.log('User email is missing');
      return NextResponse.json(
        {
          status: 400,
          message: 'User email is missing',
          code: 'EMAIL_MISSING'
        },
        { status: 400 }
      );
    }
    
    const user = await userService.getUserByEmail(authUser.email);
    
    if (!user) {
      console.log('User not found by email:', authUser.email);
      return NextResponse.json(
        {
          status: 404,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        },
        { status: 404 }
      );
    }
    
    console.log('User found by email:', user.id, user.email, user.role);
    console.log('Fetching user identifiers for user ID:', user.id);
    
    // Get all user identifiers for the authenticated user
    const userIdentifierService = createUserIdentifierService();
    const userIdentifiers = await userIdentifierService.getAllByUserId(user.id);
    console.log('Found user identifiers:', userIdentifiers.length);
    
    return NextResponse.json(userIdentifiers);
  } catch (error) {
    console.error('Failed to fetch user identifiers:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { 
        status: 500, 
        message: 'Failed to fetch user identifiers', 
        code: 'USER_IDENTIFIER_FETCH_FAILED' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
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
    
    // Get user data from our database using email instead of ID
    const userService = createUserService();
    
    if (!authUser.email) {
      return NextResponse.json(
        {
          status: 400,
          message: 'User email is missing',
          code: 'EMAIL_MISSING'
        },
        { status: 400 }
      );
    }
    
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createUserIdentifierSchema.parse(body);

    // Create new user identifier
    const userIdentifierService = createUserIdentifierService();
    const newUserIdentifier = await userIdentifierService.create(user.id, validatedData);

    return NextResponse.json(newUserIdentifier, { status: 201 });
  } catch (error) {
    console.error('Failed to create user identifier:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          status: 400, 
          message: 'Validation error', 
          code: 'VALIDATION_ERROR',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        status: 500, 
        message: 'Failed to create user identifier', 
        code: 'USER_IDENTIFIER_CREATE_FAILED' 
      },
      { status: 500 }
    );
  }
} 