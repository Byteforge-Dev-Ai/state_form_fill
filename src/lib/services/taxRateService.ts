import { TaxRate } from '@/types/database';
import { TaxRateRepository } from '../repositories/interfaces/taxRateRepository';

export class TaxRateService {
  constructor(private taxRateRepository: TaxRateRepository) {}

  async getAll(): Promise<TaxRate[]> {
    return this.taxRateRepository.getAll();
  }

  async getCurrent(): Promise<TaxRate> {
    return this.taxRateRepository.getCurrent();
  }

  async getById(id: string): Promise<TaxRate | null> {
    return this.taxRateRepository.getById(id);
  }

  async getEffectiveOnDate(date: string): Promise<TaxRate | null> {
    return this.taxRateRepository.getEffectiveOnDate(date);
  }

  async create(userId: string, data: {
    rate: number;
    multiplier: number;
    effective_from: string;
  }): Promise<TaxRate> {
    return this.taxRateRepository.create({
      ...data,
      created_by: userId
    });
  }

  async update(id: string, data: {
    rate?: number;
    multiplier?: number;
    effective_from?: string;
  }): Promise<TaxRate | null> {
    return this.taxRateRepository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return this.taxRateRepository.delete(id);
  }
} 