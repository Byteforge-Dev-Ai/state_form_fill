# NC Cigar Sales Form Filler - Technical Specification

## Technology Stack

### Frontend
- **Framework**: Next.js 14+
- **UI Components**: 
  - **TanStack Table v8**: For table/grid form entry interface
    ```tsx
    import { 
      createColumnHelper,
      flexRender,
      getCoreRowModel,
      useReactTable
    } from '@tanstack/react-table'
    
    // Column definition example
    const columnHelper = createColumnHelper<SalesEntry>()
    const columns = [
      columnHelper.accessor('dateOfSale', {
        header: 'Date of Sale',
        cell: info => info.getValue()
      }),
      // Additional columns...
    ]
    ```
  - **Shadcn/UI**: Modern component collection
    ```tsx
    import { Button } from "@/components/ui/button"
    import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
    import { Input } from "@/components/ui/input"
    ```
  - **Radix UI**: Accessible primitive components
    ```tsx
    import * as Dialog from '@radix-ui/react-dialog';
    import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
    ```
- **Form Handling**: 
  - React Hook Form v7+ for validation and state management
    ```tsx
    import { useForm } from "react-hook-form";
    import { zodResolver } from "@hookform/resolvers/zod";
    ```
  - Zod for schema validation
    ```tsx
    import { z } from "zod";
    
    const salesEntrySchema = z.object({
      dateOfSale: z.date(),
      invoiceNumber: z.string().min(1),
      vendorName: z.string().min(1).max(35),
      // Additional fields...
    });
    ```
- **State Management**: 
  - React Context API for global application state
  - Zustand v4+ for simpler state management cases
    ```tsx
    import create from 'zustand';
    
    interface FormStore {
      entries: SalesEntry[];
      addEntry: (entry: SalesEntry) => void;
      // Additional actions...
    }
    
    const useFormStore = create<FormStore>((set) => ({
      entries: [],
      addEntry: (entry) => set((state) => ({ 
        entries: [...state.entries, entry] 
      })),
      // Additional implementations...
    }));
    ```

### Backend
- **Primary Technology**: Next.js API Routes
- **API Design**: RESTful API endpoints within Next.js
  ```tsx
  // pages/api/forms/[id].ts
  import type { NextApiRequest, NextApiResponse } from 'next'
  import { getFormById } from '@/lib/database'
  
  export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const { id } = req.query
    
    if (req.method === 'GET') {
      const form = await getFormById(id as string)
      return res.status(200).json(form)
    }
    
    // Additional methods...
    
    return res.status(405).json({ message: 'Method not allowed' })
  }
  ```
