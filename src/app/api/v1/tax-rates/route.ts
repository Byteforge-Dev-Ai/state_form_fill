import { NextResponse } from 'next/server';

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
export async function GET() {
  // For demo purposes, return a mock response
  return NextResponse.json({
    current_rate: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      rate: 0.0595,
      multiplier: 1.12,
      effective_from: "2024-01-01",
      effective_to: null,
      created_at: "2023-12-15T14:30:00Z",
      created_by: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
    },
    previous_rates: [
      {
        id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        rate: 0.0525,
        multiplier: 1.10,
        effective_from: "2023-01-01",
        effective_to: "2023-12-31",
        created_at: "2022-12-10T09:00:00Z",
        created_by: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
      },
      {
        id: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
        rate: 0.0500,
        multiplier: 1.08,
        effective_from: "2022-01-01",
        effective_to: "2022-12-31",
        created_at: "2021-12-15T11:30:00Z",
        created_by: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
      }
    ]
  });
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
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // For demo purposes, return a mock response
    return NextResponse.json({
      id: "34e7b810-9dad-11d1-80b4-00c04fd430c8",
      rate: body.rate,
      multiplier: body.multiplier,
      effective_from: body.effective_from,
      effective_to: null,
      created_at: new Date().toISOString(),
      created_by: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating tax rate:', error);
    return NextResponse.json({ 
      status: 500, 
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    }, { status: 500 });
  }
} 