import { supabaseClient } from '../supabase/client';
import { SupabaseUserRepository } from '../repositories/supabase/userRepository';
import { UserService } from '../services/userService';
import { SupabaseUserIdentifierRepository } from '../repositories/supabase/userIdentifierRepository';
import { UserIdentifierService } from '../services/userIdentifierService';

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