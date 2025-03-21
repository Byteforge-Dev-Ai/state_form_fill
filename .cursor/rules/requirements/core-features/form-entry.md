# Form Data Entry Interface Requirements

## Core Form Entry Features

1. **Data Entry Grid**
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

2. **Form Validation**
   - Ensure dates are within reporting period
   - Verify non-negative quantities and prices
   - Check required fields completion
   - Validate numeric field formats
   - Perform real-time validation where possible

3. **Form Management**
   - Save drafts and resume work later
   - Support for entering more than 19 entries (with automatic pagination)
   - Automatic generation of additional form pages when needed

4. **Bulk Operations**
   - Import from CSV/Excel file
   - Copy/paste from spreadsheet
   - Duplicate entries
   - Delete multiple entries

## Implementation Guidance

- Use TanStack Table v8 for the data grid implementation
- Implement React Hook Form with Zod validation
- Create debounced calculations to avoid performance issues during rapid input
- Provide clear visual feedback for validation errors
- Include field-level help text for complex fields
