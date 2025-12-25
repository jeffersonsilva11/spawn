/**
 * Build ORM Entity - Infrastructure Layer
 */

import { Entity, Column, PrimaryColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ProjectOrm } from './project.entity.orm';
import { ServerInstanceOrm } from './server-instance.entity.orm';

@Entity('builds')
export class BuildOrm {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => ProjectOrm, (project) => project.builds, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'project_id' })
  project: ProjectOrm;

  @Column({ type: 'varchar' })
  version: string;

  @Column({ name: 's3_key', type: 'varchar' })
  s3Key: string;

  @Column({ name: 'docker_image', type: 'varchar', nullable: true })
  dockerImage: string | null;

  @Column({ type: 'varchar', default: 'ready' })
  status: string;

  @OneToMany(() => ServerInstanceOrm, (server) => server.build)
  servers: ServerInstanceOrm[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
