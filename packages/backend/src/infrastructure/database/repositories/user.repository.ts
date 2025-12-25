/**
 * User Repository Implementation - Infrastructure Layer
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IUserRepository } from '../../../domain/repositories';
import { User } from '../../../domain/entities';
import { UserOrm } from '../entities';
import { EntityMapper } from '../mappers/entity.mapper';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrm)
    private readonly repository: Repository<UserOrm>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? EntityMapper.toDomainUser(orm) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const orm = await this.repository.findOne({ where: { email } });
    return orm ? EntityMapper.toDomainUser(orm) : null;
  }

  async findByStudioId(studioId: string): Promise<User[]> {
    const orms = await this.repository.find({ where: { studioId } });
    return orms.map(EntityMapper.toDomainUser);
  }

  async create(user: User): Promise<User> {
    const orm = EntityMapper.toOrmUser(user);
    const saved = await this.repository.save(orm);
    return EntityMapper.toDomainUser(saved);
  }

  async update(user: User): Promise<User> {
    const orm = EntityMapper.toOrmUser(user);
    const saved = await this.repository.save(orm);
    return EntityMapper.toDomainUser(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.repository.count({ where: { email } });
    return count > 0;
  }
}
