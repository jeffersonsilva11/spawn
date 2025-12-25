/**
 * Project ORM Entity - Infrastructure Layer
 */

import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { StudioOrm } from './studio.entity.orm';
import { BuildOrm } from './build.entity.orm';
import { ServerInstanceOrm } from './server-instance.entity.orm';

@Entity('projects')
export class ProjectOrm {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'studio_id', type: 'uuid' })
  studioId: string;

  @ManyToOne(() => StudioOrm, (studio) => studio.projects, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'studio_id' })
  studio: StudioOrm;

  @Column()
  name: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @OneToMany(() => BuildOrm, (build) => build.project)
  builds: BuildOrm[];

  @OneToMany(() => ServerInstanceOrm, (server) => server.project)
  servers: ServerInstanceOrm[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
