import { SupabaseClient } from '@supabase/supabase-js';
import { FormSubmission } from '@/types/database';
import { FormRepository } from '../interfaces/formRepository';
import { CreateFormInput, UpdateFormInput } from '../../validators/formValidator';

export class SupabaseFormRepository implements FormRepository {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  async getAllByUserId(
    userId: string,
    options?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      sort?: string;
      order?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    }
  ): Promise<{
    data: FormSubmission[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }> {
    // Default pagination values
    const page = options?.page || 1;
    const limit = options?.limit || 10;
    const offset = (page - 1) * limit;
    const order = options?.order || 'desc';
    const sort = options?.sort || 'created_at';

    // Build the query with joins to get user identifier info
    let query = this.supabase
      .from('form_submissions')
      .select(`
        *,
        user_identifier:user_identifiers(legal_name, nc_dor_id)
      `, { count: 'exact' })
      .eq('user_identifiers.user_id', userId);

    // Add filters if provided
    if (options?.status) {
      query = query.eq('status', options.status);
    }

    if (options?.startDate) {
      query = query.gte('date_range_start', options.startDate);
    }

    if (options?.endDate) {
      query = query.lte('date_range_end', options.endDate);
    }

    // Add sorting and pagination
    query = query.order(sort, { ascending: order === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching forms:', error);
      throw new Error(`Failed to fetch forms: ${error.message}`);
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
  }

  async getById(id: string, userId: string): Promise<FormSubmission | null> {
    const { data, error } = await this.supabase
      .from('form_submissions')
      .select(`
        *,
        user_identifier:user_identifiers(*)
      `)
      .eq('id', id)
      .eq('user_identifiers.user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return null;
      }
      console.error('Error fetching form:', error);
      throw new Error(`Failed to fetch form: ${error.message}`);
    }

    return data;
  }

  async create(
    userId: string,
    data: CreateFormInput & { status: string }
  ): Promise<FormSubmission> {
    // First, verify that the user_identifier_id belongs to the current user
    const { data: userIdentifier, error: userIdentifierError } = await this.supabase
      .from('user_identifiers')
      .select('*')
      .eq('id', data.user_identifier_id)
      .eq('user_id', userId)
      .single();

    if (userIdentifierError || !userIdentifier) {
      console.error('User identifier not found or does not belong to user:', userIdentifierError);
      throw new Error('Invalid user identifier');
    }

    // Insert the new form
    const { data: newForm, error } = await this.supabase
      .from('form_submissions')
      .insert({
        user_identifier_id: data.user_identifier_id,
        date_range_start: data.date_range_start,
        date_range_end: data.date_range_end,
        status: data.status,
        total_entries: 0,
        total_amount: 0,
        tax_calculated: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating form:', error);
      throw new Error(`Failed to create form: ${error.message}`);
    }

    return newForm;
  }

  async update(
    id: string,
    userId: string,
    data: UpdateFormInput & {
      confirmation_number?: string;
      submitted_at?: string;
    }
  ): Promise<FormSubmission | null> {
    // First, verify that the form exists and belongs to the user
    const { data: existingForm, error: fetchError } = await this.supabase
      .from('form_submissions')
      .select(`
        *,
        user_identifier:user_identifiers(user_id)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !existingForm || existingForm.user_identifier.user_id !== userId) {
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching form for update:', fetchError);
      }
      return null;
    }

    // Prepare update data
    const updateData: any = {};
    
    if (data.date_range_start) updateData.date_range_start = data.date_range_start;
    if (data.date_range_end) updateData.date_range_end = data.date_range_end;
    if (data.status) updateData.status = data.status;
    if (data.confirmation_number) updateData.confirmation_number = data.confirmation_number;
    if (data.submitted_at) updateData.submitted_at = data.submitted_at;

    // Update the form
    const { data: updatedForm, error } = await this.supabase
      .from('form_submissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating form:', error);
      throw new Error(`Failed to update form: ${error.message}`);
    }

    return updatedForm;
  }

  async delete(id: string, userId: string): Promise<boolean> {
    // First, verify that the form exists and belongs to the user
    const { data: existingForm, error: fetchError } = await this.supabase
      .from('form_submissions')
      .select(`
        *,
        user_identifier:user_identifiers(user_id)
      `)
      .eq('id', id)
      .single();

    if (fetchError || !existingForm || existingForm.user_identifier.user_id !== userId) {
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching form for deletion:', fetchError);
      }
      return false;
    }

    // Delete the form
    const { error } = await this.supabase
      .from('form_submissions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting form:', error);
      throw new Error(`Failed to delete form: ${error.message}`);
    }

    return true;
  }
} 