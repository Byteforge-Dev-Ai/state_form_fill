import { IUserRepository, UserCreateDto } from '../repositories/interfaces/userRepository';
import { User } from '@/types/database';

export class UserService {
  constructor(private userRepository: IUserRepository) {}
  
  async getUser(id: string): Promise<User | null> {
    return this.userRepository.getById(id);
  }
  
  async getUserByEmail(email: string): Promise<User | null> {
    return this.userRepository.getByEmail(email);
  }
  
  async createUser(userData: UserCreateDto): Promise<User> {
    return this.userRepository.create(userData);
  }
  
  async updateUser(id: string, data: Partial<User>): Promise<User | null> {
    return this.userRepository.update(id, data);
  }
  
  async deleteUser(id: string): Promise<boolean> {
    return this.userRepository.delete(id);
  }
  
  async logUserLogin(id: string): Promise<void> {
    return this.userRepository.updateLastLogin(id);
  }
} 