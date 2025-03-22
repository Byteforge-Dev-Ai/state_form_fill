import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { createFormService } from '@/lib/factories/serviceFactory';
import { z } from 'zod';

/**
 * @swagger
 * /api/v1/forms/{id}/generate:
 *   post:
 *     summary: Generate PDF for a form
 *     tags: [PDF]
 *     description: Generate official B-A-101 Schedule A PDF form with digital signature support
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
 *             properties:
 *               include_signature:
 *                 type: boolean
 *                 description: Whether to include a signature on the PDF
 *               signature_data:
 *                 type: string
 *                 description: Base64 encoded signature image
 *     responses:
 *       200:
 *         description: PDF generated successfully
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
    // Validate request body
    const schema = z.object({
      include_signature: z.boolean().optional().default(false),
      signature_data: z.string().optional(),
    });
    
    const body = await request.json();
    const { include_signature, signature_data } = schema.parse(body);
    
    // Get form service to verify the form exists
    const formService = createFormService();
    const form = await formService.getById(id, user.id);
    
    if (!form) {
      return NextResponse.json(
        { status: 404, message: 'Form not found', code: 'FORM_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    // In a real implementation, this would generate a PDF
    // For now, return a mock response
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setHours(expiresAt.getHours() + 24); // URL expires in 24 hours
    
    return NextResponse.json({
      url: `/api/v1/forms/${id}/pdf?token=mock-signed-url-token`,
      expires_at: expiresAt.toISOString(),
      file_name: `form-${id}.pdf`,
      file_size: 256000, // Mock file size
      generated_at: now.toISOString(),
    });
    
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    
    if (error instanceof z.ZodError) {
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
        message: 'Failed to generate PDF', 
        code: 'PDF_GENERATION_FAILED' 
      },
      { status: 500 }
    );
  }
} 