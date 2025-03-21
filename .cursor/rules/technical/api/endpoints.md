# API Endpoints Specification

This document outlines the RESTful API endpoints for the NC Cigar Sales Form Filler application. The API is designed as the foundation of the application, with all client interfaces consuming these endpoints.

## API Version

All endpoints are prefixed with `/api/v1/` to enable future API versioning.

## Authentication Endpoints

### `POST /api/v1/auth/register`
Create a new user account with role-based permissions.

**Request Body:**
```json
{
  "email": "string",
  "password": "string",
  "company_name": "string",
  "role": "string" // default: "vendor"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "company_name": "string",
    "role": "string",
    "created_at": "datetime"
  },
  "token": "string",
  "refresh_token": "string",
  "expires_at": "datetime"
}
```

### `POST /api/v1/auth/login`
Authenticate a user and return JWT with role information.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "string",
    "company_name": "string",
    "role": "string",
    "last_login": "datetime"
  },
  "token": "string",
  "refresh_token": "string",
  "expires_at": "datetime"
}
```

### `POST /api/v1/auth/refresh`
Refresh an authentication token.

**Request Body:**
```json
{
  "refresh_token": "string"
}
```

**Response (200):**
```json
{
  "token": "string",
  "refresh_token": "string",
  "expires_at": "datetime"
}
```

### `POST /api/v1/auth/logout`
End a user session and invalidate tokens.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204):**
No content

### `POST /api/v1/auth/password/reset-request`
Request a password reset.

**Request Body:**
```json
{
  "email": "string"
}
```

**Response (200):**
```json
{
  "message": "Password reset email sent if account exists"
}
```

### `POST /api/v1/auth/password/reset`
Reset password with token.

**Request Body:**
```json
{
  "token": "string",
  "password": "string"
}
```

**Response (200):**
```json
{
  "message": "Password has been reset"
}
```

## User Management

### `GET /api/v1/users/me`
Get current user profile with role information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "string",
  "company_name": "string",
  "role": "string",
  "auth_provider": "string",
  "created_at": "datetime",
  "last_login": "datetime",
  "subscription_status": "string",
  "subscription_expiry": "datetime"
}
```

### `PUT /api/v1/users/me`
Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "string",
  "company_name": "string"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "string",
  "company_name": "string",
  "updated_at": "datetime"
}
```

### `GET /api/v1/users/roles`
Get available roles (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "permissions": ["string"]
  }
]
```

## User Identifiers

### `GET /api/v1/user-identifiers`
List all business identifiers for current user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "legal_name": "string",
    "nc_dor_id": "string",
    "trade_name": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zip_code": "string",
    "created_at": "datetime"
  }
]
```

### `POST /api/v1/user-identifiers`
Create a new business identifier.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "legal_name": "string",
  "nc_dor_id": "string",
  "trade_name": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zip_code": "string"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "legal_name": "string",
  "nc_dor_id": "string",
  "trade_name": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zip_code": "string",
  "created_at": "datetime"
}
```

### `PUT /api/v1/user-identifiers/:id`
Update a business identifier.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "legal_name": "string",
  "nc_dor_id": "string",
  "trade_name": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zip_code": "string"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "legal_name": "string",
  "nc_dor_id": "string",
  "trade_name": "string",
  "address": "string",
  "city": "string",
  "state": "string",
  "zip_code": "string",
  "updated_at": "datetime"
}
```

## Form Management

### `GET /api/v1/forms`
List all forms for current user with advanced filtering.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
status: string (optional, filter by status)
start_date: date (optional, filter by period starting date)
end_date: date (optional, filter by period ending date)
sort: string (optional, field to sort by)
order: string (optional, asc or desc, default: desc)
page: number (optional, default: 1)
limit: number (optional, default: 10)
```

**Response (200):**
```json
{
  "data": [
    {
      "id": "uuid",
      "user_identifier_id": "uuid",
      "date_range_start": "date",
      "date_range_end": "date",
      "created_at": "datetime",
      "status": "string",
      "total_entries": "number",
      "total_amount": "number",
      "tax_calculated": "number",
      "user_identifier": {
        "legal_name": "string",
        "nc_dor_id": "string"
      }
    }
  ],
  "pagination": {
    "total": "number",
    "page": "number",
    "limit": "number",
    "pages": "number"
  }
}
```

### `POST /api/v1/forms`
Create a new form.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "user_identifier_id": "uuid",
  "date_range_start": "date",
  "date_range_end": "date"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "user_identifier_id": "uuid",
  "date_range_start": "date",
  "date_range_end": "date",
  "created_at": "datetime",
  "status": "draft"
}
```

### `GET /api/v1/forms/:id`
Get a specific form.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "user_identifier_id": "uuid",
  "date_range_start": "date",
  "date_range_end": "date",
  "created_at": "datetime",
  "updated_at": "datetime",
  "status": "string",
  "total_entries": "number",
  "total_amount": "number",
  "tax_calculated": "number",
  "user_identifier": {
    "legal_name": "string",
    "nc_dor_id": "string",
    "trade_name": "string",
    "address": "string",
    "city": "string",
    "state": "string",
    "zip_code": "string"
  }
}
```

