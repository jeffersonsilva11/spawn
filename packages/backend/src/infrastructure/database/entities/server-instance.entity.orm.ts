/**
 * ServerInstance ORM Entity - Infrastructure Layer
 */

import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProjectOrm } from './project.entity.orm';
import { BuildOrm } from './build.entity.orm';

@Entity('server_instances')
export class ServerInstanceOrm {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => ProjectOrm, (project) => project.servers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: ProjectOrm;

  @Column({ name: 'build_id', type: 'uuid' })
  buildId: string;

  @ManyToOne(() => BuildOrm, (build) => build.servers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'build_id' })
  build: BuildOrm;

  @Column({ type: 'varchar' })
  status: string;

  @Column({ name: 'container_id', nullable: true })
  containerId: string | null;

  @Column({ nullable: true })
  ip: string | null;

  @Column({ type: 'int', nullable: true })
  port: number | null;

  @Column({ name: 'last_heartbeat', type: 'timestamp', nullable: true })
  lastHeartbeat: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
