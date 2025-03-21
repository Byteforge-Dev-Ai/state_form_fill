# NC Cigar Sales Form Filler - Requirements

## Project Overview

The NC Cigar Sales Form Filler is a web application that allows cigar vendors in North Carolina to easily complete state-required sales reporting forms through a digital interface. The application will convert user-entered data into properly formatted, filled PDF forms that can be downloaded, printed, and mailed with payment to the appropriate state agency.

## Core Features and Functionality

### 1. User Authentication System

- Email/password registration and login with strong password requirements
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- Single Sign-On (SSO) options:
  - Google authentication
  - Apple authentication
  - GitHub authentication
- Password reset functionality
  - Email-based recovery with secure tokens
  - Expiry time of 24 hours for reset links
- Account management
  - Purge any stored form data
  - Change email address
  - Update business information
  - View usage history
  - Manage subscription status
- Session handling and security
  - JWT-based authentication
  - Automatic logout after 30 minutes of inactivity
  - Concurrent session management
  - Device tracking for suspicious login detection

### 2. Form Data Entry Interface

- Spreadsheet-like grid for entering multiple sales entries
- Input fields for:
  - Date of sale (date picker)
  - Invoice number (text field)
  - Vendor name (text field, limit to 35 characters)
  - Cigar description (text field)
  - Number of cigars (numeric field)
  - Cost price of cigars (currency field)
- Automatic calculation of tax-related fields
  - Tax amount (cost price × 12.8%)
  - Multiplier amount (number of cigars × $0.30)
  - Subtotal (compare tax and multiplier, use whichever is lower)
  - Discount (2% of subtotal)
  - Final total amount
- Support for entering more than 19 entries (with automatic generation of additional form pages)
- Data validation to ensure all required fields are completed correctly
  - Dates within reporting period
  - Non-negative quantities and prices
  - Required fields completion check
  - Format validation for numeric fields
- Ability to save drafts and resume work later
- Bulk operations:
  - Import from CSV/Excel file
  - Copy/paste from spreadsheet
  - Duplicate entries
  - Delete multiple entries

### 3. PDF Generation

- Dynamic filling of pre-created PDF form template
  - B-A-101 Schedule A form
  - Proper text alignment in form fields
  - Formatted currency values
  - Formatted dates (MM/DD/YY)
- Automatic generation of multiple pages when entries exceed 19 rows
  - Consistent header information across pages
  - Sequential page numbering
  - Proper totaling on final page
- PDF flattening to prevent further editing
- Immediate download option for completed forms
- Preview capability before downloading
  - Thumbnails of all pages
  - Zoom and pan functionality
  - Print directly from preview
- Digital signature support (optional)
  - DocuSign integration
  - Self-signed certificates
  - Compliance with NC DOR requirements for digital signatures

### 4. Payment Processing

- Integration with modern payment gateways based on 2025 research:
  - **Stripe**: Developer-friendly API with comprehensive documentation
  - **Square**: Simplified flat-fee pricing model well-suited for pay-per-form
  - **Helcim**: Lower transaction fees for growing volume
- Receipt generation and email delivery
  - PDF receipts
  - Confirmation emails with download links
  - Compliance with tax receipt requirements
- Payment history tracking and reporting
  - Searchable payment history
  - Filter by date, amount, status
  - Exportable records for accounting purposes
- Support for both one-time and subscription-based payment models
  - Pay-per-form option ($1.99 per form)
  - Monthly subscription ($19.99 for unlimited forms)
  - Annual subscription ($199.99 for unlimited forms)
- Secure handling of payment information
  - PCI DSS compliance
  - No storage of full credit card details
  - Tokenization for recurring payments

### 5. User Dashboard

- Overview of form generation history
  - Recent submissions
  - Drafts in progress
  - Forms awaiting payment
- Account status and usage metrics
  - Subscription details
  - Usage statistics
  - Upcoming renewals
- Quick access to create new forms
  - New blank form button
  - Continue from draft option
  - Clone previous submission
- Notifications for important updates
  - System maintenance alerts
  - Tax rate changes
  - Form revision announcements
- Summary of recent submissions
  - Sortable list of submissions
  - Filter by date range, status
  - Quick preview of submission details

### 6. API Endpoint

- Swagger documentation
  - Interactive API testing
  - Authentication examples
  - Complete request/response models
- Secure access for potential integrations
  - API key authentication
  - OAuth 2.0 support
  - Rate limiting based on plan
- Endpoints for form generation
  - Create form from data
  - Retrieve form status
  - Download generated PDF
  - List historical forms
- Rate limiting and security controls
  - Request throttling
  - IP-based restrictions
  - Audit logging

## Non-Functional Requirements

### Performance Requirements

- Page load times under 2 seconds
  - Initial page load under 1.5 seconds
  - Subsequent navigation under 500ms
  - Optimized asset loading
- Form calculation updates in real-time
  - Field calculations under 100ms
  - Full form recalculation under 500ms
  - Debounced updates for rapid typing
- Support for up to 500 concurrent users
  - Graceful degradation under high load
  - Load balancing across multiple instances
  - Database connection pooling
