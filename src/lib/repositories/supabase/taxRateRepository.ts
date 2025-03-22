import { SupabaseClient } from '@supabase/supabase-js';
import { TaxRate } from '@/types/database';
import { TaxRateRepository } from '../interfaces/taxRateRepository';

export class SupabaseTaxRateRepository implements TaxRateRepository {
  private tableName = 'tax_rates';

  constructor(private supabaseClient: SupabaseClient) {}

  async getAll(): Promise<TaxRate[]> {
    const { data, error } = await this.supabaseClient
      .from(this.tableName)
      .select('*')
      .order('effective_from', { ascending: false });

    if (error) {
      console.error('Error fetching tax rates:', error);
      throw error;
    }

    return data || [];
  }

  async getCurrent(): Promise<TaxRate> {
    const { data, error } = await this.supabaseClient
      .from(this.tableName)
      .select('*')
      .is('effective_to', null)
      .single();

    if (error) {
      console.error('Error fetching current tax rate:', error);
      throw error;
    }

    return data;
  }

  async getById(id: string): Promise<TaxRate | null> {
    const { data, error } = await this.supabaseClient
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Record not found
      console.error('Error fetching tax rate by ID:', error);
      throw error;
    }

    return data;
  }

  async getEffectiveOnDate(date: string): Promise<TaxRate | null> {
    const { data, error } = await this.supabaseClient
      .from(this.tableName)
      .select('*')
      .lte('effective_from', date)
      .or(`effective_to.gte.${date},effective_to.is.null`)
      .order('effective_from', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Record not found
      console.error('Error fetching tax rate effective on date:', error);
      throw error;
    }

    return data;
  }

  async create(data: {
    rate: number;
    multiplier: number;
    effective_from: string;
    created_by: string;
  }): Promise<TaxRate> {
    const { data: newRate, error } = await this.supabaseClient
      .from(this.tableName)
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Error creating tax rate:', error);
      throw error;
    }

    // Note: PostgreSQL trigger will automatically set effective_to on previous rates

    return newRate;
  }

  async update(
    id: string,
    data: {
      rate?: number;
      multiplier?: number;
      effective_from?: string;
    }
  ): Promise<TaxRate | null> {
    // First check if the tax rate exists and hasn't taken effect yet
    const { data: existingRate } = await this.supabaseClient
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (!existingRate) return null;

    // Only allow updating future rates
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (existingRate.effective_from <= today) {
      throw new Error('Cannot update a tax rate that has already taken effect');
    }

    // Update the tax rate
    const { data: updatedRate, error } = await this.supabaseClient
      .from(this.tableName)
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating tax rate:', error);
      throw error;
    }

    return updatedRate;
  }

  async delete(id: string): Promise<boolean> {
    // First check if the tax rate exists and hasn't taken effect yet
    const { data: existingRate } = await this.supabaseClient
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single();

    if (!existingRate) return false;

    // Only allow deleting future rates
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    if (existingRate.effective_from <= today) {
      throw new Error('Cannot delete a tax rate that has already taken effect');
    }

    const { error } = await this.supabaseClient
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting tax rate:', error);
      throw error;
    }

    return true;
  }
} 