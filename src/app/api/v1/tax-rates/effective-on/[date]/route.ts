import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import { createTaxRateService } from '@/lib/factories/serviceFactory';

/**
 * @swagger
 * /api/v1/tax-rates/effective-on/{date}:
 *   get:
 *     summary: Get tax rate effective on a specific date
 *     tags: [Tax Rates]
 *     description: Get the tax rate that was effective on the specified date
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: date
 *         in: path
 *         required: true
 *         description: Date to check (YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Tax rate retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No tax rate found for the given date
 *       500:
 *         description: Server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { status: 401, message: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { date } = params;
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return NextResponse.json(
        { status: 400, message: 'Invalid date format. Use YYYY-MM-DD', code: 'INVALID_DATE_FORMAT' },
        { status: 400 }
      );
    }

    // Get tax rate effective on the given date
    const taxRateService = createTaxRateService();
    const taxRate = await taxRateService.getEffectiveOnDate(date);
    
    if (!taxRate) {
      return NextResponse.json(
        { status: 404, message: 'No tax rate found for the given date', code: 'TAX_RATE_NOT_FOUND' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(taxRate);
  } catch (error) {
    console.error('Failed to fetch tax rate for date:', error);
    return NextResponse.json(
      { status: 500, message: 'Failed to fetch tax rate', code: 'TAX_RATE_FETCH_FAILED' },
      { status: 500 }
    );
  }
} 