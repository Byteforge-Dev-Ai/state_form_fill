import { SalesEntry } from '@/types/database';
import { FormEntryRepository, CreateFormEntryInput, UpdateFormEntryInput } from '../repositories/interfaces/formEntryRepository';

export class FormEntryService {
  private formEntryRepository: FormEntryRepository;

  constructor(formEntryRepository: FormEntryRepository) {
    this.formEntryRepository = formEntryRepository;
  }

  async getAllByFormId(
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
  }> {
    return this.formEntryRepository.getAllByFormId(formId, userId, options);
  }

  async getById(formId: string, entryId: string, userId: string): Promise<SalesEntry | null> {
    return this.formEntryRepository.getById(formId, entryId, userId);
  }

  async create(
    formId: string,
    userId: string,
    data: CreateFormEntryInput
  ): Promise<SalesEntry> {
    return this.formEntryRepository.create(formId, userId, data);
  }

  async update(
    formId: string,
    entryId: string,
    userId: string,
    data: UpdateFormEntryInput
  ): Promise<SalesEntry | null> {
    return this.formEntryRepository.update(formId, entryId, userId, data);
  }

  async delete(formId: string, entryId: string, userId: string): Promise<boolean> {
    return this.formEntryRepository.delete(formId, entryId, userId);
  }
} 