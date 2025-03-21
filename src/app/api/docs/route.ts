import { swaggerOptions } from '@/lib/swagger';
import { NextResponse } from 'next/server';
import YAML from 'yamljs';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Generate the OpenAPI spec from JSDoc comments
const createOpenAPISpec = () => {
  const apiDir = path.resolve(process.cwd(), 'src/app/api');
  const spec = {
    ...swaggerOptions.swaggerDefinition,
    paths: {},
  };
  
  // For simplicity, we're returning a basic spec
  // In a production app, you would parse the JSDoc comments from your files
  
  // Add the auth endpoints from JSDoc
  spec.paths = {
    '/api/v1/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Auth'],
        description: 'Create a new user account with role-based permissions',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'company_name'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'User\'s email address',
                    example: 'user@example.com',
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    description: 'User\'s password (min 8 characters)',
                    example: 'password123',
                  },
                  company_name: {
                    type: 'string',
                    description: 'User\'s company or business name',
                    example: 'Example Cigar Co.',
                  },
                  role: {
                    type: 'string',
                    description: 'User role (defaults to "vendor")',
                    enum: ['admin', 'vendor', 'readonly'],
                    example: 'vendor',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User successfully registered',
          },
          '400': {
            description: 'Invalid request data',
          },
          '409': {
            description: 'Email already in use',
          },
        },
      },
    },
    '/api/v1/tax-rates': {
      get: {
        summary: 'Get tax rates',
        tags: ['Tax Rates'],
        description: 'Get the current and historical tax rates and multipliers for cigars',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'Tax rates retrieved successfully',
          },
          '401': {
            description: 'Unauthorized',
          },
          '500': {
            description: 'Server error',
          },
        },
      },
      post: {
        summary: 'Create a new tax rate',
        tags: ['Tax Rates'],
        description: 'Create a new tax rate (admin only)',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rate', 'multiplier', 'effective_from'],
                properties: {
                  rate: {
                    type: 'number',
                    format: 'float',
                    description: 'Tax rate value',
                    example: 0.0625,
                  },
                  multiplier: {
                    type: 'number',
                    format: 'float',
                    description: 'Tax multiplier value',
                    example: 1.15,
                  },
                  effective_from: {
                    type: 'string',
                    format: 'date',
                    description: 'When the rate takes effect',
                    example: '2025-01-01',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'Tax rate created successfully',
          },
          '400': {
            description: 'Invalid request data',
          },
          '401': {
            description: 'Unauthorized',
          },
          '403': {
            description: 'Forbidden - Admin access required',
          },
          '500': {
            description: 'Server error',
          },
        },
      },
    },
  };
  
  return spec;
};

export async function GET() {
  const spec = createOpenAPISpec();
  return NextResponse.json(spec);
} 