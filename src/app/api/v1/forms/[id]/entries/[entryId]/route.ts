import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/v1/forms/{formId}/entries/{id}:
 *   put:
 *     summary: Update a sales entry
 *     tags: [Entries]
 *     description: Update an existing sales entry
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: formId
 *         in: path
 *         required: true
 *         description: ID of the form
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the entry to update
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date_of_sale:
 *                 type: string
 *                 format: date
 *               invoice_number:
 *                 type: string
 *               vendor_name:
 *                 type: string
 *               cigar_description:
 *                 type: string
 *               number_of_cigars:
 *                 type: integer
 *               cost_of_cigar:
 *                 type: number
 *                 format: float
 *     responses:
 *       200:
 *         description: Entry updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Form or entry not found
 *       500:
 *         description: Server error
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; entryId: string } }
) {
  try {
    const body = await request.json();
    
    // In a real app, you would validate the form and entry IDs
    // and ensure the user has permission to update this entry
    
    // Mock the tax calculation
    const taxRate = 0.0595;
    const costMultiplier = 1.12;
    const subtotal = Math.max((body.number_of_cigars * costMultiplier) - (body.cost_of_cigar * taxRate), 0);
    
    // Update the entry with calculated fields
    const updatedEntry = {
      id: params.entryId,
      form_id: params.id,
      date_of_sale: body.date_of_sale,
      invoice_number: body.invoice_number || '',
      vendor_name: body.vendor_name,
      cigar_description: body.cigar_description,
      number_of_cigars: body.number_of_cigars,
      cost_of_cigar: body.cost_of_cigar,
      subtotal,
      tax_rate: taxRate,
      tax_amount: subtotal,
      entry_index: 1, // In a real app, this would be retrieved from the database
      updated_at: new Date().toISOString()
    };
    
    return NextResponse.json(updatedEntry);
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/v1/forms/{formId}/entries/{id}:
 *   delete:
 *     summary: Delete a sales entry
 *     tags: [Entries]
 *     description: Delete an existing sales entry
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: formId
 *         in: path
 *         required: true
 *         description: ID of the form
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the entry to delete
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Entry deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Form or entry not found
 *       500:
 *         description: Server error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; entryId: string } }
) {
  try {
    // In a real app, you would validate the form and entry IDs
    // and ensure the user has permission to delete this entry
    
    // Simply return a 204 No Content response indicating success
    return NextResponse.json(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    );
  }
} 