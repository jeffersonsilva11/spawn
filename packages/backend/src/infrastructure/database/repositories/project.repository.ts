/**
 * Project Repository Implementation
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IProjectRepository } from '../../../domain/repositories';
import { Project } from '../../../domain/entities';
import { ProjectOrm } from '../entities';
import { EntityMapper } from '../mappers/entity.mapper';

@Injectable()
export class ProjectRepository implements IProjectRepository {
  constructor(
    @InjectRepository(ProjectOrm)
    private readonly repository: Repository<ProjectOrm>,
  ) {}

  async findById(id: string): Promise<Project | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? EntityMapper.toDomainProject(orm) : null;
  }

  async findByStudioId(studioId: string): Promise<Project[]> {
    const orms = await this.repository.find({ where: { studioId } });
    return orms.map(EntityMapper.toDomainProject);
  }

  async create(project: Project): Promise<Project> {
    const orm = EntityMapper.toOrmProject(project);
    const saved = await this.repository.save(orm);
    return EntityMapper.toDomainProject(saved);
  }

  async update(project: Project): Promise<Project> {
    const orm = EntityMapper.toOrmProject(project);
    const saved = await this.repository.save(orm);
    return EntityMapper.toDomainProject(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async countByStudioId(studioId: string): Promise<number> {
    return this.repository.count({ where: { studioId } });
  }
}
