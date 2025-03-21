-- NC Cigar Sales Form Filler Initial Migration
-- This migration sets up the initial database schema with all tables, relationships,
-- and security policies required for the API-first implementation.

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Drop tables if they exist (for clean migrations)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS form_pdfs CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS sales_entries CASCADE;
DROP TABLE IF EXISTS form_submissions CASCADE;
DROP TABLE IF EXISTS tax_rates CASCADE;
DROP TABLE IF EXISTS user_identifiers CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-----------------------
-- Core tables setup --
-----------------------

-- Create users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  company_name TEXT,
  role TEXT NOT NULL DEFAULT 'vendor',
  auth_provider TEXT NOT NULL DEFAULT 'email',
  provider_user_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  subscription_status TEXT DEFAULT 'free',
  subscription_expiry TIMESTAMP WITH TIME ZONE
);

-- Create roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create permissions table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions join table
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (role_id, permission_id)
);

-- Create refresh tokens table
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMP WITH TIME ZONE
);

-- Create user identifiers table
CREATE TABLE user_identifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  legal_name VARCHAR(35) NOT NULL,
  nc_dor_id VARCHAR(11) NOT NULL,
  trade_name TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, legal_name)
);

-- Create tax rates table
CREATE TABLE tax_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rate DECIMAL(5, 3) NOT NULL,
  multiplier DECIMAL(5, 3) NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Create form submissions table
CREATE TABLE form_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_identifier_id UUID REFERENCES user_identifiers(id) ON DELETE CASCADE,
  date_range_start DATE NOT NULL,
  date_range_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  form_count INTEGER DEFAULT 1,
  total_entries INTEGER DEFAULT 0,
  total_amount DECIMAL(10, 2) DEFAULT 0,
  tax_calculated DECIMAL(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'draft',
  confirmation_number TEXT
);

-- Create sales entries table
CREATE TABLE sales_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_submission_id UUID REFERENCES form_submissions(id) ON DELETE CASCADE,
  date_of_sale DATE NOT NULL,
  invoice_number TEXT,
  vendor_name TEXT NOT NULL,
  cigar_description TEXT NOT NULL,
  number_of_cigars INTEGER NOT NULL,
  cost_of_cigar DECIMAL(10, 2) NOT NULL,
  tax_rate DECIMAL(5, 3) NOT NULL,
  cost_of_cigar_with_tax DECIMAL(10, 2) GENERATED ALWAYS AS (cost_of_cigar * tax_rate) STORED,
  cost_multiplier DECIMAL(5, 3) NOT NULL,
  subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (
    GREATEST((number_of_cigars * cost_multiplier) - (cost_of_cigar * tax_rate), 0)
  ) STORED,
  tax_amount DECIMAL(10, 2) GENERATED ALWAYS AS (
    GREATEST((number_of_cigars * cost_multiplier) - (cost_of_cigar * tax_rate), 0)
  ) STORED,
  entry_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  form_submission_id UUID REFERENCES form_submissions(id) ON DELETE SET NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL,
  transaction_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending',
  payment_processor TEXT NOT NULL,
  webhook_processed BOOLEAN DEFAULT FALSE
);

