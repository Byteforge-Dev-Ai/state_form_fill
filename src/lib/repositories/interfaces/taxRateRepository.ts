import { TaxRate } from '@/types/database';

export interface TaxRateRepository {
  /**
   * Get all tax rates from the database
   */
  getAll(): Promise<TaxRate[]>;
  
  /**
   * Get the current active tax rate (effective_to is null)
   */
  getCurrent(): Promise<TaxRate>;
  
  /**
   * Get a tax rate by its ID
   */
  getById(id: string): Promise<TaxRate | null>;
  
  /**
   * Get the tax rate that was effective on a specific date
   */
  getEffectiveOnDate(date: string): Promise<TaxRate | null>;
  
  /**
   * Create a new tax rate
   * When a new rate is created, the current active rate's effective_to
   * will be automatically set to the day before the new rate's effective_from
   */
  create(data: {
    rate: number;
    multiplier: number;
    effective_from: string;
    created_by: string;
  }): Promise<TaxRate>;
  
  /**
   * Update an existing tax rate (only future rates that haven't taken effect)
   */
  update(id: string, data: {
    rate?: number;
    multiplier?: number;
    effective_from?: string;
  }): Promise<TaxRate | null>;
  
  /**
   * Delete a tax rate (only future rates that haven't taken effect)
   */
  delete(id: string): Promise<boolean>;
} 