import { FormSubmission } from '@/types/database';
import { CreateFormInput, UpdateFormInput } from '../validators/formValidator';
import { FormRepository } from '../repositories/interfaces/formRepository';

export class FormService {
  private repository: FormRepository;

  constructor(repository: FormRepository) {
    this.repository = repository;
  }

  async getAllByUserId(userId: string, options?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): Promise<{ data: FormSubmission[]; pagination: { total: number; page: number; limit: number; pages: number } }> {
    return this.repository.getAllByUserId(userId, options);
  }

  async getById(id: string, userId: string): Promise<FormSubmission | null> {
    return this.repository.getById(id, userId);
  }

  async create(userId: string, data: CreateFormInput): Promise<FormSubmission> {
    // Set default status to 'draft' when creating
    return this.repository.create(userId, {
      ...data,
      status: 'draft',
    });
  }

  async update(id: string, userId: string, data: UpdateFormInput): Promise<FormSubmission | null> {
    return this.repository.update(id, userId, data);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    return this.repository.delete(id, userId);
  }

  async submitForm(id: string, userId: string): Promise<FormSubmission | null> {
    // First get the form to make sure it exists and can be submitted
    const form = await this.repository.getById(id, userId);
    
    if (!form) {
      return null;
    }
    
    // Check that the form has the appropriate status to be submitted
    if (form.status !== 'draft' && form.status !== 'in_progress') {
      throw new Error('Form cannot be submitted in its current status');
    }
    
    // Generate a confirmation number
    const confirmationNumber = this.generateConfirmationNumber();
    
    // Update the form status to submitted
    return this.repository.update(id, userId, {
      status: 'submitted',
      confirmation_number: confirmationNumber,
      submitted_at: new Date().toISOString(),
    });
  }

  private generateConfirmationNumber(): string {
    // Generate a confirmation number in format: YYYY-MM-DD-XXXXXX
    const now = new Date();
    const datePart = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const randomPart = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
    
    return `${datePart}-${randomPart}`;
  }
} 