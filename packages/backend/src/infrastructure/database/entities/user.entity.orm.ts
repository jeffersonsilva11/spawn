/**
 * User ORM Entity - Infrastructure Layer
 *
 * TypeORM implementation of User entity for PostgreSQL.
 */

import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StudioOrm } from './studio.entity.orm';

@Entity('users')
export class UserOrm {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ name: 'studio_id', type: 'uuid' })
  studioId: string;

  @ManyToOne(() => StudioOrm, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studio_id' })
  studio: StudioOrm;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
