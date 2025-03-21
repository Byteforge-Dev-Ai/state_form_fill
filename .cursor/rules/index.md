# NC Cigar Sales Form Filler - Project Guide

This directory contains the specifications and guidelines for the NC Cigar Sales Form Filler application. The application allows cigar vendors in North Carolina to complete state-required sales reporting forms through a digital interface.

## Directory Structure

- `/form/` - Original B-A-101 Schedule A form reference
- `/requirements/` - Project requirements organized by area
- `/technical/` - Technical specifications and architecture
- `/technical/api/` - API documentation and specifications
- `/ui/` - User interface design system and specifications
- `/reference/` - Original full specification documents

## Core Project Objectives

1. Create a robust API for NC cigar vendors' tax form submission and processing
2. Generate proper B-A-101 Schedule A forms with correct tax calculations
3. Implement secure authentication and data management
4. Develop a user-friendly interface that consumes the API
5. Ensure compliance with NC Department of Revenue requirements

## Project Priorities

- **Phase 1 (API Foundation - 2 months)**: 
  - Core API development for form submission and retrieval
  - Authentication system with role-based access
  - PDF generation service
  - Basic data validation

- **Phase 2 (UI Integration - 2 months)**: 
  - User interface development that consumes the API
  - Form entry UI components
  - Dashboard for form management
  - User profile management

- **Phase 3 (Enhanced Features - 3 months)**: 
  - Payment processing integration
  - Enhanced reporting
  - SSO implementation
  - Advanced user management

- **Phase 4 (Scaling - 4 months)**: 
  - API expansion for third-party integrations
  - Subscription model implementation
  - Performance optimizations
  - Advanced analytics

## Key Technical Decisions

- **Backend/API**: 
  - Node.js with Express or NestJS
  - OpenAPI/Swagger for API documentation
  - Jest for testing

- **Database**: 
  - Supabase with PostgreSQL
  - TypeORM or Prisma for ORM

- **Authentication**: 
  - Supabase Auth with JWT
  - Role-based access control

- **PDF Processing**: 
  - pdf-lib for server-side PDF generation
  - Option to explore Puppeteer for complex layouts

- **Frontend**: 
  - Next.js 15.2+ (App Router for API consumption)
  - React 18.2.0
  - React Query for API state management
  - ag-grid-react for professional data table displays
  - Shadcn/UI, Radix UI for components

- **Form Handling**: 
  - React Hook Form with Zod validation
  - API-driven form configurations

Use this guide to navigate through the documentation. For each area of development, start with the API specifications before diving into UI implementation details. The API-first approach ensures a solid foundation that can support multiple client applications in the future.
