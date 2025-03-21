import { z } from 'zod';

export const formStatuses = ['draft', 'in_progress', 'submitted', 'approved', 'rejected'] as const;

// Schema for creating a form
export const createFormSchema = z.object({
  user_identifier_id: z.string().uuid('User identifier ID must be a valid UUID'),
  date_range_start: z.string().refine((date) => {
    return !isNaN(Date.parse(date));
  }, { message: 'Invalid start date format' }),
  date_range_end: z.string().refine((date) => {
    return !isNaN(Date.parse(date));
  }, { message: 'Invalid end date format' }),
});

export type CreateFormInput = z.infer<typeof createFormSchema>;

// Schema for updating a form
export const updateFormSchema = z.object({
  date_range_start: z.string().refine((date) => {
    return !isNaN(Date.parse(date));
  }, { message: 'Invalid start date format' }).optional(),
  date_range_end: z.string().refine((date) => {
    return !isNaN(Date.parse(date));
  }, { message: 'Invalid end date format' }).optional(),
  status: z.enum(formStatuses).optional(),
});

export type UpdateFormInput = z.infer<typeof updateFormSchema>; 