### `PUT /api/v1/forms/:id`
Update a form.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "date_range_start": "date",
  "date_range_end": "date",
  "status": "string"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "user_identifier_id": "uuid",
  "date_range_start": "date",
  "date_range_end": "date",
  "updated_at": "datetime",
  "status": "string"
}
```

### `DELETE /api/v1/forms/:id`
Delete a form.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204):**
No content

## Sales Entries

### `GET /api/v1/forms/:id/entries`
Get all entries for a form with optional filtering and sorting.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
vendor: string (optional, filter by vendor name)
start_date: date (optional, filter by sale date)
end_date: date (optional, filter by sale date)
sort: string (optional, field to sort by)
order: string (optional, asc or desc, default: asc)
```

**Response (200):**
```json
[
  {
    "id": "uuid",
    "form_id": "uuid",
    "date_of_sale": "date",
    "invoice_number": "string",
    "vendor_name": "string",
    "cigar_description": "string",
    "number_of_cigars": "number",
    "cost_of_cigar": "number",
    "subtotal": "number",
    "tax_rate": "number",
    "tax_amount": "number",
    "entry_index": "number",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

### `POST /api/v1/forms/:id/entries`
Add a new entry with automatic tax calculation.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "date_of_sale": "date",
  "invoice_number": "string",
  "vendor_name": "string",
  "cigar_description": "string",
  "number_of_cigars": "number",
  "cost_of_cigar": "number"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "form_id": "uuid",
  "date_of_sale": "date",
  "invoice_number": "string",
  "vendor_name": "string",
  "cigar_description": "string",
  "number_of_cigars": "number",
  "cost_of_cigar": "number",
  "subtotal": "number",
  "tax_rate": "number",
  "tax_amount": "number",
  "entry_index": "number",
  "created_at": "datetime"
}
```

### `PUT /api/v1/forms/:formId/entries/:id`
Update a sales entry.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "date_of_sale": "date",
  "invoice_number": "string",
  "vendor_name": "string",
  "cigar_description": "string",
  "number_of_cigars": "number",
  "cost_of_cigar": "number"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "form_id": "uuid",
  "date_of_sale": "date",
  "invoice_number": "string",
  "vendor_name": "string",
  "cigar_description": "string",
  "number_of_cigars": "number",
  "cost_of_cigar": "number",
  "subtotal": "number",
  "tax_rate": "number",
  "tax_amount": "number",
  "entry_index": "number",
  "updated_at": "datetime"
}
```

### `DELETE /api/v1/forms/:formId/entries/:id`
Delete a sales entry.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204):**
No content

### `POST /api/v1/forms/:id/entries/bulk`
Bulk import entries from CSV/Excel.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body:**
```
file: File (CSV or Excel)
```

**Response (201):**
```json
{
  "imported": "number",
  "failed": "number",
  "errors": [
    {
      "row": "number",
      "message": "string"
    }
  ]
}
```

## PDF Generation

### `POST /api/v1/forms/:id/generate`
Generate official B-A-101 Schedule A PDF form with digital signature support.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "include_signature": "boolean",
  "signature_data": "string" // base64 encoded signature image (optional)
}
```

**Response (200):**
```json
{
  "url": "string", // Temporary URL to download the PDF
  "expires_at": "datetime",
  "file_name": "string",
  "file_size": "number",
  "generated_at": "datetime"
}
```

### `GET /api/v1/forms/:id/preview`
Get a preview of the form (lower resolution PDF or image).

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
format: string (optional, "pdf" or "image", default: "pdf")
page: number (optional, page number to preview, default: 1)
```

**Response (200):**
PDF or image data with appropriate content type header.

### `POST /api/v1/forms/:id/submit`
Submit a completed form to the system and finalize the PDF.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "status": "submitted",
  "submitted_at": "datetime",
  "pdf_url": "string",
  "confirmation_number": "string"
}
```

## Tax Rate Management

### `GET /api/v1/tax-rates`
Get the current and historical tax rates and multipliers for cigars.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "current_rate": {
    "id": "uuid",
    "rate": "number",
    "multiplier": "number",
    "effective_from": "date",
    "effective_to": null,
    "created_at": "datetime",
    "created_by": "uuid"
  },
  "previous_rates": [
    {
      "id": "uuid",
      "rate": "number",
      "multiplier": "number",
      "effective_from": "date",
      "effective_to": "date",
      "created_at": "datetime",
      "created_by": "uuid"
    }
  ]
}
```

### `GET /api/v1/tax-rates/:id`
Get a specific tax rate by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "rate": "number",
  "multiplier": "number",
  "effective_from": "date",
  "effective_to": "date",
  "created_at": "datetime",
  "created_by": "uuid"
}
```

