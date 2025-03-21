# Form Entry Screen Specification

## Overview

The Form Entry screen is the core interface for entering and managing sales data. It provides a spreadsheet-like grid for entering multiple sales entries and automatically calculates tax-related fields according to NC DOR requirements.

## UI Components

### Form Header
- Title "NC Cigar Tax Form"
- Form status indicator (Draft, Completed)
- Save as draft button (Secondary button)
- Exit button (Tertiary button)

### Form Metadata Section
- Business profile selector (Dropdown)
  - Shows list of user's business profiles
  - Displays legal name and NC DOR ID
- Reporting period selector (Date range picker)
  - Start date field
  - End date field
  - Validation for proper reporting periods
- Form description field (Optional text area)

### Sales Entry Grid
- TanStack Table implementation with the following columns:
  - Date of Sale (Date picker)
  - Invoice Number (Text input)
  - Vendor Name (Text input, 35 char limit)
  - Cigar Description (Text input)
  - Number of Cigars (Number input)
  - Cost of Cigar ($) (Currency input)
  - Tax Amount (Calculated, read-only)
  - Subtotal (Calculated, read-only)
  - Actions column (Edit, Delete)

### Grid Actions
- Add Row button (+ icon)
- Delete Selected Rows button (Trash icon)
- Duplicate Selected Row button (Copy icon)
- Import Data button (Upload icon)
- Grid pagination controls
  - Page selector
  - Items per page selector
  - First/Previous/Next/Last buttons

### Summary Section
- Total number of cigars
- Total cost amount
- Total tax amount (12.8%)
- Total multiplier amount ($0.30 per cigar)
- Subtotal
- Discount (2%)
- Final total amount
- Number of pages in generated form

### Form Actions
- "Save Draft" button (Secondary)
- "Preview Form" button (Secondary)
- "Generate PDF" button (Primary)
- "Clear Form" button (Tertiary/Danger)

## Detailed Specifications

### Sales Entry Row
- Each row represents a single sales entry
- Fields are validated as the user types
- Tax calculations update in real-time
- Empty rows are not allowed in final submission
- Maximum of 19 entries per page in the generated PDF

### Tax Calculations
- Tax Amount = Cost of Cigar × 12.8%
- Multiplier Amount = Number of Cigars × $0.30
- Subtotal = If Tax Amount > Multiplier Amount, then Multiplier Amount; otherwise Tax Amount
- Final Total = Sum of all Subtotals × 0.98 (2% discount)

### Validation Rules
- Date of Sale must be within the reporting period
- Invoice Number is required
- Vendor Name is required and limited to 35 characters
- Cigar Description is required
- Number of Cigars must be a positive integer
- Cost of Cigar must be a positive number with up to 2 decimal places

## Implementation Example