-- Create form PDFs table
CREATE TABLE form_pdfs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  form_submission_id UUID REFERENCES form_submissions(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  url TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL,
  include_signature BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

---------------------
-- Function setup --
---------------------

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle closing previous tax rates when a new one is created
CREATE OR REPLACE FUNCTION close_previous_tax_rates()
RETURNS TRIGGER AS $$
BEGIN
    -- Set effective_to date for previous active tax rate
    UPDATE tax_rates
    SET effective_to = NEW.effective_from - INTERVAL '1 day'
    WHERE effective_to IS NULL
      AND id != NEW.id
      AND effective_from < NEW.effective_from;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update form submission totals when entries change
CREATE OR REPLACE FUNCTION update_form_submission_totals()
RETURNS TRIGGER AS $$
DECLARE
    form_id UUID;
BEGIN
    -- Get the form ID
    IF TG_OP = 'DELETE' THEN
        form_id := OLD.form_submission_id;
    ELSE
        form_id := NEW.form_submission_id;
    END IF;
    
    -- Update the form totals
    UPDATE form_submissions
    SET 
        total_entries = (SELECT COUNT(*) FROM sales_entries WHERE form_submission_id = form_id),
        total_amount = (SELECT COALESCE(SUM(subtotal), 0) FROM sales_entries WHERE form_submission_id = form_id),
        tax_calculated = (SELECT COALESCE(SUM(tax_amount), 0) FROM sales_entries WHERE form_submission_id = form_id),
        updated_at = NOW()
    WHERE id = form_id;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

---------------------
-- Trigger setup --
---------------------

-- Add triggers for updated_at columns
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
BEFORE UPDATE ON roles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_identifiers_updated_at
BEFORE UPDATE ON user_identifiers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_submissions_updated_at
BEFORE UPDATE ON form_submissions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_entries_updated_at
BEFORE UPDATE ON sales_entries
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger for closing previous tax rates
CREATE TRIGGER close_previous_tax_rates_trigger
AFTER INSERT ON tax_rates
FOR EACH ROW
EXECUTE FUNCTION close_previous_tax_rates();

-- Triggers for updating form submission totals
CREATE TRIGGER update_form_submission_totals_insert
AFTER INSERT ON sales_entries
FOR EACH ROW
EXECUTE FUNCTION update_form_submission_totals();

CREATE TRIGGER update_form_submission_totals_update
AFTER UPDATE ON sales_entries
FOR EACH ROW
EXECUTE FUNCTION update_form_submission_totals();

CREATE TRIGGER update_form_submission_totals_delete
AFTER DELETE ON sales_entries
FOR EACH ROW
EXECUTE FUNCTION update_form_submission_totals();

-- Insert default roles
INSERT INTO roles (name, description)
VALUES 
  ('admin', 'Full access to all system functions'),
  ('vendor', 'Access to own forms and entries'),
  ('readonly', 'Read-only access to own forms and entries');

-- Insert default permissions
INSERT INTO permissions (name, description)
VALUES 
  ('users:read', 'View user information'),
  ('users:write', 'Create and update users'),
  ('forms:read', 'View forms'),
  ('forms:write', 'Create and update forms'),
  ('forms:delete', 'Delete forms'),
  ('forms:submit', 'Submit forms'),
  ('forms:generate', 'Generate form PDFs'),
  ('entries:read', 'View sales entries'),
  ('entries:write', 'Create and update sales entries'),
  ('entries:delete', 'Delete sales entries'),
  ('identifiers:read', 'View business identifiers'),
  ('identifiers:write', 'Create and update business identifiers'),
  ('payments:read', 'View payments'),
  ('payments:process', 'Process payments'),
  ('tax:read', 'View tax rates'),
  ('tax:write', 'Update tax rates');

-- Assign permissions to roles
-- Admin permissions (all permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'admin'),
  id
FROM permissions;

-- Vendor permissions (limited permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'vendor'),
  id 
FROM permissions 
WHERE name IN (
  'forms:read', 'forms:write', 'forms:delete', 'forms:submit', 'forms:generate',
  'entries:read', 'entries:write', 'entries:delete',
  'identifiers:read', 'identifiers:write',
  'payments:read', 'tax:read'
);

-- Read-only permissions (view-only permissions)
INSERT INTO role_permissions (role_id, permission_id)
SELECT 
  (SELECT id FROM roles WHERE name = 'readonly'),
  id 
FROM permissions 
WHERE name IN (
  'forms:read', 'entries:read', 'identifiers:read', 'payments:read', 'tax:read'
);

-- Insert default tax rate
INSERT INTO tax_rates (rate, multiplier, effective_from, created_by)
VALUES (0.128, 0.30, '2020-01-01', NULL);

-- Create admin user (password: admin123) - ONLY FOR DEVELOPMENT!
INSERT INTO users (email, password_hash, company_name, role)
VALUES (
  'admin@example.com',
  crypt('admin123', gen_salt('bf')),
  'System Administrator',
  'admin'
); 