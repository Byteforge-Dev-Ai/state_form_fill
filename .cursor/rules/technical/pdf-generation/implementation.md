# PDF Generation Technical Implementation

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

## Implementation with pdf-lib

```javascript
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

## Multi-Page Form Generation

```javascript
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

## Implementation Considerations

1. **Form Template Access**
   - Store the blank form template in a secure location
   - Ensure the template is the correct version (4-22 or later)
   - Verify all field names match the expected mapping

2. **Error Handling**
   - Implement comprehensive error handling for PDF generation
   - Create fallback mechanisms for corrupt form templates
   - Add validation before PDF generation to prevent errors

3. **Performance Optimization**
   - Consider moving PDF generation to a background process for large forms
   - Implement caching for generated PDFs
   - Use web workers for client-side PDF generation