```tsx
// pages/forms/[id]/edit.tsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Form schema definition
const formSchema = z.object({
  userIdentifierId: z.string().uuid(),
  dateRangeStart: z.date(),
  dateRangeEnd: z.date(),
  description: z.string().optional(),
});

// Sales entry schema
const salesEntrySchema = z.object({
  dateOfSale: z.date(),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  vendorName: z.string().min(1, 'Vendor name is required').max(35, 'Vendor name cannot exceed 35 characters'),
  cigarDescription: z.string().min(1, 'Description is required'),
  numberOfCigars: z.number().int().positive('Must be a positive number'),
  costOfCigar: z.number().positive('Must be a positive number').multipleOf(0.01, 'Maximum 2 decimal places'),
});

export default function FormEdit() {
  const router = useRouter();
  const { id } = router.query;
  
  // Form state using React Hook Form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userIdentifierId: '',
      dateRangeStart: new Date(),
      dateRangeEnd: new Date(),
      description: '',
    },
  });
  
  // Sales entries state
  const [entries, setEntries] = useState([]);
  
  // Business profiles state
  const [businessProfiles, setBusinessProfiles] = useState([]);
  
  // Fetch form data if editing existing form
  useEffect(() => {
    if (id && id !== 'new') {
      // Fetch form data from API
      fetch(`/api/forms/${id}`)
        .then(res => res.json())
        .then(data => {
          form.reset({
            userIdentifierId: data.user_identifier_id,
            dateRangeStart: new Date(data.date_range_start),
            dateRangeEnd: new Date(data.date_range_end),
            description: data.description || '',
          });
          
          // Fetch entries
          return fetch(`/api/forms/${id}/entries`);
        })
        .then(res => res.json())
        .then(entriesData => {
          setEntries(entriesData);
        })
        .catch(error => {
          console.error('Error loading form:', error);
        });
    }
    
    // Fetch business profiles
    fetch('/api/user-identifiers')
      .then(res => res.json())
      .then(data => {
        setBusinessProfiles(data);
        if (data.length > 0 && !form.getValues('userIdentifierId')) {
          form.setValue('userIdentifierId', data[0].id);
        }
      })
      .catch(error => {
        console.error('Error loading business profiles:', error);
      });
  }, [id, form]);
  
  // Function to calculate tax amount
  const calculateTaxAmount = (cost) => {
    return cost * 0.128;
  };
  
  // Function to calculate multiplier amount
  const calculateMultiplierAmount = (count) => {
    return count * 0.30;
  };
  
  // Function to calculate subtotal
  const calculateSubtotal = (taxAmount, multiplierAmount) => {
    return taxAmount > multiplierAmount ? multiplierAmount : taxAmount;
  };
  
  // Add a new entry
  const addEntry = () => {
    const newEntry = {
      id: `new-${Date.now()}`,
      dateOfSale: new Date(),
      invoiceNumber: '',
      vendorName: '',
      cigarDescription: '',
      numberOfCigars: 0,
      costOfCigar: 0,
      taxAmount: 0,
      multiplierAmount: 0,
      subtotal: 0,
      entry_index: entries.length,
    };
    
    setEntries([...entries, newEntry]);
  };
  
  // Delete an entry
  const deleteEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
  };
  
  // Update an entry
  const updateEntry = (id, field, value) => {
    const updatedEntries = entries.map(entry => {
      if (entry.id === id) {
        const updatedEntry = { ...entry, [field]: value };
        
        // Recalculate tax values
        if (field === 'costOfCigar' || field === 'numberOfCigars') {
          const taxAmount = calculateTaxAmount(updatedEntry.costOfCigar);
          const multiplierAmount = calculateMultiplierAmount(updatedEntry.numberOfCigars);
          updatedEntry.taxAmount = taxAmount;
          updatedEntry.multiplierAmount = multiplierAmount;
          updatedEntry.subtotal = calculateSubtotal(taxAmount, multiplierAmount);
        }
        
        return updatedEntry;
      }
      return entry;
    });
    
    setEntries(updatedEntries);
  };
  
  // Calculate totals
  const totalCigars = entries.reduce((sum, entry) => sum + entry.numberOfCigars, 0);
  const totalCost = entries.reduce((sum, entry) => sum + entry.costOfCigar, 0);
  const totalTaxAmount = entries.reduce((sum, entry) => sum + entry.taxAmount, 0);
  const totalMultiplierAmount = entries.reduce((sum, entry) => sum + entry.multiplierAmount, 0);
  const subtotal = entries.reduce((sum, entry) => sum + entry.subtotal, 0);
  const finalTotal = subtotal * 0.98; // 2% discount
  
  // Save form
  const saveForm = async (status = 'draft') => {
    if (!form.formState.isValid) {
      return;
    }
    
    const formData = form.getValues();
    
    const payload = {
      user_identifier_id: formData.userIdentifierId,
      date_range_start: formData.dateRangeStart,
      date_range_end: formData.dateRangeEnd,
      description: formData.description,
      status,
    };
    
    try {
      let formId = id;
      
      // Create or update form
      if (id === 'new') {
        const response = await fetch('/api/forms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        
        const data = await response.json();
        formId = data.id;
      } else {
        await fetch(`/api/forms/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      
      // Save entries
      for (const entry of entries) {
        const entryPayload = {
          date_of_sale: entry.dateOfSale,
          invoice_number: entry.invoiceNumber,
          vendor_name: entry.vendorName,
          cigar_description: entry.cigarDescription,
          number_of_cigars: entry.numberOfCigars,
          cost_of_cigar: entry.costOfCigar,
          entry_index: entry.entry_index,
        };
        
        if (entry.id.startsWith('new-')) {
          await fetch(`/api/forms/${formId}/entries`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryPayload),
          });
        } else {
          await fetch(`/api/forms/${formId}/entries/${entry.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryPayload),
          });
        }
      }
      
      if (status === 'draft') {
        // Stay on the page with updated ID
        if (id === 'new') {
          router.push(`/forms/${formId}/edit`);
        }
      } else {
        // Navigate to preview
        router.push(`/forms/${formId}/preview`);
      }
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };
  
  // Column definition for TanStack Table
  const columnHelper = createColumnHelper();
  
  const columns = [
    columnHelper.accessor('dateOfSale', {
      header: 'Date of Sale',
      cell: info => (
        <DatePicker 
          value={info.getValue()}
          onChange={date => updateEntry(info.row.original.id, 'dateOfSale', date)}
        />
      ),
    }),
    columnHelper.accessor('invoiceNumber', {
      header: 'Invoice #',
      cell: info => (
        <Input 
          value={info.getValue()}
          onChange={e => updateEntry(info.row.original.id, 'invoiceNumber', e.target.value)}
        />
      ),
    }),
    columnHelper.accessor('vendorName', {
      header: 'Vendor Name',
      cell: info => (
        <Input 
          value={info.getValue()}
          onChange={e => updateEntry(info.row.original.id, 'vendorName', e.target.value)}
          maxLength={35}
        />
      ),
    }),
    columnHelper.accessor('cigarDescription', {
      header: 'Description',
      cell: info => (
        <Input 
          value={info.getValue()}
          onChange={e => updateEntry(info.row.original.id, 'cigarDescription', e.target.value)}
        />
      ),
    }),
    columnHelper.accessor('numberOfCigars', {
      header: 'Quantity',
      cell: info => (
        <Input 
          type="number"
          value={info.getValue()}
          onChange={e => updateEntry(info.row.original.id, 'numberOfCigars', parseInt(e.target.value) || 0)}
          min={0}
        />
      ),
    }),
    columnHelper.accessor('costOfCigar', {
      header: 'Cost ($)',
      cell: info => (
        <Input 
          type="number"
          value={info.getValue()}
          onChange={e => updateEntry(info.row.original.id, 'costOfCigar', parseFloat(e.target.value) || 0)}
          min={0}
          step={0.01}
        />
      ),
    }),
    columnHelper.accessor('taxAmount', {
      header: 'Tax (12.8%)',
      cell: info => `$${info.getValue().toFixed(2)}`,
    }),
    columnHelper.accessor('subtotal', {
      header: 'Subtotal',
      cell: info => `$${info.getValue().toFixed(2)}`,
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: info => (
        <Button 
          variant="danger" 
          size="sm"
          onClick={() => deleteEntry(info.row.original.id)}
        >
          Delete
        </Button>
      ),
    }),
  ];
  
  const table = useReactTable({
    data: entries,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });
  
  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>NC Cigar Tax Form</CardTitle>
          <div className="flex space-x-2">
            <Button variant="secondary" onClick={() => saveForm('draft')}>
              Save Draft
            </Button>
            <Button variant="tertiary" onClick={() => router.back()}>
              Exit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Form Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Business Profile</label>
                <Select
                  value={form.watch('userIdentifierId')}
                  onChange={e => form.setValue('userIdentifierId', e.target.value)}
                >
                  {businessProfiles.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.legal_name} ({profile.nc_dor_id})
                    </option>
                  ))}
                </Select>
                {form.formState.errors.userIdentifierId && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.userIdentifierId.message}
                  </p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Start Date</label>
                  <DatePicker
                    value={form.watch('dateRangeStart')}
                    onChange={date => form.setValue('dateRangeStart', date)}
                  />
                  {form.formState.errors.dateRangeStart && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.dateRangeStart.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">End Date</label>
                  <DatePicker
                    value={form.watch('dateRangeEnd')}
                    onChange={date => form.setValue('dateRangeEnd', date)}
                  />
                  {form.formState.errors.dateRangeEnd && (
                    <p className="text-red-500 text-sm mt-1">
                      {form.formState.errors.dateRangeEnd.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sales Entry Grid */}
            <div>
              <div className="flex justify-between mb-4">
                <h3 className="text-lg font-semibold">Sales Entries</h3>
                <Button onClick={addEntry}>Add Entry</Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                      <tr key={headerGroup.id}>
                        {headerGroup.headers.map(header => (
                          <th key={header.id} className="px-4 py-2 text-left bg-gray-100 border border-gray-200">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody>
                    {table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="border-b border-gray-200 hover:bg-gray-50">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-4 py-2 border border-gray-200">
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext()
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {entries.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-500">No entries yet. Click "Add Entry" to get started.</p>
                </div>
              )}
            </div>
            
            {/* Summary Section */}
            {entries.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Summary</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Cigars:</p>
                    <p className="text-lg font-medium">{totalCigars}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Cost:</p>
                    <p className="text-lg font-medium">${totalCost.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Tax Amount (12.8%):</p>
                    <p className="text-lg font-medium">${totalTaxAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Multiplier Amount ($0.30/cigar):</p>
                    <p className="text-lg font-medium">${totalMultiplierAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Subtotal:</p>
                    <p className="text-lg font-medium">${subtotal.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Final Total (2% discount):</p>
                    <p className="text-lg font-medium font-bold">${finalTotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Form Actions */}
            <div className="flex justify-end space-x-4 mt-6">
              <Button variant="tertiary" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={() => saveForm('draft')}>
                Save Draft
              </Button>
              <Button variant="primary" onClick={() => saveForm('completed')}>
                Preview Form
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

## Responsive Considerations

- On smaller screens, the grid becomes horizontally scrollable
- Form metadata fields stack vertically on mobile
- Summary section adapts to single column on smaller screens
- Pagination controls simplify on mobile
- Action buttons use icons only on smallest screens with tooltips
