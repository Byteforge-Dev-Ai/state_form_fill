import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { createFormService } from '@/lib/factories/serviceFactory';

/**
 * @swagger
 * /api/v1/forms/{id}/submit:
 *   post:
 *     summary: Submit a form
 *     tags: [Forms]
 *     description: Submit a completed form to the system and finalize the PDF
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
 *         description: Form submitted successfully
 *       400:
 *         description: Form cannot be submitted (incomplete or invalid)
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Form not found
 *       500:
 *         description: Server error
 */
export async function POST(
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
    // Get form service and submit the form
    const formService = createFormService();
    
    try {
      const submittedForm = await formService.submitForm(id, user.id);
      
      if (!submittedForm) {
        return NextResponse.json(
          { status: 404, message: 'Form not found', code: 'FORM_NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        id: submittedForm.id,
        status: submittedForm.status,
        submitted_at: submittedForm.submitted_at,
        confirmation_number: submittedForm.confirmation_number,
        // In a real implementation, this would generate and return the PDF URL
        pdf_url: `/api/v1/forms/${id}/pdf`,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'Form cannot be submitted in its current status') {
        return NextResponse.json(
          { 
            status: 400, 
            message: 'Form cannot be submitted in its current status', 
            code: 'INVALID_FORM_STATUS' 
          },
          { status: 400 }
        );
      }
      throw error;
    }
  } catch (error) {
    console.error('Failed to submit form:', error);
    return NextResponse.json(
      { 
        status: 500, 
        message: 'Failed to submit form', 
        code: 'FORM_SUBMIT_FAILED' 
      },
      { status: 500 }
    );
  }
} 