### `GET /api/v1/tax-rates/effective-on/:date`
Get the tax rate that was effective on a specific date.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "rate": "number",
  "multiplier": "number",
  "effective_from": "date",
  "effective_to": "date",
  "created_at": "datetime",
  "created_by": "uuid"
}
```

### `POST /api/v1/tax-rates`
Create a new tax rate (admin only).

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rate": "number",
  "multiplier": "number",
  "effective_from": "date"
}
```

**Response (201):**
```json
{
  "id": "uuid",
  "rate": "number",
  "multiplier": "number",
  "effective_from": "date",
  "effective_to": null,
  "created_at": "datetime",
  "created_by": "uuid"
}
```

### `PUT /api/v1/tax-rates/:id`
Update a tax rate (admin only). Only allows updating of future rates.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "rate": "number",
  "multiplier": "number",
  "effective_from": "date"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "rate": "number",
  "multiplier": "number",
  "effective_from": "date",
  "effective_to": null,
  "created_at": "datetime",
  "updated_at": "datetime",
  "created_by": "uuid"
}
```

### `DELETE /api/v1/tax-rates/:id`
Delete a tax rate (admin only). Only allows deletion of future rates that haven't taken effect yet.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204):**
No content

### `POST /api/v1/forms/:id/calculate`
Calculate taxes for all entries in a form using the appropriate tax rate.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "total_cigars": "number",
  "total_cost": "number",
  "total_tax": "number",
  "calculation_date": "datetime",
  "tax_rate_used": {
    "id": "uuid",
    "rate": "number",
    "multiplier": "number",
    "effective_from": "date"
  }
}
```

## Error Response Format

All API endpoints use a consistent error response format:

**Error Response:**
```json
{
  "status": "number",
  "message": "string",
  "code": "string", // Machine-readable error code
  "details": {}, // Optional additional error details
  "timestamp": "datetime",
  "path": "string" // API path that generated the error
}
```

## Rate Limiting

All API endpoints are subject to rate limiting:

* 60 requests per minute for authenticated users
* 10 requests per minute for unauthenticated requests

**Rate Limit Headers:**
```
X-RateLimit-Limit: number
X-RateLimit-Remaining: number
X-RateLimit-Reset: timestamp
```

**Rate Limit Exceeded Response (429):**
```json
{
  "status": 429,
  "message": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "details": {
    "limit": "number",
    "reset_at": "datetime"
  }
}
```

## Authorization

The API uses role-based access control with the following roles:

* **admin**: Full access to all endpoints
* **vendor**: Access to own forms and entries
* **readonly**: Read-only access to own forms and entries

Each endpoint implementation validates the user's role against required permissions:

```typescript
// Example middleware implementation
export function requirePermission(permission: string) {
  return async (req: NextApiRequest, res: NextApiResponse, next: () => void) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: 'Unauthorized',
        code: 'UNAUTHORIZED'
      });
    }
    
    const hasPermission = await checkUserPermission(user.id, permission);
    if (!hasPermission) {
      return res.status(403).json({
        status: 403,
        message: 'Forbidden',
        code: 'FORBIDDEN'
      });
    }
    
    next();
  };
}
```

## Webhook Endpoints

### `POST /api/v1/webhooks/payment`
Payment processing webhook (from payment provider).

**Request Headers:**
```
X-Webhook-Signature: string
```

**Request Body:**
```json
{
  "event": "string",
  "payment_id": "string",
  "user_id": "string",
  "amount": "number",
  "status": "string",
  "timestamp": "datetime"
}
```

**Response (200):**
```json
{
  "received": true
}
```

## Implementation Examples

### PDF Generation Implementation

