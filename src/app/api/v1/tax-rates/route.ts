import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, requirePermission } from '@/lib/auth';
import { createTaxRateService } from '@/lib/factories/serviceFactory';

/**
 * @swagger
 * /api/v1/tax-rates:
 *   get:
 *     summary: Get tax rates
 *     tags: [Tax Rates]
 *     description: Get the current and historical tax rates and multipliers for cigars
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Tax rates retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 current_rate:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     rate:
 *                       type: number
 *                       format: float
 *                     multiplier:
 *                       type: number
 *                       format: float
 *                     effective_from:
 *                       type: string
 *                       format: date
 *                     effective_to:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *                     created_by:
 *                       type: string
 *                       format: uuid
 *                 previous_rates:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         format: uuid
 *                       rate:
 *                         type: number
 *                         format: float
 *                       multiplier:
 *                         type: number
 *                         format: float
 *                       effective_from:
 *                         type: string
 *                         format: date
 *                       effective_to:
 *                         type: string
 *                         format: date
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                       created_by:
 *                         type: string
 *                         format: uuid
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { status: 401, message: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get tax rates
    const taxRateService = createTaxRateService();
    const currentRate = await taxRateService.getCurrent();
    const allRates = await taxRateService.getAll();
    
    // Filter and sort previous rates
    const previousRates = allRates
      .filter(rate => rate.id !== currentRate.id)
      .sort((a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime());
    
    return NextResponse.json({
      current_rate: currentRate,
      previous_rates: previousRates
    });
  } catch (error) {
    console.error('Failed to fetch tax rates:', error);
    return NextResponse.json(
      { status: 500, message: 'Failed to fetch tax rates', code: 'TAX_RATE_FETCH_FAILED' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/tax-rates:
 *   post:
 *     summary: Create a new tax rate
 *     tags: [Tax Rates]
 *     description: Create a new tax rate (admin only)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rate
 *               - multiplier
 *               - effective_from
 *             properties:
 *               rate:
 *                 type: number
 *                 format: float
 *                 description: Tax rate value
 *                 example: 0.0625
 *               multiplier:
 *                 type: number
 *                 format: float
 *                 description: Tax multiplier value
 *                 example: 1.15
 *               effective_from:
 *                 type: string
 *                 format: date
 *                 description: When the rate takes effect
 *                 example: 2025-01-01
 *     responses:
 *       201:
 *         description: Tax rate created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 rate:
 *                   type: number
 *                   format: float
 *                 multiplier:
 *                   type: number
 *                   format: float
 *                 effective_from:
 *                   type: string
 *                   format: date
 *                 effective_to:
 *                   type: string
 *                   format: date
 *                   nullable: true
 *                 created_at:
 *                   type: string
 *                   format: date-time
 *                 created_by:
 *                   type: string
 *                   format: uuid
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 *       500:
 *         description: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json(
        { status: 401, message: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    
    // Check for admin permission
    const hasPermission = await requirePermission('tax:write')(request, null, () => true);
    if (!hasPermission) {
      return NextResponse.json(
        { status: 403, message: 'Forbidden - Admin access required', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate request body
    if (!body.rate || !body.multiplier || !body.effective_from) {
      return NextResponse.json(
        { status: 400, message: 'Missing required fields', code: 'MISSING_REQUIRED_FIELDS' },
        { status: 400 }
      );
    }
    
    // Create new tax rate
    const taxRateService = createTaxRateService();
    const newRate = await taxRateService.create(user.id, {
      rate: body.rate,
      multiplier: body.multiplier,
      effective_from: body.effective_from
    });
    
    return NextResponse.json(newRate, { status: 201 });
  } catch (error) {
    console.error('Error creating tax rate:', error);
    return NextResponse.json({ 
      status: 500, 
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
} 