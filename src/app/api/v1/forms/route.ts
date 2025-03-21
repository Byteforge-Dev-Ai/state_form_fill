import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase/client';
import { createFormService, createUserService } from '@/lib/factories/serviceFactory';
import { createFormSchema } from '@/lib/validators/formValidator';
import { ZodError } from 'zod';

/**
 * @swagger
 * /api/v1/forms:
 *   get:
 *     summary: List all forms
 *     tags: [Forms]
 *     description: List all forms for current user with advanced filtering
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: status
 *         in: query
 *         required: false
 *         description: Filter by status
 *         schema:
 *           type: string
 *           enum: [draft, in_progress, submitted, approved, rejected]
 *       - name: start_date
 *         in: query
 *         required: false
 *         description: Filter by period starting date
 *         schema:
 *           type: string
 *           format: date
 *       - name: end_date
 *         in: query
 *         required: false
 *         description: Filter by period ending date
 *         schema:
 *           type: string
 *           format: date
 *       - name: sort
 *         in: query
 *         required: false
 *         description: Field to sort by
 *         schema:
 *           type: string
 *           enum: [date_range_start, date_range_end, created_at, status]
 *       - name: order
 *         in: query
 *         required: false
 *         description: Sort order (asc or desc)
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *       - name: page
 *         in: query
 *         required: false
 *         description: Page number
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         description: Number of items per page
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of forms with pagination
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function GET(request: NextRequest) {
  try {
    console.log('=== Forms GET Request ===');
    console.log('URL:', request.url);
    
    // Get authorization header
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (!authHeader) {
      console.log('No auth header found');
      return NextResponse.json(
        { status: 401, message: 'Unauthorized', code: 'UNAUTHORIZED' },
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
        { status: 401, message: 'Invalid token', code: 'INVALID_TOKEN' },
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
        { status: 400, message: 'User email is missing', code: 'EMAIL_MISSING' },
        { status: 400 }
      );
    }
    
    const user = await userService.getUserByEmail(authUser.email);
    
    if (!user) {
      console.log('User not found by email:', authUser.email);
      return NextResponse.json(
        { status: 404, message: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    console.log('User found by email:', user.id, user.email, user.role);

    // Parse query parameters
    const url = new URL(request.url);
    const status = url.searchParams.get('status') || undefined;
    const startDate = url.searchParams.get('start_date') || undefined;
    const endDate = url.searchParams.get('end_date') || undefined;
    const sort = url.searchParams.get('sort') || undefined;
    const order = url.searchParams.get('order') as 'asc' | 'desc' | undefined;
    const page = url.searchParams.get('page') ? parseInt(url.searchParams.get('page')!) : undefined;
    const limit = url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined;

    // Get forms for the user
    const formService = createFormService();
    const result = await formService.getAllByUserId(user.id, {
      status,
      startDate,
      endDate,
      sort,
      order,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch forms:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { status: 500, message: 'Failed to fetch forms', code: 'FORM_FETCH_FAILED' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/forms:
 *   post:
 *     summary: Create a new form
 *     tags: [Forms]
 *     description: Create a new form
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_identifier_id
 *               - date_range_start
 *               - date_range_end
 *             properties:
 *               user_identifier_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user identifier
 *               date_range_start:
 *                 type: string
 *                 format: date
 *                 description: Start date of the reporting period
 *               date_range_end:
 *                 type: string
 *                 format: date
 *                 description: End date of the reporting period
 *     responses:
 *       201:
 *         description: Form created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { status: 401, message: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    
    // Extract token from header
    const token = authHeader.replace('Bearer ', '');
    
    // Verify token with Supabase
    const { data: { user: authUser }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !authUser) {
      return NextResponse.json(
        { status: 401, message: 'Invalid token', code: 'INVALID_TOKEN' },
        { status: 401 }
      );
    }
    
    // Get user data from our database using email instead of ID
    const userService = createUserService();
    
    if (!authUser.email) {
      return NextResponse.json(
        { status: 400, message: 'User email is missing', code: 'EMAIL_MISSING' },
        { status: 400 }
      );
    }
    
    const user = await userService.getUserByEmail(authUser.email);
    
    if (!user) {
      return NextResponse.json(
        { status: 404, message: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    
    // Validate request body
    const validatedData = createFormSchema.parse(body);

    // Create form
    const formService = createFormService();
    const newForm = await formService.create(user.id, validatedData);

    return NextResponse.json(newForm, { status: 201 });
  } catch (error) {
    console.error('Failed to create form:', error);

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
      { status: 500, message: 'Failed to create form', code: 'FORM_CREATE_FAILED' },
      { status: 500 }
    );
  }
} 