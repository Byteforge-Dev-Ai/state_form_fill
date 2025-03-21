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
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          format: 'uuid',
                        },
                        email: {
                          type: 'string',
                          format: 'email',
                        },
                        company_name: {
                          type: 'string',
                        },
                        role: {
                          type: 'string',
                        },
                        created_at: {
                          type: 'string',
                          format: 'date-time',
                        },
                      },
                    },
                    token: {
                      type: 'string',
                    },
                    refresh_token: {
                      type: 'string',
                    },
                    expires_at: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
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
    '/api/v1/auth/login': {
      post: {
        summary: 'Login user',
        tags: ['Auth'],
        description: 'Authenticate a user and return JWT with role information',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'User\'s email address',
                    example: 'admin@example.com',
                  },
                  password: {
                    type: 'string',
                    format: 'password',
                    description: 'User\'s password',
                    example: 'admin123',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User successfully logged in',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    user: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          format: 'uuid',
                        },
                        email: {
                          type: 'string',
                          format: 'email',
                        },
                        company_name: {
                          type: 'string',
                        },
                        role: {
                          type: 'string',
                        },
                        last_login: {
                          type: 'string',
                          format: 'date-time',
                        },
                      },
                    },
                    token: {
                      type: 'string',
                    },
                    refresh_token: {
                      type: 'string',
                    },
                    expires_at: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid request data',
          },
          '401': {
            description: 'Invalid credentials',
          },
        },
      },
    },
    '/api/v1/auth/refresh': {
      post: {
        summary: 'Refresh authentication token',
        tags: ['Auth'],
        description: 'Refresh an expired authentication token using the refresh token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refresh_token'],
                properties: {
                  refresh_token: {
                    type: 'string',
                    description: 'The refresh token received during login',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Token successfully refreshed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    token: {
                      type: 'string',
                    },
                    refresh_token: {
                      type: 'string',
                    },
                    expires_at: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid request data',
          },
          '401': {
            description: 'Invalid or expired refresh token',
          },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        summary: 'Logout user',
        tags: ['Auth'],
        description: 'End a user session and invalidate tokens',
        security: [{ BearerAuth: [] }],
        responses: {
          '204': {
            description: 'Successfully logged out',
          },
          '401': {
            description: 'Unauthorized',
          },
        },
      },
    },
    '/api/v1/users/me': {
      get: {
        summary: 'Get current user profile',
        tags: ['Users'],
        description: 'Get current user profile with role information',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'User profile retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                    },
                    company_name: {
                      type: 'string',
                    },
                    role: {
                      type: 'string',
                    },
                    auth_provider: {
                      type: 'string',
                    },
                    created_at: {
                      type: 'string',
                      format: 'date-time',
                    },
                    last_login: {
                      type: 'string',
                      format: 'date-time',
                    },
                    subscription_status: {
                      type: 'string',
                    },
                    subscription_expiry: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
          },
          '401': {
            description: 'Unauthorized',
          },
          '404': {
            description: 'User not found',
          },
        },
      },
      put: {
        summary: 'Update user profile',
        tags: ['Users'],
        description: 'Update the current user\'s profile information',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  email: {
                    type: 'string',
                    format: 'email',
                    description: 'User\'s email address',
                  },
                  company_name: {
                    type: 'string',
                    description: 'User\'s company or business name',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User profile updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                    },
                    email: {
                      type: 'string',
                      format: 'email',
                    },
                    company_name: {
                      type: 'string',
                    },
                    updated_at: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid request data',
          },
          '401': {
            description: 'Unauthorized',
          },
          '404': {
            description: 'User not found',
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