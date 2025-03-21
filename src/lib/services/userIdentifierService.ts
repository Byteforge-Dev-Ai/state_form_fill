import { UserIdentifier } from '@/types/database';
import { IUserIdentifierRepository } from '../repositories/interfaces/userIdentifierRepository';

export class UserIdentifierService {
  constructor(private userIdentifierRepository: IUserIdentifierRepository) {}

  async getAllByUserId(userId: string): Promise<UserIdentifier[]> {
    return this.userIdentifierRepository.getAllByUserId(userId);
  }

  async getById(id: string, userId: string): Promise<UserIdentifier | null> {
    return this.userIdentifierRepository.getById(id, userId);
  }

  async create(userId: string, data: {
    legal_name: string;
    nc_dor_id: string;
    trade_name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  }): Promise<UserIdentifier> {
    const userIdentifier = {
      user_id: userId,
      legal_name: data.legal_name,
      nc_dor_id: data.nc_dor_id,
      trade_name: data.trade_name,
      address: data.address,
      city: data.city,
      state: data.state,
      zip_code: data.zip_code
    };

    return this.userIdentifierRepository.create(userIdentifier);
  }

  async update(id: string, userId: string, data: {
    legal_name?: string;
    nc_dor_id?: string;
    trade_name?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
  }): Promise<UserIdentifier | null> {
    return this.userIdentifierRepository.update(id, userId, data);
  }

  async delete(id: string, userId: string): Promise<boolean> {
    return this.userIdentifierRepository.delete(id, userId);
  }
} 