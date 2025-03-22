import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase/client';
import { createUserService, createFormEntryService } from '@/lib/factories/serviceFactory';

/**
 * @swagger
 * /api/v1/forms/{id}/entries/{entryId}:
 *   get:
 *     summary: Get a specific entry
 *     tags: [Entries]
 *     description: Get details of a specific sales entry
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
 *       - name: entryId
 *         in: path
 *         required: true
 *         description: ID of the entry
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Entry details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Entry not found
 *       500:
 *         description: Server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; entryId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    
    if (error || !user) {
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
      return NextResponse.json(
        { 
          status: 401, 
          message: 'Invalid user data', 
          code: 'INVALID_USER_DATA' 
        },
        { status: 401 }
      );
    }
    
    const userService = createUserService();
    const authenticatedUser = await userService.getUserByEmail(email);
    
    if (!authenticatedUser) {
      return NextResponse.json(
        { 
          status: 401, 
          message: 'User not found', 
          code: 'USER_NOT_FOUND' 
        },
        { status: 401 }
      );
    }

    // Get the entry using the FormEntryService
    const formEntryService = createFormEntryService();
    const entry = await formEntryService.getById(
      params.id,
      params.entryId,
      authenticatedUser.id
    );
    
    if (!entry) {
      return NextResponse.json(
        { 
          status: 404, 
          message: 'Entry not found', 
          code: 'ENTRY_NOT_FOUND' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(entry);
    
  } catch (error) {
    console.error('Error fetching entry:', error);
    return NextResponse.json(
      { 
        status: 500, 
        message: 'Failed to fetch entry', 
        code: 'ENTRY_FETCH_FAILED' 
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/forms/{id}/entries/{entryId}:
 *   put:
 *     summary: Update an entry
 *     tags: [Entries]
 *     description: Update an existing sales entry
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
 *       - name: entryId
 *         in: path
 *         required: true
 *         description: ID of the entry
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
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
 *       200:
 *         description: Entry updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Entry not found
 *       500:
 *         description: Server error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; entryId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    
    if (error || !user) {
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
      return NextResponse.json(
        { 
          status: 401, 
          message: 'Invalid user data', 
          code: 'INVALID_USER_DATA' 
        },
        { status: 401 }
      );
    }
    
    const userService = createUserService();
    const authenticatedUser = await userService.getUserByEmail(email);
    
    if (!authenticatedUser) {
      return NextResponse.json(
        { 
          status: 401, 
          message: 'User not found', 
          code: 'USER_NOT_FOUND' 
        },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    
    // Update the entry using the FormEntryService
    const formEntryService = createFormEntryService();
    const updatedEntry = await formEntryService.update(
      params.id,
      params.entryId,
      authenticatedUser.id,
      body
    );
    
    if (!updatedEntry) {
      return NextResponse.json(
        { 
          status: 404, 
          message: 'Entry not found or permission denied', 
          code: 'ENTRY_NOT_FOUND' 
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedEntry);
    
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json(
      { 
        status: 500, 
        message: 'Failed to update entry', 
        code: 'ENTRY_UPDATE_FAILED' 
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/forms/{id}/entries/{entryId}:
 *   delete:
 *     summary: Delete an entry
 *     tags: [Entries]
 *     description: Delete a specific sales entry
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
 *       - name: entryId
 *         in: path
 *         required: true
 *         description: ID of the entry
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Entry deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Entry not found
 *       500:
 *         description: Server error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; entryId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
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
    const { data: { user }, error } = await supabaseClient.auth.getUser(token);
    
    if (error || !user) {
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
      return NextResponse.json(
        { 
          status: 401, 
          message: 'Invalid user data', 
          code: 'INVALID_USER_DATA' 
        },
        { status: 401 }
      );
    }
    
    const userService = createUserService();
    const authenticatedUser = await userService.getUserByEmail(email);
    
    if (!authenticatedUser) {
      return NextResponse.json(
        { 
          status: 401, 
          message: 'User not found', 
          code: 'USER_NOT_FOUND' 
        },
        { status: 401 }
      );
    }

    // Delete the entry using the FormEntryService
    const formEntryService = createFormEntryService();
    const success = await formEntryService.delete(
      params.id,
      params.entryId,
      authenticatedUser.id
    );
    
    if (!success) {
      return NextResponse.json(
        { 
          status: 404, 
          message: 'Entry not found or permission denied', 
          code: 'ENTRY_NOT_FOUND' 
        },
        { status: 404 }
      );
    }
    
    return new NextResponse(null, { status: 204 });
    
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { 
        status: 500, 
        message: 'Failed to delete entry', 
        code: 'ENTRY_DELETE_FAILED' 
      },
      { status: 500 }
    );
  }
} 