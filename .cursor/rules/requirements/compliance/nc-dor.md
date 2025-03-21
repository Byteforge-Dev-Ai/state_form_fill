# NC Department of Revenue Compliance Requirements

## B-A-101 Schedule A Form Requirements

1. **Form Specifications**
   - Official form version 4-22 or later
   - Required fields:
     - Legal Name (maximum 35 characters, all caps)
     - NCDOR ID (11 characters)
     - Reporting period (beginning and ending dates)
     - Sales entry details (date, invoice #, vendor, description, quantity, cost)

2. **Tax Calculations**
   - Column G: Multiply Column F (Cost Price) by 12.8%
   - Column H: Multiply Column E (Number of Cigars) by $0.30
   - Column I: Subtract Column H from Column G (if negative, enter zero)
   - Subtotal: Total of Column I
   - Total: Multiply subtotal by 0.98 (2% discount)

3. **Filing Requirements**
   - Forms must be submitted by the 20th day of the month following the reporting period
   - Payment must accompany the form submission
   - All invoices referenced must be attached to the submission
   - Only one tobacco product per invoice item (no combining)
   - Cigars exempt from excise tax must not be included
   - Original signatures required on printed forms
   - Each form limited to 19 entries; additional forms required for more entries

## Implementation Guidance

- Create a robust validation system to ensure all calculations match NC DOR requirements exactly
- Implement clear warnings about submission deadlines
- Provide instructions about invoice attachment requirements
- Include guidance about exempt products
- Create a verification step before form finalization
- Ensure printed forms meet all physical requirements for submission
