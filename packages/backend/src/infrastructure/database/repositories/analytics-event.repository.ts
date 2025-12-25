/**
 * AnalyticsEvent Repository Implementation - Infrastructure Layer
 */

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between } from 'typeorm';
import { IAnalyticsEventRepository } from '../../../domain/repositories/analytics-event.repository.interface';
import {
  AnalyticsEvent,
  AnalyticsEventProps,
} from '../../../domain/entities/analytics-event.entity';
import { AnalyticsEventEntityOrm } from '../entities/analytics-event.entity.orm';

@Injectable()
export class AnalyticsEventRepository implements IAnalyticsEventRepository {
  constructor(
    @InjectRepository(AnalyticsEventEntityOrm)
    private readonly repository: Repository<AnalyticsEventEntityOrm>,
  ) {}

  async save(event: AnalyticsEvent): Promise<AnalyticsEvent> {
    const props = event.toObject();
    const entity = this.repository.create(props);
    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<AnalyticsEvent | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findByProjectId(
    projectId: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<AnalyticsEvent[]> {
    const entities = await this.repository.find({
      where: { projectId },
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findByPlayerId(
    playerId: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<AnalyticsEvent[]> {
    const entities = await this.repository.find({
      where: { playerId },
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findByEventName(
    projectId: string,
    eventName: string,
    limit: number = 100,
    offset: number = 0,
  ): Promise<AnalyticsEvent[]> {
    const entities = await this.repository.find({
      where: { projectId, eventName },
      order: { timestamp: 'DESC' },
      take: limit,
      skip: offset,
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findByTimeRange(
    projectId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<AnalyticsEvent[]> {
    const entities = await this.repository.find({
      where: {
        projectId,
        timestamp: Between(startDate, endDate),
      },
      order: { timestamp: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async countByProjectId(projectId: string): Promise<number> {
    return await this.repository.count({ where: { projectId } });
  }

  async countByEventName(projectId: string, eventName: string): Promise<number> {
    return await this.repository.count({ where: { projectId, eventName } });
  }

  async getUniqueEventNames(projectId: string): Promise<string[]> {
    const result = await this.repository
      .createQueryBuilder('event')
      .select('DISTINCT event.event_name', 'eventName')
      .where('event.project_id = :projectId', { projectId })
      .getRawMany();

    return result.map((r) => r.eventName);
  }

  async deleteOlderThan(date: Date): Promise<void> {
    await this.repository.delete({
      timestamp: LessThan(date),
    });
  }

  private toDomain(entity: AnalyticsEventEntityOrm): AnalyticsEvent {
    const props: AnalyticsEventProps = {
      id: entity.id,
      projectId: entity.projectId,
      playerId: entity.playerId,
      eventName: entity.eventName,
      eventData: entity.eventData,
      timestamp: entity.timestamp,
    };
    return new AnalyticsEvent(props);
  }
}
