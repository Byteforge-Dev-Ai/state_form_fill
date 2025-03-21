# B-A-101 Schedule A Form Fields

## Form Overview

The B-A-101 Schedule A form is used by cigar vendors in North Carolina to report cigar sales for tax purposes. The form calculates tax based on either a percentage of cost (12.8%) or a fixed amount per cigar ($0.30), whichever results in the lower tax.

## Form Field Mapping

The form contains several specific field types that require special handling:

### Business Information Fields
- **Legal Name**: 35 individual character fields (LN1...LN35)
  - Must be in all capital letters
  - Limited to 35 characters
  - Padded with spaces if shorter
  
- **NCDOR ID**: 11 individual character fields (D1...D11)
  - Typically alphanumeric
  - Must be exactly 11 characters

### Date Range Fields
- **Beginning Date**: 6 individual character fields
  - Month: BDM1, BDM2 (MM format)
  - Day: BDD1, BDD2 (DD format)
  - Year: BDY1, BDY2 (YY format)
  
- **Ending Date**: 6 individual character fields
  - Month: EDM1, EDM2 (MM format)
  - Day: EDD1, EDD2 (DD format)
  - Year: EDY1, EDY2 (YY format)

### Sales Entry Fields
For each sales entry (maximum 19 per page):
- **Date**: Date1...Date19 (MM/DD/YY format)
- **Invoice #**: Invoice1...Invoice19
- **Vendor Name**: Vendor1...Vendor19
- **Cigar Description**: Description1...Description19
- **Number of Cigars**: Count1...Count19 (numeric)
- **Cost Price**: Cost1...Cost19 (numeric, 2 decimal places)

### Calculation Fields
- **Column G**: Tax amount (Cost Price × 12.8%)
- **Column H**: Multiplier amount (Number of Cigars × $0.30)
- **Column I**: Subtotal (Column H - Column G, if < 0 then 0)

### Total Fields
- **Subtotal**: Sum of all Column I values
- **Total**: Subtotal × 0.98 (2% discount)

## PDF Field Implementation

When generating the PDF, the application must:

1. Split text fields into individual characters
2. Format dates in the correct format
3. Calculate and populate tax fields
4. Properly align numeric values
5. Handle multi-page forms when entries exceed 19 rows

## Sample Form Data

```json
{
  "legalName": "EXAMPLE CIGAR COMPANY LLC",
  "ncDorId": "12345ABCDE",
  "dateRangeStart": "2025-01-01",
  "dateRangeEnd": "2025-01-31",
  "entries": [
    {
      "dateOfSale": "2025-01-15",
      "invoiceNumber": "INV-12345",
      "vendorName": "Premium Tobacco Supplier",
      "cigarDescription": "Handcrafted Premium Cigars",
      "numberOfCigars": 100,
      "costOfCigar": 500.00
    }
  ]
}
```

## Form Validation Rules

1. Legal name must be all capital letters and can be no longer than 35 characters
2. NC DOR ID must be exactly 11 characters
3. Dates must be in MM/DD/YY format
4. Sale dates must be within the reporting period
5. Number of cigars must be positive integers
6. Cost price must be positive with maximum 2 decimal places
7. Each form page limited to 19 entries

## Special Notes

- The form is designed to be printed and mailed with payment
- All invoices referenced must be attached to the submission
- Only one tobacco product per invoice item
- Cigars exempt from excise tax must not be included
- Original signatures required on printed forms
