# NC Cigar Sales Form Filler

An API-first application to automate the process of filling North Carolina cigar sales tax forms. This system helps vendors track sales, calculate taxes, and generate properly formatted submissions to the NC Department of Revenue.

## Features

- User authentication with role-based access control
- Business identifier management for state tax reporting
- Sales entry management with automated tax calculations
- PDF form generation based on NC Department of Revenue templates
- Comprehensive API for integration with point-of-sale systems
- Audit logging for all system actions

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth
- **Documentation**: Swagger/OpenAPI
- **Deployment**: Vercel (frontend), Supabase (backend)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase CLI

### Installation

1. Clone the repository
   ```
   git clone https://github.com/Byteforge-Dev-Ai/state_form_fill.git
   cd state_form_fill
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   ```
   cp .env.example .env.local
   ```
   
4. Start Supabase locally
   ```
   npx supabase start
   ```

5. Apply database migrations
   ```
   npx supabase db push
   ```

6. Start the development server
   ```
   npm run dev
   ```

7. Access the application at http://localhost:3000 and API docs at http://localhost:3000/api-docs

## Database Schema

The application uses a comprehensive PostgreSQL schema with the following core models:

- Users and authentication
- Business identifiers
- Form submissions
- Sales entries
- Tax rates
- Payments
- PDF generation

A full ERD and schema documentation is available in the `/docs` directory.

## API Documentation

API documentation is available at the `/api-docs` endpoint when running the application. The API follows RESTful principles and includes comprehensive validation and error handling.

## License

MIT 