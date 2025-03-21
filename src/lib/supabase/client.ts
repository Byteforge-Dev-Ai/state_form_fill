import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials are missing. Please check your environment variables.');
}

export const supabaseClient = createClient(supabaseUrl, supabaseKey);

// For server-side operations with service role (admin) access
export const getServiceSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  
  if (!serviceRoleKey) {
    throw new Error('Service role key is missing. This is required for admin operations.');
  }
  
  return createClient(supabaseUrl, serviceRoleKey);
}; 