```typescript
// pages/api/v1/forms/[id]/generate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser, requirePermission } from '@/lib/auth';
import { getFormById } from '@/lib/database';
import { generateFormPDF } from '@/lib/pdf-generator';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Authenticate user
  const user = await authenticateUser(req);
  if (!user) {
    return res.status(401).json({ 
      status: 401, 
      message: 'Unauthorized',
      code: 'UNAUTHORIZED'
    });
  }
  
  // Check permission
  const hasPermission = await requirePermission('forms:generate')(req, res, () => {});
  if (!hasPermission) {
    return;
  }
  
  // Process request
  if (req.method === 'POST') {
    const { id } = req.query;
    const { include_signature, signature_data } = req.body;
    
    try {
      // Get form data
      const form = await getFormById(id as string, user.id);
      if (!form) {
        return res.status(404).json({ 
          status: 404, 
          message: 'Form not found',
          code: 'FORM_NOT_FOUND'
        });
      }
      
      // Generate PDF
      const pdfResult = await generateFormPDF(form, {
        includeSignature: include_signature,
        signatureData: signature_data
      });
      
      return res.status(200).json({
        url: pdfResult.url,
        expires_at: pdfResult.expiresAt,
        file_name: pdfResult.fileName,
        file_size: pdfResult.fileSize,
        generated_at: pdfResult.generatedAt
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      return res.status(500).json({ 
        status: 500, 
        message: 'Failed to generate PDF',
        code: 'PDF_GENERATION_FAILED'
      });
    }
  }
  
  return res.status(405).json({ 
    status: 405, 
    message: 'Method not allowed',
    code: 'METHOD_NOT_ALLOWED'
  });
}
```

### Tax Rate Management Implementation

```typescript
// pages/api/v1/tax-rates/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { authenticateUser, requirePermission } from '@/lib/auth';
import { getCurrentTaxRate, getAllTaxRates, createTaxRate } from '@/lib/tax-rates';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Authenticate user
  const user = await authenticateUser(req);
  if (!user) {
    return res.status(401).json({ 
      status: 401, 
      message: 'Unauthorized',
      code: 'UNAUTHORIZED'
    });
  }
  
  // GET - Retrieve all tax rates
  if (req.method === 'GET') {
    try {
      const currentRate = await getCurrentTaxRate();
      const allRates = await getAllTaxRates();
      
      const previousRates = allRates
        .filter(rate => rate.id !== currentRate.id)
        .sort((a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime());
      
      return res.status(200).json({
        current_rate: currentRate,
        previous_rates: previousRates
      });
    } catch (error) {
      console.error('Failed to fetch tax rates:', error);
      return res.status(500).json({ 
        status: 500, 
        message: 'Failed to fetch tax rates',
        code: 'TAX_RATE_FETCH_FAILED'
      });
    }
  }
  
  // POST - Create a new tax rate (admin only)
  if (req.method === 'POST') {
    // Check for admin permission
    const hasPermission = await requirePermission('tax:write')(req, res, () => {});
    if (!hasPermission) {
      return;
    }
    
    try {
      const { rate, multiplier, effective_from } = req.body;
      
      // Validate request body
      if (!rate || !multiplier || !effective_from) {
        return res.status(400).json({ 
          status: 400, 
          message: 'Missing required fields',
          code: 'MISSING_REQUIRED_FIELDS'
        });
      }
      
      // Create new tax rate
      const newRate = await createTaxRate({
        rate,
        multiplier,
        effective_from,
        created_by: user.id
      });
      
      return res.status(201).json(newRate);
    } catch (error) {
      console.error('Failed to create tax rate:', error);
      return res.status(500).json({ 
        status: 500, 
        message: 'Failed to create tax rate',
        code: 'TAX_RATE_CREATE_FAILED'
      });
    }
  }
  
  // Method not allowed
  return res.status(405).json({ 
    status: 405, 
    message: 'Method not allowed',
    code: 'METHOD_NOT_ALLOWED'
  });
}
```

## Form Service Interface

The Form Service module exports several interfaces and constants that are used throughout the application:

### SavedForm Interface
```typescript
export interface SavedForm {
  id: string;
  user_id: string;
  form_data: FormValues;
  status: FormStatus; // 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected'
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  tax_calculated: number;
}
```

### FormValues Interface
```typescript
export interface FormValues {
  legalName: string;
  ncDorId: string;
  periodBeginning: string;
  periodEnding: string;
  salesEntries: SalesEntryFormValues[];
  tradeName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  contactPhone?: string;
  contactEmail?: string;
  signatureDate?: string;
  signatureData?: string;
}
```

### SalesEntryFormValues Interface
```typescript
export interface SalesEntryFormValues {
  id?: string;
  dateOfSale: string;
  invoiceNumber: string;
  vendorName: string;
  cigarDescription: string;
  numberOfCigars: number;
  costOfCigar: number;
  subtotal?: number;
  taxRate?: number;
  taxAmount?: number;
}
```

### TaxRate Interface
```typescript
export interface TaxRate {
  id: string;
  rate: number;
  multiplier: number;
  effective_from: string;
  effective_to?: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
}
```

### EMPTY_SALES_ENTRY Constant
```typescript
export const EMPTY_SALES_ENTRY: SalesEntryFormValues = {
  dateOfSale: '',
  invoiceNumber: '',
  vendorName: '',
  cigarDescription: '',
  numberOfCigars: 0,
  costOfCigar: 0
};
```
This constant is used for initializing new sales entries throughout the application.