- PDF generation completed within 5 seconds
  - Client-side generation for simple forms
  - Server-side generation for complex forms
  - Background processing for large batches
- Mobile responsiveness with usable interface on tablets
  - Adaptive layout for different screen sizes
  - Touch-friendly input controls
  - Simplified UI on smaller screens

### Security Requirements

- HTTPS for all connections
  - TLS 1.3 support
  - Strong cipher suites
  - HTTP Strict Transport Security (HSTS)
- Data encryption at rest and in transit
  - Database-level encryption
  - Secure storage of sensitive information
  - End-to-end encryption for document transfer
- OWASP compliance for common web vulnerabilities
  - Protection against XSS attacks
  - CSRF prevention
  - SQL injection protection
  - Input validation and sanitization
- Regular security audits
  - Quarterly vulnerability assessments
  - Annual penetration testing
  - Automated security scanning
- Compliance with financial data handling regulations
  - PCI DSS compliance for payment processing
  - Data minimization principles
  - Secure data retention policies

### Accessibility Requirements

- WCAG 2.1 AA compliance
  - Semantic HTML structure
  - Proper heading hierarchy
  - Accessible form controls
  - Sufficient color contrast
- Screen reader compatibility
  - ARIA attributes where needed
  - Accessible error messages
  - Meaningful alt text for images
  - Keyboard focus management
- Keyboard navigation support
  - Logical tab order
  - Shortcut keys for common actions
  - Visible focus indicators
  - No keyboard traps
- High contrast mode option
  - User-selectable color themes
  - High contrast toggle
  - Respects system preferences
- Appropriate text sizing and spacing
  - Responsive typography
  - Minimum touch target sizes
  - Adequate line spacing
  - Support for text resizing up to 200%

### Compatibility Requirements

- Support for modern browsers (Chrome, Firefox, Safari, Edge)
- Minimum supported versions: 
  - Chrome 90+
  - Firefox 90+
  - Safari 15+
  - Edge 90+
- Tablet support (iPad, Android tablets)
  - iPad iOS 14+
  - Android tablets with Chrome 90+
  - Minimum screen size of 768×1024
- No specific mobile phone optimization required
  - Basic functionality on mobile devices
  - Limited data entry capability on phones
  - PDF viewing support on all devices

### Compliance Requirements

- Adherence to North Carolina Department of Revenue form requirements
  - B-A-101 Schedule A form specifications
  - Correct tax rate calculations (12.8%)
  - Proper rounding to two decimal places
  - Correct application of $0.30 cap per cigar
- Accurate tax calculations according to NC regulations
  - Per-cigar tax capping at $0.30
  - 2% discount on total tax amount
  - Exemption handling for qualifying transactions
- Privacy policy and terms of service clearly presented
  - Plain language explanation of data usage
  - Opt-in consent for marketing communications
  - Clear explanation of data retention practices
- GDPR compliance for any EU users
  - Right to access personal data
  - Right to be forgotten
  - Data export functionality
  - Breach notification procedures

## NC Department of Revenue Requirements

### Specific Form Requirements

- **B-A-101 Schedule A Form**
  - Official form version 4-22 or later
  - Required fields:
    - Legal Name (maximum 35 characters, all caps)
    - NCDOR ID (11 characters)
    - Reporting period (beginning and ending dates)
    - Sales entry details (date, invoice #, vendor, description, quantity, cost)
  - Tax calculations:
    - Column G: Multiply Column F (Cost Price) by 12.8%
    - Column H: Multiply Column E (Number of Cigars) by $0.30
    - Column I: Subtract Column H from Column G (if negative, enter zero)
  - Final calculations:
    - Subtotal: Total of Column I
    - Total: Multiply subtotal by 0.98 (2% discount)

### Filing Requirements

- Forms must be submitted by the 20th day of the month following the reporting period
- Payment must accompany the form submission
- All invoices referenced must be attached to the submission
- Only one tobacco product per invoice item (no combining)
- Cigars exempt from excise tax must not be included
- Original signatures required on printed forms
- Each form limited to 19 entries; additional forms required for more entries

## Implementation Priorities

### Phase 1 (MVP - 2 months)
- User authentication (email/password only)
- Basic form entry interface
- PDF generation with download
- Simple dashboard
- Form data validation
- Single business profile support

### Phase 2 (3 months)
- SSO integration
- Payment processing
- Enhanced dashboard
- Draft saving functionality
- Multiple business profiles
- Basic reporting features
- Form entry improvements

### Phase 3 (6 months)
- API endpoints
- Advanced reporting
- Subscription model
- Mobile optimizations
- Batch processing
- Document management
- Integration with accounting software

## Data Retention Policy

- **User account data**: Retained for the duration of the account plus 30 days after deletion
- **Form submission data**: Retained for 7 years to comply with tax record requirements
- **Payment information**: Tokenized payment methods retained until removal by user
- **Usage logs**: Retained for 90 days for security and troubleshooting
- **Anonymous analytics**: Retained indefinitely in aggregate form
- **Inactive accounts**: Flagged after 12 months of inactivity with email notification
- **Account deletion**: Complete removal of personal data with option to export before deletion