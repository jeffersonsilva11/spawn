/**
 * Leaderboard ORM Entity - Infrastructure Layer
 */

import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ProjectOrm } from './project.entity.orm';
import { PlayerEntityOrm } from './player.entity.orm';

@Entity('leaderboards')
@Index(['projectId', 'leaderboardName', 'playerId'], { unique: true })
@Index(['projectId', 'leaderboardName', 'score'])
export class LeaderboardEntityOrm {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'uuid', name: 'project_id' })
  projectId: string;

  @Column({ type: 'varchar', length: 255, name: 'leaderboard_name' })
  leaderboardName: string;

  @Column({ type: 'uuid', name: 'player_id' })
  playerId: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  score: number;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ProjectOrm)
  @JoinColumn({ name: 'project_id' })
  project: ProjectOrm;

  @ManyToOne(() => PlayerEntityOrm)
  @JoinColumn({ name: 'player_id' })
  player: PlayerEntityOrm;
}
