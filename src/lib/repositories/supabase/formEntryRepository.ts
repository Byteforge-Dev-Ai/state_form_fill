import { SupabaseClient } from '@supabase/supabase-js';
import { SalesEntry } from '@/types/database';
import { FormEntryRepository, CreateFormEntryInput, UpdateFormEntryInput } from '../interfaces/formEntryRepository';

export class SupabaseFormEntryRepository implements FormEntryRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async getAllByFormId(
    formId: string,
    userId: string,
    options?: {
      vendor?: string;
      startDate?: string;
      endDate?: string;
      sort?: string;
      order?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    }
  ): Promise<{
    data: SalesEntry[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    try {
      // First verify that the form belongs to the user
      const { data: form, error: formError } = await this.supabase
        .from('form_submissions')
        .select(`
          id,
          user_identifier:user_identifiers(user_id)
        `)
        .eq('id', formId)
        .single();

      if (formError || !form || form.user_identifier.user_id !== userId) {
        if (formError && formError.code !== 'PGRST116') {
          console.error('Error verifying form ownership:', formError);
        }
        // Return empty result if form doesn't exist or doesn't belong to user
        return {
          data: [],
          pagination: {
            total: 0,
            page: options?.page || 1,
            limit: options?.limit || 10,
            pages: 0,
          },
        };
      }

      // Default pagination values
      const page = options?.page || 1;
      const limit = options?.limit || 10;
      const offset = (page - 1) * limit;
      const order = options?.order || 'desc';
      const sort = options?.sort || 'created_at';

      // Build the query
      let query = this.supabase
        .from('sales_entries')
        .select('*', { count: 'exact' })
        .eq('form_submission_id', formId);

      // Add filters if provided
      if (options?.vendor) {
        query = query.ilike('vendor_name', `%${options.vendor}%`);
      }

      if (options?.startDate) {
        query = query.gte('date_of_sale', options.startDate);
      }

      if (options?.endDate) {
        query = query.lte('date_of_sale', options.endDate);
      }

      // Add sorting and pagination
      query = query
        .order(sort, { ascending: order === 'asc' })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) {
        console.error('Error fetching form entries:', error);
        throw new Error(`Failed to fetch entries: ${error.message}`);
      }

      // Calculate total pages
      const totalPages = count ? Math.ceil(count / limit) : 0;

      return {
        data: data || [],
        pagination: {
          total: count || 0,
          page,
          limit,
          pages: totalPages,
        },
      };
    } catch (error) {
      console.error('Error in getAllByFormId:', error);
      throw error;
    }
  }

  async getById(formId: string, entryId: string, userId: string): Promise<SalesEntry | null> {
    try {
      // First verify that the form belongs to the user
      const { data: form, error: formError } = await this.supabase
        .from('form_submissions')
        .select(`
          id,
          user_identifier:user_identifiers(user_id)
        `)
        .eq('id', formId)
        .single();

      if (formError || !form || form.user_identifier.user_id !== userId) {
        if (formError && formError.code !== 'PGRST116') {
          console.error('Error verifying form ownership:', formError);
        }
        return null;
      }

      // Fetch the entry
      const { data: entry, error: entryError } = await this.supabase
        .from('sales_entries')
        .select('*')
        .eq('id', entryId)
        .eq('form_submission_id', formId)
        .single();

      if (entryError) {
        if (entryError.code === 'PGRST116') {
          // Record not found
          return null;
        }
        throw new Error(`Failed to fetch entry: ${entryError.message}`);
      }

      return entry;
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  }

  async create(
    formId: string,
    userId: string,
    data: CreateFormEntryInput
  ): Promise<SalesEntry> {
    try {
      // First verify that the form belongs to the user
      const { data: form, error: formError } = await this.supabase
        .from('form_submissions')
        .select(`
          id,
          user_identifier:user_identifiers(user_id)
        `)
        .eq('id', formId)
        .single();

      if (formError || !form || form.user_identifier.user_id !== userId) {
        console.error('Form not found or does not belong to user:', formError);
        throw new Error('Invalid form ID or permission denied');
      }

      // Calculate the tax fields
      const taxRate = 0.128; // 12.8%
      const costMultiplier = 0.30; // $0.30 per cigar

      // Get current entry count to calculate entry_index if not provided
      let entryIndex = data.entry_index;
      if (!entryIndex) {
        const { count, error: countError } = await this.supabase
          .from('sales_entries')
          .select('*', { count: 'exact' })
          .eq('form_submission_id', formId);

        if (countError) {
          console.error('Error counting entries:', countError);
          entryIndex = 1;
        } else {
          entryIndex = (count || 0) + 1;
        }
      }

      // Insert the new entry - only include non-generated columns
      const { data: newEntry, error } = await this.supabase
        .from('sales_entries')
        .insert({
          form_submission_id: formId,
          date_of_sale: data.date_of_sale,
          invoice_number: data.invoice_number || '',
          vendor_name: data.vendor_name,
          cigar_description: data.cigar_description,
          number_of_cigars: data.number_of_cigars,
          cost_of_cigar: data.cost_of_cigar,
          tax_rate: taxRate,
          cost_multiplier: costMultiplier,
          entry_index: entryIndex,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating entry:', error);
        throw new Error(`Failed to create entry: ${error.message}`);
      }

      // We don't need to update the form's totals here as that should be 
      // handled by the database trigger update_form_submission_totals

      return newEntry;
    } catch (error) {
      console.error('Error in create:', error);
      throw error;
    }
  }

  async update(
    formId: string,
    entryId: string,
    userId: string,
    data: UpdateFormEntryInput
  ): Promise<SalesEntry | null> {
    try {
      // First verify that the form belongs to the user
      const { data: form, error: formError } = await this.supabase
        .from('form_submissions')
        .select(`
          id,
          user_identifier:user_identifiers(user_id)
        `)
        .eq('id', formId)
        .single();

      if (formError || !form || form.user_identifier.user_id !== userId) {
        if (formError && formError.code !== 'PGRST116') {
          console.error('Error verifying form ownership:', formError);
        }
        return null;
      }

      // Fetch existing entry 
      const { data: existingEntry, error: fetchError } = await this.supabase
        .from('sales_entries')
        .select('*')
        .eq('id', entryId)
        .eq('form_submission_id', formId)
        .single();

      if (fetchError || !existingEntry) {
        if (fetchError && fetchError.code !== 'PGRST116') {
          console.error('Error fetching entry for update:', fetchError);
        }
        return null;
      }

      // Prepare update data - only include non-generated columns
      const updateData: any = {};

      if (data.date_of_sale !== undefined) updateData.date_of_sale = data.date_of_sale;
      if (data.invoice_number !== undefined) updateData.invoice_number = data.invoice_number;
      if (data.vendor_name !== undefined) updateData.vendor_name = data.vendor_name;
      if (data.cigar_description !== undefined) updateData.cigar_description = data.cigar_description;
      if (data.entry_index !== undefined) updateData.entry_index = data.entry_index;
      if (data.cost_of_cigar !== undefined) updateData.cost_of_cigar = data.cost_of_cigar;
      if (data.number_of_cigars !== undefined) updateData.number_of_cigars = data.number_of_cigars;

      // Update the entry
      const { data: updatedEntry, error } = await this.supabase
        .from('sales_entries')
        .update(updateData)
        .eq('id', entryId)
        .eq('form_submission_id', formId)
        .select()
        .single();

      if (error) {
        console.error('Error updating entry:', error);
        throw new Error(`Failed to update entry: ${error.message}`);
      }

      // The database trigger will handle updating the form totals

      return updatedEntry;
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
  }

  async delete(formId: string, entryId: string, userId: string): Promise<boolean> {
    try {
      // First verify that the form belongs to the user
      const { data: form, error: formError } = await this.supabase
        .from('form_submissions')
        .select(`
          id,
          user_identifier:user_identifiers(user_id)
        `)
        .eq('id', formId)
        .single();

      if (formError || !form || form.user_identifier.user_id !== userId) {
        if (formError && formError.code !== 'PGRST116') {
          console.error('Error verifying form ownership:', formError);
        }
        return false;
      }

      // Delete the entry (no need to fetch it first)
      const { error } = await this.supabase
        .from('sales_entries')
        .delete()
        .eq('id', entryId)
        .eq('form_submission_id', formId);

      if (error) {
        console.error('Error deleting entry:', error);
        throw new Error(`Failed to delete entry: ${error.message}`);
      }

      // The database trigger will handle updating the form totals

      return true;
    } catch (error) {
      console.error('Error in delete:', error);
      throw error;
    }
  }
} 