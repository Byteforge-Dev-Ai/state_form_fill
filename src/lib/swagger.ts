import { SwaggerOptions } from 'swagger-ui-express';

export const swaggerOptions: SwaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'NC Cigar Sales Form Filler API',
      version: '1.0.0',
      description: 'API documentation for the NC Cigar Sales Form Filler application',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local Development Server',
      },
      {
        url: 'https://nc-cigar-form-filler.example.com',
        description: 'Production Server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'JWT token obtained from /auth/login',
        },
        EmailPassword: {
          type: 'oauth2',
          flows: {
            password: {
              tokenUrl: '/api/v1/auth/login',
              scopes: {}
            }
          },
          description: 'Login with email and password to get JWT token'
        }
      },
    },
    security: [
      { BearerAuth: [] },
      { ApiKeyAuth: [] },
      { EmailPassword: [] }
    ],
    tags: [
      { name: 'Auth', description: 'Authentication and user management endpoints' },
      { name: 'Forms', description: 'Form management and submission endpoints' },
      { name: 'Entries', description: 'Sales entry management endpoints' },
      { name: 'User Identifiers', description: 'Business identifier management endpoints' },
      { name: 'Tax Rates', description: 'Tax rate management endpoints' },
      { name: 'PDF', description: 'PDF generation and preview endpoints' },
    ],
  },
  apis: ['./src/app/api/**/*.ts'],
}; 