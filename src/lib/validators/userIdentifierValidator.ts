import { z } from 'zod';

export const createUserIdentifierSchema = z.object({
  legal_name: z.string().min(1, 'Legal name is required'),
  nc_dor_id: z.string().min(1, 'NC DOR ID is required'),
  trade_name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
});

export const updateUserIdentifierSchema = z.object({
  legal_name: z.string().min(1, 'Legal name is required').optional(),
  nc_dor_id: z.string().min(1, 'NC DOR ID is required').optional(),
  trade_name: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
});

export type CreateUserIdentifierInput = z.infer<typeof createUserIdentifierSchema>;
export type UpdateUserIdentifierInput = z.infer<typeof updateUserIdentifierSchema>; 