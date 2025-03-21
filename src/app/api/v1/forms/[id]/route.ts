import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth/middleware';
import { createFormService } from '@/lib/factories/serviceFactory';
import { updateFormSchema } from '@/lib/validators/formValidator';
import { ZodError } from 'zod';

/**
 * @swagger
 * /api/v1/forms/{id}:
 *   get:
 *     summary: Get a specific form
 *     tags: [Forms]
 *     description: Get details for a specific form
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
 *     responses:
 *       200:
 *         description: Form details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Form not found
 *       500:
 *         description: Server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Authenticate user
  const user = await authenticateUser(request);
  if (!user) {
    return NextResponse.json(
      { status: 401, message: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { status: 400, message: 'Missing form ID', code: 'MISSING_ID' },
      { status: 400 }
    );
  }

  try {
    // Get the specific form
    const formService = createFormService();
    const form = await formService.getById(id, user.id);

    if (!form) {
      return NextResponse.json(
        { status: 404, message: 'Form not found', code: 'FORM_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error('Failed to fetch form:', error);
    return NextResponse.json(
      { 
        status: 500, 
        message: 'Failed to fetch form', 
        code: 'FORM_FETCH_FAILED' 
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/forms/{id}:
 *   put:
 *     summary: Update a form
 *     tags: [Forms]
 *     description: Update a specific form
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the form to update
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
 *               date_range_start:
 *                 type: string
 *                 format: date
 *                 description: Start date of the reporting period
 *               date_range_end:
 *                 type: string
 *                 format: date
 *                 description: End date of the reporting period
 *               status:
 *                 type: string
 *                 enum: [draft, in_progress, submitted]
 *                 description: Status of the form
 *     responses:
 *       200:
 *         description: Form updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Form not found
 *       500:
 *         description: Server error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Authenticate user
  const user = await authenticateUser(request);
  if (!user) {
    return NextResponse.json(
      { status: 401, message: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { status: 400, message: 'Missing form ID', code: 'MISSING_ID' },
      { status: 400 }
    );
  }

  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateFormSchema.parse(body);

    // Update the form
    const formService = createFormService();
    const updatedForm = await formService.update(id, user.id, validatedData);

    if (!updatedForm) {
      return NextResponse.json(
        { status: 404, message: 'Form not found', code: 'FORM_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedForm);
  } catch (error) {
    console.error('Failed to update form:', error);

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
        message: 'Failed to update form', 
        code: 'FORM_UPDATE_FAILED' 
      },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/forms/{id}:
 *   delete:
 *     summary: Delete a form
 *     tags: [Forms]
 *     description: Delete a specific form
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the form to delete
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Form deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Form not found
 *       500:
 *         description: Server error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Authenticate user
  const user = await authenticateUser(request);
  if (!user) {
    return NextResponse.json(
      { status: 401, message: 'Unauthorized', code: 'UNAUTHORIZED' },
      { status: 401 }
    );
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json(
      { status: 400, message: 'Missing form ID', code: 'MISSING_ID' },
      { status: 400 }
    );
  }

  try {
    // Delete the form
    const formService = createFormService();
    const deleted = await formService.delete(id, user.id);

    if (!deleted) {
      return NextResponse.json(
        { status: 404, message: 'Form not found', code: 'FORM_NOT_FOUND' },
        { status: 404 }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Failed to delete form:', error);
    return NextResponse.json(
      { 
        status: 500, 
        message: 'Failed to delete form', 
        code: 'FORM_DELETE_FAILED' 
      },
      { status: 500 }
    );
  }
} 