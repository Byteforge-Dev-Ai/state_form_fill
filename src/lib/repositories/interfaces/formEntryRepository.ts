import { SalesEntry } from '@/types/database';

export interface CreateFormEntryInput {
  date_of_sale: string;
  invoice_number?: string;
  vendor_name: string;
  cigar_description: string;
  number_of_cigars: number;
  cost_of_cigar: number;
  entry_index?: number;
}

export interface UpdateFormEntryInput {
  date_of_sale?: string;
  invoice_number?: string;
  vendor_name?: string;
  cigar_description?: string;
  number_of_cigars?: number;
  cost_of_cigar?: number;
  entry_index?: number;
}

export interface FormEntryRepository {
  getAllByFormId(
    formId: string,
    userId: string,
    options?: {
      vendor?: string;
      startDate?: string;
      endDate?: string;
      sort?: string;
      order?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    }
  ): Promise<{
    data: SalesEntry[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  }>;

  getById(formId: string, entryId: string, userId: string): Promise<SalesEntry | null>;

  create(formId: string, userId: string, data: CreateFormEntryInput): Promise<SalesEntry>;

  update(
    formId: string,
    entryId: string,
    userId: string,
    data: UpdateFormEntryInput
  ): Promise<SalesEntry | null>;

  delete(formId: string, entryId: string, userId: string): Promise<boolean>;
} 