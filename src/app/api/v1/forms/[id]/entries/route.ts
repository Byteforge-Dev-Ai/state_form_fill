import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase/client';
import { createUserService } from '@/lib/factories/serviceFactory';

/**
 * @swagger
 * /api/v1/forms/{id}/entries:
 *   get:
 *     summary: Get all entries for a form
 *     tags: [Entries]
 *     description: Get all entries for a form with optional filtering and sorting
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the form
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: vendor
 *         in: query
 *         required: false
 *         description: Filter by vendor name
 *         schema:
 *           type: string
 *       - name: start_date
 *         in: query
 *         required: false
 *         description: Filter by sale date (start)
 *         schema:
 *           type: string
 *           format: date
 *       - name: end_date
 *         in: query
 *         required: false
 *         description: Filter by sale date (end)
 *         schema:
 *           type: string
 *           format: date
 *       - name: sort
 *         in: query
 *         required: false
 *         description: Field to sort by
 *         schema:
 *           type: string
 *           enum: [date_of_sale, vendor_name, cost_of_cigar, number_of_cigars, tax_amount, created_at]
 *       - name: order
 *         in: query
 *         required: false
 *         description: Sort order (asc or desc)
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *     responses:
 *       200:
 *         description: List of sales entries
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Form not found
 *       500:
 *         description: Server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Missing or invalid Authorization header');
      return NextResponse.json(
        { 
          status: 401, 
          message: 'Authentication required', 
          code: 'AUTH_REQUIRED' 
        },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const userService = createUserService();
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    
    console.log('Supabase auth response:', { user, error });
    
    if (error || !user) {
      console.log('Token verification failed:', error);
      return NextResponse.json(
        { 
          status: 401, 
          message: 'Invalid token', 
          code: 'INVALID_TOKEN' 
        },
        { status: 401 }
      );
    }
    
    // Get user by email
    const email = user.email;
    if (!email) {
      console.log('No email found in the token');
      return NextResponse.json(
        { 
          status: 401, 
          message: 'Invalid user data', 
          code: 'INVALID_USER_DATA' 
        },
        { status: 401 }
      );
    }
    
    const authenticatedUser = await userService.getUserByEmail(email);
    
    if (!authenticatedUser) {
      console.log('User not found with email:', email);
      return NextResponse.json(
        { 
          status: 401, 
          message: 'User not found', 
          code: 'USER_NOT_FOUND' 
        },
        { status: 401 }
      );
    }
    
    console.log('User authenticated:', authenticatedUser);
    
    // Verify that the form exists and user has access to it
    // In a real implementation, you would check if the form belongs to the user
    const formId = params.id;
    
    // For now, let's generate some mock entries data
    const mockEntries = [
      {
        id: crypto.randomUUID(),
        form_id: formId,
        date_of_sale: '2023-05-15',
        invoice_number: 'INV-001',
        vendor_name: 'Premium Cigars Inc.',
        cigar_description: 'Maduro Robusto',
        number_of_cigars: 25,
        cost_of_cigar: 12.99,
        subtotal: 324.75,
        tax_rate: 0.0595,
        tax_amount: 19.32,
        entry_index: 1,
        created_at: '2023-05-15T10:30:00.000Z'
      },
      {
        id: crypto.randomUUID(),
        form_id: formId,
        date_of_sale: '2023-05-20',
        invoice_number: 'INV-002',
        vendor_name: 'Habana Imports',
        cigar_description: 'Connecticut Churchill',
        number_of_cigars: 15,
        cost_of_cigar: 15.49,
        subtotal: 232.35,
        tax_rate: 0.0595,
        tax_amount: 13.82,
        entry_index: 2,
        created_at: '2023-05-20T14:45:00.000Z'
      }
    ];
    
    // Apply any query parameters for filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    
    // Pagination calculation
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntries = mockEntries.slice(startIndex, endIndex);
    
    return NextResponse.json({
      data: paginatedEntries,
      pagination: {
        total: mockEntries.length,
        page,
        limit,
        pages: Math.ceil(mockEntries.length / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching entries:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { 
        status: 500, 
        message: 'Failed to fetch entries', 
        code: 'ENTRIES_FETCH_FAILED' 
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/forms/{id}/entries:
 *   post:
 *     summary: Add a new entry
 *     tags: [Entries]
 *     description: Add a new entry with automatic tax calculation
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the form
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [date_of_sale, vendor_name, cigar_description, number_of_cigars, cost_of_cigar]
 *             properties:
 *               date_of_sale:
 *                 type: string
 *                 format: date
 *               invoice_number:
 *                 type: string
 *               vendor_name:
 *                 type: string
 *               cigar_description:
 *                 type: string
 *               number_of_cigars:
 *                 type: integer
 *               cost_of_cigar:
 *                 type: number
 *                 format: float
 *     responses:
 *       201:
 *         description: Entry created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Form not found
 *       500:
 *         description: Server error
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['date_of_sale', 'vendor_name', 'cigar_description', 'number_of_cigars', 'cost_of_cigar'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { 
            status: 400, 
            message: `Missing required field: ${field}`, 
            code: 'VALIDATION_ERROR' 
          },
          { status: 400 }
        );
      }
    }
    
    // Generate a UUID - in a real app, this would be done by the database
    const entryId = crypto.randomUUID();
    
    // Mock the tax calculation
    const taxRate = 0.0595;
    const costMultiplier = 1.12;
    const subtotal = Math.max((body.number_of_cigars * costMultiplier) - (body.cost_of_cigar * taxRate), 0);
    
    // Create the entry with calculated fields
    const entry = {
      id: entryId,
      form_id: params.id,
      date_of_sale: body.date_of_sale,
      invoice_number: body.invoice_number || '',
      vendor_name: body.vendor_name,
      cigar_description: body.cigar_description,
      number_of_cigars: body.number_of_cigars,
      cost_of_cigar: body.cost_of_cigar,
      subtotal,
      tax_rate: taxRate,
      tax_amount: subtotal,
      entry_index: 1, // In a real app, this would be calculated
      created_at: new Date().toISOString()
    };
    
    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating entry:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { 
        status: 500, 
        message: 'Failed to create entry', 
        code: 'ENTRY_CREATE_FAILED' 
      },
      { status: 500 }
    );
  }
} 