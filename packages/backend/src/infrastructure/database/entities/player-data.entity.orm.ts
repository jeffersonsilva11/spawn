/**
 * PlayerData ORM Entity - Infrastructure Layer
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
import { PlayerEntityOrm } from './player.entity.orm';

@Entity('player_data')
@Index(['playerId', 'key'], { unique: true })
export class PlayerDataEntityOrm {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @Column({ type: 'uuid', name: 'player_id' })
  playerId: string;

  @Column({ type: 'varchar', length: 255 })
  key: string;

  @Column({ type: 'jsonb' })
  value: any;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => PlayerEntityOrm)
  @JoinColumn({ name: 'player_id' })
  player: PlayerEntityOrm;
}
