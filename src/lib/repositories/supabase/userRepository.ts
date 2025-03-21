import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IUserRepository, UserCreateDto } from '../interfaces/userRepository';
import { User } from '@/types/database';

export class SupabaseUserRepository implements IUserRepository {
  constructor(private supabaseClient: SupabaseClient) {}
  
  async getById(id: string): Promise<User | null> {
    const { data, error } = await this.supabaseClient
      .from('users')
      .select()
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return data;
  }
  
  async getByEmail(email: string): Promise<User | null> {
    const { data, error } = await this.supabaseClient
      .from('users')
      .select()
      .eq('email', email)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return data || null;
  }
  
  async create(userData: UserCreateDto): Promise<User> {
    let auth_id: string | undefined;
    
    // If password is provided, create an auth user first
    if (userData.password) {
      const { data: authData, error: authError } = await this.supabaseClient.auth.signUp({
        email: userData.email,
        password: userData.password,
      });
      
      if (authError) throw authError;
      auth_id = authData.user?.id;
    }
    
    // Create the user record in the users table
    const { data, error } = await this.supabaseClient
      .from('users')
      .insert({
        id: auth_id, // If auth user was created, use that ID
        email: userData.email,
        company_name: userData.company_name,
        role: userData.role || 'vendor',
        auth_provider: userData.auth_provider || 'email',
        provider_user_id: userData.provider_user_id,
        subscription_status: 'free'
      })
      .select()
      .single();
      
    if (error) throw error;
    return data;
  }
  
  async update(id: string, data: Partial<User>): Promise<User | null> {
    const { data: user, error } = await this.supabaseClient
      .from('users')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return user;
  }
  
  async delete(id: string): Promise<boolean> {
    const { error } = await this.supabaseClient
      .from('users')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    return true;
  }
  
  async updateLastLogin(id: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from('users')
      .update({
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id);
      
    if (error) throw error;
  }
} 