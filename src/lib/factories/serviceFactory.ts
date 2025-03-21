import { supabaseClient } from '../supabase/client';
import { SupabaseUserRepository } from '../repositories/supabase/userRepository';
import { UserService } from '../services/userService';

// Export factory function for UserService
export function createUserService(): UserService {
  const userRepository = new SupabaseUserRepository(supabaseClient);
  return new UserService(userRepository);
} 