/**
 * Studio Repository Implementation
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IStudioRepository } from '../../../domain/repositories';
import { Studio } from '../../../domain/entities';
import { StudioOrm } from '../entities';
import { EntityMapper } from '../mappers/entity.mapper';

@Injectable()
export class StudioRepository implements IStudioRepository {
  constructor(
    @InjectRepository(StudioOrm)
    private readonly repository: Repository<StudioOrm>,
  ) {}

  async findById(id: string): Promise<Studio | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? EntityMapper.toDomainStudio(orm) : null;
  }

  async findByApiKey(apiKey: string): Promise<Studio | null> {
    const orm = await this.repository.findOne({ where: { apiKey } });
    return orm ? EntityMapper.toDomainStudio(orm) : null;
  }

  async create(studio: Studio): Promise<Studio> {
    const orm = EntityMapper.toOrmStudio(studio);
    const saved = await this.repository.save(orm);
    return EntityMapper.toDomainStudio(saved);
  }

  async update(studio: Studio): Promise<Studio> {
    const orm = EntityMapper.toOrmStudio(studio);
    const saved = await this.repository.save(orm);
    return EntityMapper.toDomainStudio(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async apiKeyExists(apiKey: string): Promise<boolean> {
    const count = await this.repository.count({ where: { apiKey } });
    return count > 0;
  }
}
