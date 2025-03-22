import { supabaseClient } from '../supabase/client';
import { SupabaseUserRepository } from '../repositories/supabase/userRepository';
import { UserService } from '../services/userService';
import { SupabaseUserIdentifierRepository } from '../repositories/supabase/userIdentifierRepository';
import { UserIdentifierService } from '../services/userIdentifierService';
import { SupabaseFormRepository } from '../repositories/supabase/formRepository';
import { FormService } from '../services/formService';
import { SupabaseFormEntryRepository } from '../repositories/supabase/formEntryRepository';
import { FormEntryService } from '../services/formEntryService';
import { SupabaseTaxRateRepository } from '../repositories/supabase/taxRateRepository';
import { TaxRateService } from '../services/taxRateService';

// Export factory function for UserService
export function createUserService(): UserService {
  const userRepository = new SupabaseUserRepository(supabaseClient);
  return new UserService(userRepository);
}

// Export factory function for UserIdentifierService
export function createUserIdentifierService(): UserIdentifierService {
  const userIdentifierRepository = new SupabaseUserIdentifierRepository(supabaseClient);
  return new UserIdentifierService(userIdentifierRepository);
}

// Export factory function for FormService
export function createFormService(): FormService {
  const formRepository = new SupabaseFormRepository(supabaseClient);
  return new FormService(formRepository);
}

// Export factory function for FormEntryService
export function createFormEntryService(): FormEntryService {
  const formEntryRepository = new SupabaseFormEntryRepository(supabaseClient);
  return new FormEntryService(formEntryRepository);
}

// Export factory function for TaxRateService
export function createTaxRateService(): TaxRateService {
  const taxRateRepository = new SupabaseTaxRateRepository(supabaseClient);
  return new TaxRateService(taxRateRepository);
} 