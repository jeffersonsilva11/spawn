/**
 * ServerInstance Repository Implementation
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { IServerInstanceRepository } from '../../../domain/repositories';
import { ServerInstance } from '../../../domain/entities';
import { ServerInstanceOrm } from '../entities';
import { EntityMapper } from '../mappers/entity.mapper';

@Injectable()
export class ServerInstanceRepository implements IServerInstanceRepository {
  constructor(
    @InjectRepository(ServerInstanceOrm)
    private readonly repository: Repository<ServerInstanceOrm>,
  ) {}

  async findById(id: string): Promise<ServerInstance | null> {
    const orm = await this.repository.findOne({ where: { id } });
    return orm ? EntityMapper.toDomainServerInstance(orm) : null;
  }

  async findByProjectId(projectId: string): Promise<ServerInstance[]> {
    const orms = await this.repository.find({
      where: { projectId },
      order: { createdAt: 'DESC' },
    });
    return orms.map(EntityMapper.toDomainServerInstance);
  }

  async findByStudioId(studioId: string): Promise<ServerInstance[]> {
    const orms = await this.repository
      .createQueryBuilder('server')
      .innerJoin('server.project', 'project')
      .where('project.studioId = :studioId', { studioId })
      .orderBy('server.createdAt', 'DESC')
      .getMany();
    return orms.map(EntityMapper.toDomainServerInstance);
  }

  async findRunningByProjectId(projectId: string): Promise<ServerInstance[]> {
    const orms = await this.repository.find({
      where: { projectId, status: 'running' },
    });
    return orms.map(EntityMapper.toDomainServerInstance);
  }

  async findByContainerId(containerId: string): Promise<ServerInstance | null> {
    const orm = await this.repository.findOne({ where: { containerId } });
    return orm ? EntityMapper.toDomainServerInstance(orm) : null;
  }

  async create(serverInstance: ServerInstance): Promise<ServerInstance> {
    const orm = EntityMapper.toOrmServerInstance(serverInstance);
    const saved = await this.repository.save(orm);
    return EntityMapper.toDomainServerInstance(saved);
  }

  async update(serverInstance: ServerInstance): Promise<ServerInstance> {
    const orm = EntityMapper.toOrmServerInstance(serverInstance);
    const saved = await this.repository.save(orm);
    return EntityMapper.toDomainServerInstance(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async countRunningByStudioId(studioId: string): Promise<number> {
    return this.repository
      .createQueryBuilder('server')
      .innerJoin('server.project', 'project')
      .where('project.studioId = :studioId', { studioId })
      .andWhere('server.status IN (:...statuses)', {
        statuses: ['starting', 'running'],
      })
      .getCount();
  }

  async findUnhealthyServers(timeoutSeconds: number): Promise<ServerInstance[]> {
    const cutoffTime = new Date(Date.now() - timeoutSeconds * 1000);
    const orms = await this.repository.find({
      where: {
        status: 'running',
        lastHeartbeat: LessThan(cutoffTime),
      },
    });
    return orms.map(EntityMapper.toDomainServerInstance);
  }
}
