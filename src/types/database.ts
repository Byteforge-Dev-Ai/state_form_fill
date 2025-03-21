export interface User {
  id: string;
  email: string;
  company_name?: string;
  role: 'admin' | 'vendor' | 'readonly';
  auth_provider: 'email' | 'google' | 'apple' | 'github';
  provider_user_id?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  subscription_status: 'free' | 'premium' | 'enterprise';
  subscription_expiry?: string;
}

export interface UserIdentifier {
  id: string;
  user_id: string;
  legal_name: string;
  nc_dor_id: string;
  trade_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at: string;
  updated_at: string;
}

export interface FormSubmission {
  id: string;
  user_identifier_id: string;
  date_range_start: string;
  date_range_end: string;
  created_at: string;
  updated_at: string;
  submitted_at?: string;
  approved_at?: string;
  rejected_at?: string;
  rejection_reason?: string;
  form_count: number;
  total_entries: number;
  total_amount: number;
  tax_calculated: number;
  status: 'draft' | 'in_progress' | 'submitted' | 'approved' | 'rejected';
  confirmation_number?: string;
}

export interface SalesEntry {
  id: string;
  form_submission_id: string;
  date_of_sale: string;
  invoice_number?: string;
  vendor_name: string;
  cigar_description: string;
  number_of_cigars: number;
  cost_of_cigar: number;
  tax_rate: number;
  cost_of_cigar_with_tax: number;
  cost_multiplier: number;
  subtotal: number;
  tax_amount: number;
  entry_index: number;
  created_at: string;
  updated_at: string;
}

export interface TaxRate {
  id: string;
  rate: number;
  multiplier: number;
  effective_from: string;
  effective_to?: string;
  created_at: string;
  created_by: string;
}

export interface Payment {
  id: string;
  user_id: string;
  form_submission_id: string;
  amount: number;
  payment_method: string;
  transaction_id?: string;
  created_at: string;
  status: 'pending' | 'completed' | 'failed';
  payment_processor: string;
  webhook_processed: boolean;
}

export interface FormPdf {
  id: string;
  form_submission_id: string;
  file_name: string;
  file_size: number;
  storage_path: string;
  url?: string;
  expires_at?: string;
  generated_at: string;
  include_signature: boolean;
  created_at: string;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
  revoked: boolean;
  revoked_at?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: Record<string, any>;
  ip_address: string;
  user_agent: string;
  created_at: string;
} 