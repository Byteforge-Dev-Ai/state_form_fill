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
    '/api/v1/user-identifiers': {
      get: {
        summary: 'List all business identifiers',
        tags: ['User Identifiers'],
        description: 'List all business identifiers for current user',
        security: [{ BearerAuth: [] }],
        responses: {
          '200': {
            description: 'List of user identifiers',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'string',
                        format: 'uuid',
                      },
                      legal_name: {
                        type: 'string',
                      },
                      nc_dor_id: {
                        type: 'string',
                      },
                      trade_name: {
                        type: 'string',
                      },
                      address: {
                        type: 'string',
                      },
                      city: {
                        type: 'string',
                      },
                      state: {
                        type: 'string',
                      },
                      zip_code: {
                        type: 'string',
                      },
                      created_at: {
                        type: 'string',
                        format: 'date-time',
                      },
                    },
                  },
                },
              },
            },
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
        summary: 'Create a new business identifier',
        tags: ['User Identifiers'],
        description: 'Create a new business identifier for the current user',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['legal_name', 'nc_dor_id'],
                properties: {
                  legal_name: {
                    type: 'string',
                    description: 'Legal name of the business',
                    example: 'Carolina Cigar Co.',
                  },
                  nc_dor_id: {
                    type: 'string',
                    description: 'North Carolina Department of Revenue ID',
                    example: 'NC12345678',
                  },
                  trade_name: {
                    type: 'string',
                    description: 'Trade name (if different from legal name)',
                    example: 'Carolina Cigars',
                  },
                  address: {
                    type: 'string',
                    description: 'Business address',
                    example: '123 Main St',
                  },
                  city: {
                    type: 'string',
                    description: 'City',
                    example: 'Charlotte',
                  },
                  state: {
                    type: 'string',
                    description: 'State',
                    example: 'NC',
                  },
                  zip_code: {
                    type: 'string',
                    description: 'ZIP code',
                    example: '28202',
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': {
            description: 'User identifier created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                    },
                    legal_name: {
                      type: 'string',
                    },
                    nc_dor_id: {
                      type: 'string',
                    },
                    trade_name: {
                      type: 'string',
                    },
                    address: {
                      type: 'string',
                    },
                    city: {
                      type: 'string',
                    },
                    state: {
                      type: 'string',
                    },
                    zip_code: {
                      type: 'string',
                    },
                    created_at: {
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
          '500': {
            description: 'Server error',
          },
        },
      },
    },
    '/api/v1/user-identifiers/{id}': {
      get: {
        summary: 'Get a specific business identifier',
        tags: ['User Identifiers'],
        description: 'Get details of a specific business identifier',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the user identifier to retrieve',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          '200': {
            description: 'User identifier details',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                    },
                    legal_name: {
                      type: 'string',
                    },
                    nc_dor_id: {
                      type: 'string',
                    },
                    trade_name: {
                      type: 'string',
                    },
                    address: {
                      type: 'string',
                    },
                    city: {
                      type: 'string',
                    },
                    state: {
                      type: 'string',
                    },
                    zip_code: {
                      type: 'string',
                    },
                    created_at: {
                      type: 'string',
                      format: 'date-time',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Invalid ID',
          },
          '401': {
            description: 'Unauthorized',
          },
          '404': {
            description: 'User identifier not found',
          },
          '500': {
            description: 'Server error',
          },
        },
      },
      put: {
        summary: 'Update a business identifier',
        tags: ['User Identifiers'],
        description: 'Update a specific business identifier',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the user identifier to update',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  legal_name: {
                    type: 'string',
                    description: 'Legal name of the business',
                  },
                  nc_dor_id: {
                    type: 'string',
                    description: 'North Carolina Department of Revenue ID',
                  },
                  trade_name: {
                    type: 'string',
                    description: 'Trade name (if different from legal name)',
                  },
                  address: {
                    type: 'string',
                    description: 'Business address',
                  },
                  city: {
                    type: 'string',
                    description: 'City',
                  },
                  state: {
                    type: 'string',
                    description: 'State',
                  },
                  zip_code: {
                    type: 'string',
                    description: 'ZIP code',
                  },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'User identifier updated successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                    },
                    legal_name: {
                      type: 'string',
                    },
                    nc_dor_id: {
                      type: 'string',
                    },
                    trade_name: {
                      type: 'string',
                    },
                    address: {
                      type: 'string',
                    },
                    city: {
                      type: 'string',
                    },
                    state: {
                      type: 'string',
                    },
                    zip_code: {
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
            description: 'User identifier not found',
          },
          '500': {
            description: 'Server error',
          },
        },
      },
      delete: {
        summary: 'Delete a business identifier',
        tags: ['User Identifiers'],
        description: 'Delete a specific business identifier',
        security: [{ BearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID of the user identifier to delete',
            schema: {
              type: 'string',
              format: 'uuid',
            },
          },
        ],
        responses: {
          '204': {
            description: 'User identifier deleted successfully',
          },
          '400': {
            description: 'Invalid ID',
          },
          '401': {
            description: 'Unauthorized',
          },
          '404': {
            description: 'User identifier not found',
          },
          '500': {
            description: 'Server error',
          },
        },
      },
    },
  };

  // Add forms API endpoints
  spec.paths['/api/v1/forms'] = {
    get: {
      summary: 'List all forms',
      tags: ['Forms'],
      description: 'List all forms for current user with advanced filtering',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'status',
          in: 'query',
          required: false,
          description: 'Filter by status',
          schema: {
            type: 'string',
            enum: ['draft', 'in_progress', 'submitted', 'approved', 'rejected'],
          },
        },
        {
          name: 'start_date',
          in: 'query',
          required: false,
          description: 'Filter by period starting date',
          schema: {
            type: 'string',
            format: 'date',
          },
        },
        {
          name: 'end_date',
          in: 'query',
          required: false,
          description: 'Filter by period ending date',
          schema: {
            type: 'string',
            format: 'date',
          },
        },
        {
          name: 'sort',
          in: 'query',
          required: false,
          description: 'Field to sort by',
          schema: {
            type: 'string',
            enum: ['date_range_start', 'date_range_end', 'created_at', 'status'],
          },
        },
        {
          name: 'order',
          in: 'query',
          required: false,
          description: 'Sort order (asc or desc)',
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'desc',
          },
        },
        {
          name: 'page',
          in: 'query',
          required: false,
          description: 'Page number',
          schema: {
            type: 'integer',
            default: 1,
          },
        },
        {
          name: 'limit',
          in: 'query',
          required: false,
          description: 'Number of items per page',
          schema: {
            type: 'integer',
            default: 10,
          },
        },
      ],
      responses: {
        '200': {
          description: 'List of forms with pagination',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'string',
                          format: 'uuid',
                        },
                        user_identifier_id: {
                          type: 'string',
                          format: 'uuid',
                        },
                        date_range_start: {
                          type: 'string',
                          format: 'date',
                        },
                        date_range_end: {
                          type: 'string',
                          format: 'date',
                        },
                        created_at: {
                          type: 'string',
                          format: 'date-time',
                        },
                        status: {
                          type: 'string',
                          enum: ['draft', 'in_progress', 'submitted', 'approved', 'rejected'],
                        },
                        total_entries: {
                          type: 'integer',
                        },
                        total_amount: {
                          type: 'number',
                          format: 'float',
                        },
                        tax_calculated: {
                          type: 'number',
                          format: 'float',
                        },
                        user_identifier: {
                          type: 'object',
                          properties: {
                            legal_name: {
                              type: 'string',
                            },
                            nc_dor_id: {
                              type: 'string',
                            },
                          },
                        },
                      },
                    },
                  },
                  pagination: {
                    type: 'object',
                    properties: {
                      total: {
                        type: 'integer',
                      },
                      page: {
                        type: 'integer',
                      },
                      limit: {
                        type: 'integer',
                      },
                      pages: {
                        type: 'integer',
                      },
                    },
                  },
                },
              },
            },
          },
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
      summary: 'Create a new form',
      tags: ['Forms'],
      description: 'Create a new form',
      security: [{ BearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['user_identifier_id', 'date_range_start', 'date_range_end'],
              properties: {
                user_identifier_id: {
                  type: 'string',
                  format: 'uuid',
                  description: 'ID of the user identifier',
                },
                date_range_start: {
                  type: 'string',
                  format: 'date',
                  description: 'Start date of the reporting period',
                },
                date_range_end: {
                  type: 'string',
                  format: 'date',
                  description: 'End date of the reporting period',
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Form created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                  },
                  user_identifier_id: {
                    type: 'string',
                    format: 'uuid',
                  },
                  date_range_start: {
                    type: 'string',
                    format: 'date',
                  },
                  date_range_end: {
                    type: 'string',
                    format: 'date',
                  },
                  created_at: {
                    type: 'string',
                    format: 'date-time',
                  },
                  status: {
                    type: 'string',
                    enum: ['draft'],
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
        '500': {
          description: 'Server error',
        },
      },
    },
  };

  spec.paths['/api/v1/forms/{id}'] = {
    get: {
      summary: 'Get a specific form',
      tags: ['Forms'],
      description: 'Get details for a specific form',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the form',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Form details',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                  },
                  user_identifier_id: {
                    type: 'string',
                    format: 'uuid',
                  },
                  date_range_start: {
                    type: 'string',
                    format: 'date',
                  },
                  date_range_end: {
                    type: 'string',
                    format: 'date',
                  },
                  created_at: {
                    type: 'string',
                    format: 'date-time',
                  },
                  updated_at: {
                    type: 'string',
                    format: 'date-time',
                  },
                  status: {
                    type: 'string',
                    enum: ['draft', 'in_progress', 'submitted', 'approved', 'rejected'],
                  },
                  total_entries: {
                    type: 'integer',
                  },
                  total_amount: {
                    type: 'number',
                    format: 'float',
                  },
                  tax_calculated: {
                    type: 'number',
                    format: 'float',
                  },
                  user_identifier: {
                    type: 'object',
                    properties: {
                      legal_name: {
                        type: 'string',
                      },
                      nc_dor_id: {
                        type: 'string',
                      },
                      trade_name: {
                        type: 'string',
                      },
                      address: {
                        type: 'string',
                      },
                      city: {
                        type: 'string',
                      },
                      state: {
                        type: 'string',
                      },
                      zip_code: {
                        type: 'string',
                      },
                    },
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
          description: 'Form not found',
        },
        '500': {
          description: 'Server error',
        },
      },
    },
    put: {
      summary: 'Update a form',
      tags: ['Forms'],
      description: 'Update a specific form',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the form to update',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                date_range_start: {
                  type: 'string',
                  format: 'date',
                  description: 'Start date of the reporting period',
                },
                date_range_end: {
                  type: 'string',
                  format: 'date',
                  description: 'End date of the reporting period',
                },
                status: {
                  type: 'string',
                  enum: ['draft', 'in_progress', 'submitted'],
                  description: 'Status of the form',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Form updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                  },
                  user_identifier_id: {
                    type: 'string',
                    format: 'uuid',
                  },
                  date_range_start: {
                    type: 'string',
                    format: 'date',
                  },
                  date_range_end: {
                    type: 'string',
                    format: 'date',
                  },
                  updated_at: {
                    type: 'string',
                    format: 'date-time',
                  },
                  status: {
                    type: 'string',
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
          description: 'Form not found',
        },
        '500': {
          description: 'Server error',
        },
      },
    },
    delete: {
      summary: 'Delete a form',
      tags: ['Forms'],
      description: 'Delete a specific form',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the form to delete',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      responses: {
        '204': {
          description: 'Form deleted successfully',
        },
        '401': {
          description: 'Unauthorized',
        },
        '404': {
          description: 'Form not found',
        },
        '500': {
          description: 'Server error',
        },
      },
    },
  };

  spec.paths['/api/v1/forms/{id}/generate'] = {
    post: {
      summary: 'Generate PDF for a form',
      tags: ['PDF'],
      description: 'Generate official B-A-101 Schedule A PDF form with digital signature support',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the form',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                include_signature: {
                  type: 'boolean',
                  description: 'Whether to include a signature on the PDF',
                },
                signature_data: {
                  type: 'string',
                  description: 'Base64 encoded signature image',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'PDF generated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  url: {
                    type: 'string',
                    description: 'Temporary URL to download the PDF',
                  },
                  expires_at: {
                    type: 'string',
                    format: 'date-time',
                  },
                  file_name: {
                    type: 'string',
                  },
                  file_size: {
                    type: 'integer',
                  },
                  generated_at: {
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
          description: 'Form not found',
        },
        '500': {
          description: 'Server error',
        },
      },
    },
  };

  spec.paths['/api/v1/forms/{id}/preview'] = {
    get: {
      summary: 'Preview a form',
      tags: ['PDF'],
      description: 'Get a preview of the form (lower resolution PDF or image)',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the form',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
        {
          name: 'format',
          in: 'query',
          required: false,
          description: 'Format of the preview (pdf or image)',
          schema: {
            type: 'string',
            enum: ['pdf', 'image'],
            default: 'pdf',
          },
        },
        {
          name: 'page',
          in: 'query',
          required: false,
          description: 'Page number to preview',
          schema: {
            type: 'integer',
            default: 1,
          },
        },
      ],
      responses: {
        '200': {
          description: 'Form preview',
          content: {
            'application/pdf': {
              schema: {
                type: 'string',
                format: 'binary',
              },
            },
            'image/*': {
              schema: {
                type: 'string',
                format: 'binary',
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized',
        },
        '404': {
          description: 'Form not found',
        },
        '500': {
          description: 'Server error',
        },
      },
    },
  };

  spec.paths['/api/v1/forms/{id}/submit'] = {
    post: {
      summary: 'Submit a form',
      tags: ['Forms'],
      description: 'Submit a completed form to the system and finalize the PDF',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the form',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      responses: {
        '200': {
          description: 'Form submitted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                  },
                  status: {
                    type: 'string',
                    enum: ['submitted'],
                  },
                  submitted_at: {
                    type: 'string',
                    format: 'date-time',
                  },
                  pdf_url: {
                    type: 'string',
                  },
                  confirmation_number: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        '400': {
          description: 'Form cannot be submitted (incomplete or invalid)',
        },
        '401': {
          description: 'Unauthorized',
        },
        '404': {
          description: 'Form not found',
        },
        '500': {
          description: 'Server error',
        },
      },
    },
  };

  // Add entries API endpoints
  spec.paths['/api/v1/forms/{id}/entries'] = {
    get: {
      summary: 'Get all entries for a form',
      tags: ['Entries'],
      description: 'Get all entries for a form with optional filtering and sorting',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the form',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
        {
          name: 'vendor',
          in: 'query',
          required: false,
          description: 'Filter by vendor name',
          schema: {
            type: 'string',
          },
        },
        {
          name: 'start_date',
          in: 'query',
          required: false,
          description: 'Filter by sale date (start)',
          schema: {
            type: 'string',
            format: 'date',
          },
        },
        {
          name: 'end_date',
          in: 'query',
          required: false,
          description: 'Filter by sale date (end)',
          schema: {
            type: 'string',
            format: 'date',
          },
        },
        {
          name: 'sort',
          in: 'query',
          required: false,
          description: 'Field to sort by',
          schema: {
            type: 'string',
            enum: ['date_of_sale', 'vendor_name', 'cost_of_cigar', 'number_of_cigars', 'tax_amount', 'created_at'],
          },
        },
        {
          name: 'order',
          in: 'query',
          required: false,
          description: 'Sort order (asc or desc)',
          schema: {
            type: 'string',
            enum: ['asc', 'desc'],
            default: 'asc',
          },
        },
      ],
      responses: {
        '200': {
          description: 'List of sales entries',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: {
                      type: 'string',
                      format: 'uuid',
                    },
                    form_id: {
                      type: 'string',
                      format: 'uuid',
                    },
                    date_of_sale: {
                      type: 'string',
                      format: 'date',
                    },
                    invoice_number: {
                      type: 'string',
                    },
                    vendor_name: {
                      type: 'string',
                    },
                    cigar_description: {
                      type: 'string',
                    },
                    number_of_cigars: {
                      type: 'integer',
                    },
                    cost_of_cigar: {
                      type: 'number',
                      format: 'float',
                    },
                    subtotal: {
                      type: 'number',
                      format: 'float',
                    },
                    tax_rate: {
                      type: 'number',
                      format: 'float',
                    },
                    tax_amount: {
                      type: 'number',
                      format: 'float',
                    },
                    entry_index: {
                      type: 'integer',
                    },
                    created_at: {
                      type: 'string',
                      format: 'date-time',
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
        },
        '401': {
          description: 'Unauthorized',
        },
        '403': {
          description: 'Forbidden',
        },
        '404': {
          description: 'Form not found',
        },
        '500': {
          description: 'Server error',
        },
      },
    },
    post: {
      summary: 'Add a new entry',
      tags: ['Entries'],
      description: 'Add a new entry with automatic tax calculation',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the form',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['date_of_sale', 'vendor_name', 'cigar_description', 'number_of_cigars', 'cost_of_cigar'],
              properties: {
                date_of_sale: {
                  type: 'string',
                  format: 'date',
                  description: 'Date when the sale occurred',
                  example: '2023-06-15',
                },
                invoice_number: {
                  type: 'string',
                  description: 'Reference invoice number',
                  example: 'INV-12345',
                },
                vendor_name: {
                  type: 'string',
                  description: 'Name of vendor',
                  example: 'Premium Cigars Inc.',
                },
                cigar_description: {
                  type: 'string',
                  description: 'Description of cigar product',
                  example: 'Handmade Corona Medium',
                },
                number_of_cigars: {
                  type: 'integer',
                  description: 'Quantity sold',
                  example: 50,
                },
                cost_of_cigar: {
                  type: 'number',
                  format: 'float',
                  description: 'Base cost in USD',
                  example: 5.75,
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Entry created successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                  },
                  form_id: {
                    type: 'string',
                    format: 'uuid',
                  },
                  date_of_sale: {
                    type: 'string',
                    format: 'date',
                  },
                  invoice_number: {
                    type: 'string',
                  },
                  vendor_name: {
                    type: 'string',
                  },
                  cigar_description: {
                    type: 'string',
                  },
                  number_of_cigars: {
                    type: 'integer',
                  },
                  cost_of_cigar: {
                    type: 'number',
                    format: 'float',
                  },
                  subtotal: {
                    type: 'number',
                    format: 'float',
                  },
                  tax_rate: {
                    type: 'number',
                    format: 'float',
                  },
                  tax_amount: {
                    type: 'number',
                    format: 'float',
                  },
                  entry_index: {
                    type: 'integer',
                  },
                  created_at: {
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
        '403': {
          description: 'Forbidden',
        },
        '404': {
          description: 'Form not found',
        },
        '500': {
          description: 'Server error',
        },
      },
    },
  };

  spec.paths['/api/v1/forms/{formId}/entries/{id}'] = {
    put: {
      summary: 'Update a sales entry',
      tags: ['Entries'],
      description: 'Update an existing sales entry',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'formId',
          in: 'path',
          required: true,
          description: 'ID of the form',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the entry to update',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                date_of_sale: {
                  type: 'string',
                  format: 'date',
                  description: 'Date when the sale occurred',
                  example: '2023-06-15',
                },
                invoice_number: {
                  type: 'string',
                  description: 'Reference invoice number',
                  example: 'INV-12345',
                },
                vendor_name: {
                  type: 'string',
                  description: 'Name of vendor',
                  example: 'Premium Cigars Inc.',
                },
                cigar_description: {
                  type: 'string',
                  description: 'Description of cigar product',
                  example: 'Handmade Corona Medium',
                },
                number_of_cigars: {
                  type: 'integer',
                  description: 'Quantity sold',
                  example: 50,
                },
                cost_of_cigar: {
                  type: 'number',
                  format: 'float',
                  description: 'Base cost in USD',
                  example: 5.75,
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Entry updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                    format: 'uuid',
                  },
                  form_id: {
                    type: 'string',
                    format: 'uuid',
                  },
                  date_of_sale: {
                    type: 'string',
                    format: 'date',
                  },
                  invoice_number: {
                    type: 'string',
                  },
                  vendor_name: {
                    type: 'string',
                  },
                  cigar_description: {
                    type: 'string',
                  },
                  number_of_cigars: {
                    type: 'integer',
                  },
                  cost_of_cigar: {
                    type: 'number',
                    format: 'float',
                  },
                  subtotal: {
                    type: 'number',
                    format: 'float',
                  },
                  tax_rate: {
                    type: 'number',
                    format: 'float',
                  },
                  tax_amount: {
                    type: 'number',
                    format: 'float',
                  },
                  entry_index: {
                    type: 'integer',
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
        '403': {
          description: 'Forbidden',
        },
        '404': {
          description: 'Form or entry not found',
        },
        '500': {
          description: 'Server error',
        },
      },
    },
    delete: {
      summary: 'Delete a sales entry',
      tags: ['Entries'],
      description: 'Delete an existing sales entry',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'formId',
          in: 'path',
          required: true,
          description: 'ID of the form',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the entry to delete',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      responses: {
        '204': {
          description: 'Entry deleted successfully',
        },
        '401': {
          description: 'Unauthorized',
        },
        '403': {
          description: 'Forbidden',
        },
        '404': {
          description: 'Form or entry not found',
        },
        '500': {
          description: 'Server error',
        },
      },
    },
  };

  spec.paths['/api/v1/forms/{id}/entries/bulk'] = {
    post: {
      summary: 'Bulk import entries',
      tags: ['Entries'],
      description: 'Bulk import entries from CSV/Excel file',
      security: [{ BearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID of the form',
          schema: {
            type: 'string',
            format: 'uuid',
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              type: 'object',
              properties: {
                file: {
                  type: 'string',
                  format: 'binary',
                  description: 'CSV or Excel file with entries data',
                },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Entries imported successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  imported: {
                    type: 'integer',
                    description: 'Number of successfully imported entries',
                  },
                  failed: {
                    type: 'integer',
                    description: 'Number of entries that failed to import',
                  },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        row: {
                          type: 'integer',
                          description: 'Row number in the file',
                        },
                        message: {
                          type: 'string',
                          description: 'Error message',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid file or file format',
        },
        '401': {
          description: 'Unauthorized',
        },
        '403': {
          description: 'Forbidden',
        },
        '404': {
          description: 'Form not found',
        },
        '500': {
          description: 'Server error',
        },
      },
    },
  };

  // Add forms debug endpoint
  spec.paths['/api/v1/forms/debug'] = {
    get: {
      summary: 'Debug authentication issues',
      tags: ['Forms'],
      description: 'Provides detailed information about the authentication process',
      security: [
        {
          BearerAuth: []
        }
      ],
      responses: {
        '200': {
          description: 'Debug information',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  auth_status: {
                    type: 'string',
                    enum: ['authenticated', 'unauthenticated'],
                    description: 'Authentication status'
                  },
                  user_id: {
                    type: 'string',
                    nullable: true,
                    description: 'User ID if authenticated'
                  },
                  user_email: {
                    type: 'string',
                    nullable: true,
                    description: 'User email if authenticated'
                  },
                  user_role: {
                    type: 'string',
                    nullable: true,
                    description: 'User role if authenticated'
                  },
                  token_present: {
                    type: 'boolean',
                    description: 'Whether a token was provided in the request'
                  },
                  token_length: {
                    type: 'integer',
                    description: 'Length of the provided token'
                  },
                  headers: {
                    type: 'object',
                    description: 'Key request headers'
                  },
                  supabase_test: {
                    type: 'object',
                    description: 'Results of basic Supabase connection test'
                  }
                }
              }
            }
          }
        },
        '401': {
          description: 'Unauthorized'
        },
        '500': {
          description: 'Server error'
        }
      }
    }
  };
  
  return spec;
};

export async function GET() {
  const spec = createOpenAPISpec();
  return NextResponse.json(spec);
} 