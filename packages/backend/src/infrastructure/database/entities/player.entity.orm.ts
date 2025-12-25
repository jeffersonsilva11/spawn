/**
 * Player ORM Entity - Infrastructure Layer
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

@Entity('players')
@Index(['projectId', 'playerId'], { unique: true })
@Index(['projectId', 'email'], { unique: true, where: 'email IS NOT NULL' })
export class PlayerEntityOrm {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'uuid', name: 'project_id' })
  projectId: string;

  @Column({ type: 'varchar', length: 255, name: 'player_id' })
  playerId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'password_hash' })
  passwordHash?: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'display_name' })
  displayName?: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => ProjectOrm)
  @JoinColumn({ name: 'project_id' })
  project: ProjectOrm;
}
