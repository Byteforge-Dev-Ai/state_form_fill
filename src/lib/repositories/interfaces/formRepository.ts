import { FormSubmission } from '@/types/database';
import { CreateFormInput, UpdateFormInput } from '../../validators/formValidator';

export interface FormRepository {
  getAllByUserId(
    userId: string,
    options?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      sort?: string;
      order?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    }
  ): Promise<{
    data: FormSubmission[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }>;

  getById(id: string, userId: string): Promise<FormSubmission | null>;

  create(userId: string, data: CreateFormInput & { status: string }): Promise<FormSubmission>;

  update(
    id: string,
    userId: string,
    data: UpdateFormInput & {
      confirmation_number?: string;
      submitted_at?: string;
    }
  ): Promise<FormSubmission | null>;

  delete(id: string, userId: string): Promise<boolean>;
} 