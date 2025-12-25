/**
 * Build Repository Implementation
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IBuildRepository } from '../../../domain/repositories';
import { Build } from '../../../domain/entities';
import { BuildOrm } from '../entities';
import { EntityMapper } from '../mappers/entity.mapper';

@Injectable()
export class BuildRepository implements IBuildRepository {
  constructor(
    @InjectRepository(BuildOrm)
    private readonly repository: Repository<BuildOrm>,
  ) {}

  async findById(id: string): Promise<Build | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? EntityMapper.toDomainBuild(orm) : null;
  }

  async findByProjectId(projectId: string): Promise<Build[]> {
    const orms = await this.repository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
    return orms.map(EntityMapper.toDomainBuild);
  }

  async findLatestByProjectId(projectId: string): Promise<Build | null> {
    const orm = await this.repository.findOne({
      where: { projectId, status: 'ready' },
      order: { createdAt: 'DESC' },
    });
    return orm ? EntityMapper.toDomainBuild(orm) : null;
  }

  async create(build: Build): Promise<Build> {
    const orm = EntityMapper.toOrmBuild(build);
    const saved = await this.repository.save(orm);
    return EntityMapper.toDomainBuild(saved);
  }

  async update(build: Build): Promise<Build> {
    const orm = EntityMapper.toOrmBuild(build);
    const saved = await this.repository.save(orm);
    return EntityMapper.toDomainBuild(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