- **PDF Processing**: JavaScript/TypeScript options
  - **pdf-lib**: Main library for PDF manipulation
    ```tsx
    import { PDFDocument, rgb } from 'pdf-lib';
    
    async function fillForm(formData) {
      const formUrl = '/templates/nc-cigar-form.pdf';
      const formPdfBytes = await fetch(formUrl).then(res => res.arrayBuffer());
      const pdfDoc = await PDFDocument.load(formPdfBytes);
      const form = pdfDoc.getForm();
      
      // Fill form fields
      const legalName = formData.legalName.padEnd(35, ' ').split('');
      for (let i = 0; i < 35; i++) {
        form.getTextField(`LN${i+1}`).setText(legalName[i] || '');
      }
      
      const ncDorId = formData.ncDorId.padEnd(11, ' ').split('');
      for (let i = 0; i < 11; i++) {
        form.getTextField(`D${i+1}`).setText(ncDorId[i] || '');
      }
      
      // Format dates
      const startDate = new Date(formData.dateRangeStart);
      form.getTextField('BDM1').setText(startDate.getMonth().toString().padStart(2, '0')[0]);
      form.getTextField('BDM2').setText(startDate.getMonth().toString().padStart(2, '0')[1]);
      form.getTextField('BDD1').setText(startDate.getDate().toString().padStart(2, '0')[0]);
      form.getTextField('BDD2').setText(startDate.getDate().toString().padStart(2, '0')[1]);
      form.getTextField('BDY1').setText(startDate.getFullYear().toString().substr(2)[0]);
      form.getTextField('BDY2').setText(startDate.getFullYear().toString().substr(2)[1]);
      
      const endDate = new Date(formData.dateRangeEnd);
      form.getTextField('EDM1').setText(endDate.getMonth().toString().padStart(2, '0')[0]);
      form.getTextField('EDM2').setText(endDate.getMonth().toString().padStart(2, '0')[1]);
      form.getTextField('EDD1').setText(endDate.getDate().toString().padStart(2, '0')[0]);
      form.getTextField('EDD2').setText(endDate.getDate().toString().padStart(2, '0')[1]);
      form.getTextField('EDY1').setText(endDate.getFullYear().toString().substr(2)[0]);
      form.getTextField('EDY2').setText(endDate.getFullYear().toString().substr(2)[1]);
      
      // Fill sales entries
      formData.entries.forEach((entry, index) => {
        if (index < 19) { // Max 19 entries per page
          const i = index + 1;
          form.getTextField(`Date${i}`).setText(formatDate(entry.dateOfSale));
          form.getTextField(`Invoice${i}`).setText(entry.invoiceNumber);
          form.getTextField(`Vendor${i}`).setText(entry.vendorName);
          form.getTextField(`Description${i}`).setText(entry.cigarDescription);
          form.getTextField(`Count${i}`).setText(entry.numberOfCigars.toString());
          form.getTextField(`Cost${i}`).setText(formatCurrency(entry.costOfCigar));
        }
      });
      
      // Calculate and fill totals
      const totalNumberOfCigars = formData.entries.reduce((sum, entry) => sum + entry.numberOfCigars, 0);
      const totalCostOfCigars = formData.entries.reduce((sum, entry) => sum + entry.costOfCigar, 0);
      
      form.getTextField('TotalCount').setText(totalNumberOfCigars.toString());
      form.getTextField('TotalCost').setText(formatCurrency(totalCostOfCigars));
      
      // Flatten the form to prevent further editing
      form.flatten();
      
      return pdfDoc.save();
    }
    
    function formatDate(dateString) {
      const date = new Date(dateString);
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear().toString().substr(2)}`;
    }
    
    function formatCurrency(amount) {
      return amount.toFixed(2);
    }
    ```
  - **PDF Page Generation**: Support for multi-page form generation
    ```tsx
    async function generateMultiPageForm(formData) {
      const entriesPerPage = 19;
      const totalPages = Math.ceil(formData.entries.length / entriesPerPage);
      const pdfDocs = [];
      
      for (let page = 0; page < totalPages; page++) {
        const pageEntries = formData.entries.slice(
          page * entriesPerPage, 
          (page + 1) * entriesPerPage
        );
        
        const pageFormData = {
          ...formData,
          entries: pageEntries,
          pageNumber: page + 1,
          totalPages: totalPages
        };
        
        const pdfBytes = await fillForm(pageFormData);
        pdfDocs.push(await PDFDocument.load(pdfBytes));
      }
      
      // Merge all pages into a single PDF
      const mergedPdf = await PDFDocument.create();
      for (const doc of pdfDocs) {
        const copiedPages = await mergedPdf.copyPages(doc, doc.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }
      
      return mergedPdf.save();
    }
    ```

### Database & Authentication
- **Primary DB**: Supabase
  - PostgreSQL database with row-level security
  - Structured migrations for schema changes
  - Connection example:
    ```tsx
    import { createClient } from '@supabase/supabase-js'
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    ```
  - Schema creation script:
    ```sql
    -- Users table
    CREATE TABLE users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      auth_provider TEXT NOT NULL DEFAULT 'email',
      provider_user_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_login TIMESTAMP WITH TIME ZONE,
      subscription_status TEXT DEFAULT 'free'
    );
    
    -- User identifiers table
    CREATE TABLE user_identifiers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      legal_name VARCHAR(35) NOT NULL,
      nc_dor_id VARCHAR(11) NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(user_id, legal_name)
    );
    
    -- Form submissions table
    CREATE TABLE form_submissions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_identifier_id UUID REFERENCES user_identifiers(id) ON DELETE CASCADE,
      date_range_start DATE NOT NULL,
      date_range_end DATE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      form_count INTEGER DEFAULT 1,
      total_entries INTEGER DEFAULT 0,
      total_amount DECIMAL(10, 2) DEFAULT 0,
      status TEXT DEFAULT 'draft'
    );
    
    -- Sales entries table
    CREATE TABLE sales_entries (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      form_submission_id UUID REFERENCES form_submissions(id) ON DELETE CASCADE,
      date_of_sale DATE NOT NULL,
      invoice_number TEXT,
      vendor_name TEXT NOT NULL,
      cigar_description TEXT NOT NULL,
      number_of_cigars INTEGER NOT NULL,
      cost_of_cigar DECIMAL(10, 2) NOT NULL,
      tax_rate DECIMAL(5, 3) DEFAULT 0.128,
      cost_of_cigar_with_tax DECIMAL(10, 2) GENERATED ALWAYS AS (cost_of_cigar * tax_rate) STORED,
      cost_multiplier DECIMAL(5, 3) DEFAULT 0.30,
      cost_of_cigar_with_multiplier DECIMAL(10, 2) GENERATED ALWAYS AS (number_of_cigars * cost_multiplier) STORED,
      subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (
        GREATEST(cost_of_cigar_with_multiplier - cost_of_cigar_with_tax, 0)
      ) STORED,
      entry_index INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Payments table
    CREATE TABLE payments (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      user_id UUID REFERENCES users(id) ON DELETE SET NULL,
      form_submission_id UUID REFERENCES form_submissions(id) ON DELETE SET NULL,
      amount DECIMAL(10, 2) NOT NULL,
      payment_method TEXT NOT NULL,
      transaction_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      status TEXT DEFAULT 'pending',
      payment_processor TEXT NOT NULL
    );
    
    -- Row level security policies
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE user_identifiers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE sales_entries ENABLE ROW LEVEL SECURITY;
    ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
    
    -- Users can only access their own data
    CREATE POLICY users_policy ON users 
      FOR ALL USING (auth.uid() = id);
      
    CREATE POLICY user_identifiers_policy ON user_identifiers 
      FOR ALL USING (auth.uid() = user_id);
      
    CREATE POLICY form_submissions_policy ON form_submissions 
      FOR ALL USING (
        user_identifier_id IN (
          SELECT id FROM user_identifiers WHERE user_id = auth.uid()
        )
      );
      
    CREATE POLICY sales_entries_policy ON sales_entries 
      FOR ALL USING (
        form_submission_id IN (
          SELECT id FROM form_submissions 
          WHERE user_identifier_id IN (
            SELECT id FROM user_identifiers WHERE user_id = auth.uid()
          )
        )
      );
      
    CREATE POLICY payments_policy ON payments 
      FOR ALL USING (auth.uid() = user_id);
    ```
- **Primary Authentication Provider**: Supabase Auth
  - Strong password policies
  - JWT-based authentication
  - Multi-factor authentication option
  - Auth hooks integration example:
    ```tsx
    import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
    
    function Profile() {
      const user = useUser()
      const supabase = useSupabaseClient()
      
      async function logout() {
        await supabase.auth.signOut()
      }
      
      return (
        <div>
          <p>Email: {user?.email}</p>
          <button onClick={logout}>Logout</button>
        </div>
      )
    }
    ```
  - Authentication flow diagram:
    ```
    ┌─────────────┐     ┌────────────────┐     ┌─────────────────┐
    │             │     │                │     │                 │
    │   User UI   │────▶│  Auth Service  │────▶│  JWT Generated  │
    │             │     │                │     │                 │
    └─────────────┘     └────────────────┘     └─────────────────┘
           │                                            │
           │                                            ▼
           │                                    ┌─────────────────┐
           │                                    │                 │
           │                                    │  Session Store  │
           │                                    │                 │
           │                                    └─────────────────┘
           │                                            │
           ▼                                            ▼
    ┌─────────────┐                             ┌─────────────────┐
    │             │                             │                 │
    │  Protected  │◀────────────────────────────│   API Routes    │
    │  Resources  │                             │                 │
    │             │                             │                 │
    └─────────────┘                             └─────────────────┘
    ```

## Data Model

### User
- `id` (UUID): Primary key
- `email` (string): User's email address
- `password_hash` (string): Hashed password (not stored directly)
- `auth_provider` (enum): Authentication provider (email, google, apple, github)
- `provider_user_id` (string, nullable): ID from third-party auth provider
- `created_at` (datetime): Account creation timestamp
- `last_login` (datetime): Last login timestamp
- `subscription_status` (enum): Current subscription status

### UserIdentifier
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to User
- `legal_name` (string, max 35 chars): Business legal name
- `nc_dor_id` (string, max 11 chars): NC Department of Revenue ID
- `created_at` (datetime): Creation timestamp
- `updated_at` (datetime): Last update timestamp

### FormSubmission
- `id` (UUID): Primary key
- `user_identifier_id` (UUID): Foreign key to UserIdentifier
- `date_range_start` (date): Start of reporting period
- `date_range_end` (date): End of reporting period
- `created_at` (datetime): Form creation timestamp
- `updated_at` (datetime): Last update timestamp
- `form_count` (integer): Number of form pages generated
- `total_entries` (integer): Total number of sales entries
- `total_amount` (decimal): Total tax amount
- `status` (enum): Form status (draft, completed)

### SalesEntry
- `id` (UUID): Primary key
- `form_submission_id` (UUID): Foreign key to FormSubmission
- `date_of_sale` (date): When the sale occurred
- `invoice_number` (string): Reference invoice number
- `vendor_name` (string): Name of vendor
- `cigar_description` (string): Description of cigar product
- `number_of_cigars` (integer): Quantity sold
- `cost_of_cigar` (decimal): Base cost in USD
- `tax_rate` (decimal): Current NC tax rate (12.8%, not displayed to user)
- `cost_of_cigar_with_tax` (decimal): Calculated as `cost_of_cigar * tax_rate`
- `cost_multiplier` (decimal): Current NC multiplier ($0.30, not displayed to user)
- `cost_of_cigar_with_multiplier` (decimal): Calculated as `number_of_cigars * cost_multiplier`
- `subtotal` (decimal): Calculated as `cost_of_cigar_with_multiplier - cost_of_cigar_with_tax` (when negative, this value is zero)
- `entry_index` (integer): For ordering and pagination
- `created_at` (datetime): Creation timestamp
- `updated_at` (datetime): Last update timestamp

### Payment
- `id` (UUID): Primary key
- `user_id` (UUID): Foreign key to User
- `form_submission_id` (UUID): Foreign key to FormSubmission
- `amount` (decimal): Payment amount
- `payment_method` (string): Method used (credit card, etc.)
- `transaction_id` (string): Reference from payment processor
- `created_at` (datetime): Payment timestamp
- `status` (enum): Payment status (pending, completed, failed)
- `payment_processor` (string): Service used to process payment (Stripe, Square, etc.)

## PDF Form Field Mapping

The application maps data model fields to the B-A-101 Schedule A form fields using the following convention:

### Business Information Fields
- **UserIdentifier.legal_name** → LN1...LN35 (each character mapped to individual field)
- **UserIdentifier.nc_dor_id** → D1...D11 (each character mapped to individual field)

### Date Range Fields
- **FormSubmission.date_range_start** → BDM1, BDM2 (month), BDD1, BDD2 (day), BDY1, BDY2 (year)
- **FormSubmission.date_range_end** → EDM1, EDM2 (month), EDD1, EDD2 (day), EDY1, EDY2 (year)

### Sales Entry Fields
For each SalesEntry (up to 19 per page):
- **SalesEntry.date_of_sale** → Date1...Date19 
- **SalesEntry.invoice_number** → Invoice1...Invoice19
- **SalesEntry.vendor_name** → Vendor1...Vendor19
- **SalesEntry.cigar_description** → Description1...Description19
- **SalesEntry.number_of_cigars** → Count1...Count19
- **SalesEntry.cost_of_cigar** → Cost1...Cost19

### Total Fields
- Sum of all SalesEntry.number_of_cigars → TotalCount
- Sum of all SalesEntry.cost_of_cigar → TotalCost
- Sum of all SalesEntry.subtotal → Subtotal1
- Calculated discount (Subtotal1 * 0.98) → Subtotal2

## Entity Relationship Diagram

```
User 1──┐
         │
         │ 1..n
         ▼
    UserIdentifier 1──┐
                      │
                      │ 1..n
                      ▼
                 FormSubmission 1──┐   ┌── Payment
                                   │   │
                                   │   │ 1..1
                                   │   ▼
                                   │ 0..n
                                   ▼
                                SalesEntry
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate a user
- `POST /api/auth/refresh` - Refresh an authentication token
- `POST /api/auth/logout` - End a user session

### User Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `DELETE /api/users/me` - Delete account (with confirmation)

### User Identifiers
- `GET /api/user-identifiers` - List all business identifiers for current user
- `POST /api/user-identifiers` - Create a new business identifier
- `GET /api/user-identifiers/:id` - Get a specific business identifier
- `PUT /api/user-identifiers/:id` - Update a business identifier
- `DELETE /api/user-identifiers/:id` - Delete a business identifier

### Form Management
- `GET /api/forms` - List all forms for current user
- `POST /api/forms` - Create a new form
- `GET /api/forms/:id` - Get a specific form
- `PUT /api/forms/:id` - Update a form
- `DELETE /api/forms/:id` - Delete a form

### Sales Entries
- `GET /api/forms/:id/entries` - Get all entries for a form
- `POST /api/forms/:id/entries` - Add a new entry
- `PUT /api/forms/:id/entries/:entryId` - Update an entry
- `DELETE /api/forms/:id/entries/:entryId` - Delete an entry

### PDF Generation
- `POST /api/forms/:id/generate` - Generate PDF for a form
- `GET /api/forms/:id/preview` - Get a preview of the form

### Payments
- `POST /api/payments` - Process a payment
- `GET /api/payments` - List payment history

## Error Handling Strategy

### API Error Handling
```typescript
// Error response interface
interface ErrorResponse {
  status: number;
  message: string;
  details?: any;
}

// Custom error class
class ApiError extends Error {
  status: number;
  details?: any;
  
  constructor(status: number, message: string, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

// Error handler middleware
function errorHandler(
  err: Error,
  req: NextApiRequest,
  res: NextApiResponse<ErrorResponse>
) {
  if (err instanceof ApiError) {
    return res.status(err.status).json({
      status: err.status,
      message: err.message,
      details: err.details
    });
  }
  
  // Default to 500 internal error
  const status = 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error' 
    : err.message;
    
  return res.status(status).json({
    status,
    message
  });
}

// Example usage in API route
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Route implementation
    if (!req.body.required_field) {
      throw new ApiError(400, 'Missing required field');
    }
    
    // Process request...
    
  } catch (error) {
    return errorHandler(error as Error, req, res);
  }
}
```

### Frontend Error Handling
```typescript
// React error boundary component
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log to error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorPage />}>
  <FormComponent />
</ErrorBoundary>
```

## Logging and Monitoring

### Logging Strategy
- **Application Logs**: Winston for structured logging
  ```typescript
  import winston from 'winston';

  const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' })
    ]
  });

  // Usage
  logger.info('Form created', { formId, userId });
  logger.error('Payment processing failed', { error, paymentId });
  ```

- **Request Logging**: Middleware for HTTP request logging
  ```typescript
  import { NextApiRequest, NextApiResponse } from 'next';
  import { v4 as uuidv4 } from 'uuid';
  import { logger } from '@/lib/logger';

  export function requestLogger(
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => void
  ) {
    const requestId = uuidv4();
    const startTime = Date.now();
    
    // Add request ID to response headers
    res.setHeader('X-Request-ID', requestId);
    
    // Log request
    logger.info('API Request', {
      requestId,
      method: req.method,
      url: req.url,
      query: req.query,
      headers: {
        'user-agent': req.headers['user-agent'],
        'content-type': req.headers['content-type']
      }
    });
    
    // Override end method to log response
    const originalEnd = res.end;
    res.end = function(...args) {
      const duration = Date.now() - startTime;
      
      logger.info('API Response', {
        requestId,
        statusCode: res.statusCode,
        duration,
        size: res.getHeader('content-length')
      });
      
      return originalEnd.apply(res, args);
    };
    
    next();
  }
  ```

### Monitoring
- **Performance Monitoring**: Vercel Analytics
- **Error Tracking**: Sentry integration
  ```typescript
  // _app.tsx
  import { AppProps } from 'next/app';
  import * as Sentry from '@sentry/nextjs';

  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      tracesSampleRate: 0.1,
    });
  }

  function MyApp({ Component, pageProps }: AppProps) {
    return <Component {...pageProps} />;
  }

  export default MyApp;
  ```

- **Health Checks**: API endpoint for system health monitoring
  ```typescript
  // pages/api/health.ts
  import { NextApiRequest, NextApiResponse } from 'next';
  import { createClient } from '@supabase/supabase-js';

  export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
  ) {
    const startTime = Date.now();
    const checks = {
      database: false,
      api: true
    };
    
    try {
      // Check database connection
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_KEY!
      );
      
      const { data, error } = await supabase
        .from('health_check')
        .select('id')
        .limit(1)
        .timeout(2000);
        
      checks.database = !error;
    } catch (error) {
      checks.database = false;
    }
    
    const status = Object.values(checks).every(Boolean) ? 200 : 503;
    const responseTime = Date.now() - startTime;
    
    return res.status(status).json({
      status: status === 200 ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      checks,
      responseTime
    });
  }
  ```

## Testing Strategy

### Unit Testing
- Jest for component and utility testing
- React Testing Library for component interaction testing
- Example test:
  ```tsx
  import { render, screen } from '@testing-library/react'
  import userEvent from '@testing-library/user-event'
  import { SalesEntryForm } from './SalesEntryForm'
  
  describe('SalesEntryForm', () => {
    it('calculates tax correctly', async () => {
      render(<SalesEntryForm />)
      
      // Fill out form
      await userEvent.type(screen.getByLabelText(/cost/i), '10.00')
      await userEvent.type(screen.getByLabelText(/quantity/i), '5')
      
      // Check calculated result
      expect(screen.getByTestId('tax-amount')).toHaveTextContent('6.40')
    })
  })
  ```

### Integration Testing
- Cypress for end-to-end testing
  ```typescript
  // cypress/integration/form-submission.spec.ts
describe('Form Submission', () => {
    beforeEach(() => {
      cy.login('test@example.com', 'password');
      cy.visit('/forms/new');
    });
  
    it('allows creating a new form with entries', () => {
      // Fill out form metadata
      cy.getByTestId('business-select').click();
      cy.getByTestId('business-option-0').click();
      
      cy.getByTestId('date-range-start').type('2025-01-01');
      cy.getByTestId('date-range-end').type('2025-01-31');
      
      // Add sales entry
      cy.getByTestId('add-entry-button').click();
      cy.getByTestId('date-of-sale-0').type('2025-01-15');
      cy.getByTestId('invoice-number-0').type('INV-12345');
      cy.getByTestId('vendor-name-0').type('Cigar Supplier Inc.');
      cy.getByTestId('cigar-description-0').type('Premium Hand-Rolled Cigars');
      cy.getByTestId('number-of-cigars-0').type('50');
      cy.getByTestId('cost-of-cigar-0').type('8.75');
      
      // Verify calculations
      cy.getByTestId('tax-amount-0').should('contain', '56.00');
      cy.getByTestId('subtotal-0').should('contain', '15.00');
      
      // Submit form
      cy.getByTestId('save-form-button').click();
      
      // Verify redirect to preview
      cy.url().should('include', '/forms/');
      cy.url().should('include', '/preview');
      
      // Verify preview shows correct data
      cy.getByTestId('preview-total-entries').should('contain', '1');
      cy.getByTestId('preview-total-amount').should('contain', '15.00');
    });
    
    it('validates form fields correctly', () => {
      // Try to save without required fields
      cy.getByTestId('save-form-button').click();
      
      // Check error messages
      cy.getByTestId('business-select-error').should('be.visible');
      cy.getByTestId('date-range-start-error').should('be.visible');
      cy.getByTestId('date-range-end-error').should('be.visible');
      
      // Fill only some fields
      cy.getByTestId('business-select').click();
      cy.getByTestId('business-option-0').click();
      
      // Try to save again
      cy.getByTestId('save-form-button').click();
      
      // Check that remaining errors persist
      cy.getByTestId('date-range-start-error').should('be.visible');
      cy.getByTestId('date-range-end-error').should('be.visible');
    });
  });
  ```

### Performance Testing
- Lighthouse for frontend performance metrics
- Load testing with k6
  ```typescript
  // k6-load-test.js
  import http from 'k6/http';
  import { sleep, check } from 'k6';

  export const options = {
    vus: 100,
    duration: '30s',
    thresholds: {
      http_req_duration: ['p(95)<500'], // 95% of requests should complete within 500ms
      http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
    },
  };

  export default function() {
    // Test form listing endpoint
    const formsResponse = http.get('https://app.example.com/api/forms', {
      headers: { Authorization: `Bearer ${__ENV.API_TOKEN}` },
    });
    
    check(formsResponse, {
      'status is 200': (r) => r.status === 200,
      'response time < 200ms': (r) => r.timings.duration < 200,
    });
    
    // Test form creation
    const payload = JSON.stringify({
      userIdentifierId: '123e4567-e89b-12d3-a456-426614174000',
      dateRangeStart: '2025-01-01',
      dateRangeEnd: '2025-01-31',
    });
    
    const createResponse = http.post('https://app.example.com/api/forms', payload, {
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${__ENV.API_TOKEN}` 
      },
    });
    
    check(createResponse, {
      'status is 201': (r) => r.status === 201,
      'has formId': (r) => JSON.parse(r.body).id !== undefined,
    });
    
    sleep(1);
  }
  ```

## Deployment

### Development Environment
- Local development with Next.js dev server (`npm run dev`)
- Supabase local development with Docker
  ```bash
  npx supabase start
  ```
- Environment variables managed via `.env.local`
- Version control with Git
- CI integration with GitHub Actions for PR checks

### Staging Environment
- Vercel for frontend and API routes
  - Preview deployments for each PR
  - Automatic deployments from `staging` branch
- Supabase staging project with row-level security
- Environment variables managed via Vercel dashboard
- Continuous integration with automated tests

### Production Environment
- Vercel for frontend and API routes
  - Production deployments from `main` branch
  - Manual promotion from staging
- Supabase production project with enhanced security
  - IP allowlisting
  - Database backup strategy
  - Monitoring alerts
- Environment variables managed via Vercel dashboard
- Content-Security-Policy headers
- Rate limiting on API routes

### CI/CD Pipeline
```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main, staging]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      
  integration:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - name: Cypress tests
        uses: cypress-io/github-action@v5
        with:
          build: npm run build
          start: npm start
          
  deploy:
    if: github.event_name == 'push' && (github.ref == 'refs/heads/main' || github.ref == 'refs/heads/staging')
    runs-on: ubuntu-latest
    needs: [test, integration]
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: ${{ github.ref == 'refs/heads/main' && '--prod' || '' }}
```