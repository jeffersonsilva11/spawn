/**
 * AnalyticsEvent ORM Entity - Infrastructure Layer
 */

import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProjectOrm } from './project.entity.orm';
import { PlayerEntityOrm } from './player.entity.orm';

@Entity('analytics_events')
@Index(['projectId', 'timestamp'])
@Index(['projectId', 'eventName'])
@Index(['playerId', 'timestamp'])
export class AnalyticsEventEntityOrm {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'uuid', name: 'project_id' })
  projectId: string;

  @Column({ type: 'uuid', name: 'player_id', nullable: true })
  playerId?: string;

  @Column({ type: 'varchar', length: 255, name: 'event_name' })
  eventName: string;

  @Column({ type: 'jsonb', name: 'event_data', default: {} })
  eventData: Record<string, any>;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @ManyToOne(() => ProjectOrm)
  @JoinColumn({ name: 'project_id' })
  project: ProjectOrm;

  @ManyToOne(() => PlayerEntityOrm, { nullable: true })
  @JoinColumn({ name: 'player_id' })
  player?: PlayerEntityOrm;
}
