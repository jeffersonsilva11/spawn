/**
 * Studio ORM Entity - Infrastructure Layer
 */

import { Entity, Column, PrimaryColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { UserOrm } from './user.entity.orm';
import { ProjectOrm } from './project.entity.orm';

@Entity('studios')
export class StudioOrm {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ name: 'api_key', unique: true })
  apiKey: string;

  @Column({ name: 'max_servers', type: 'int', default: 10 })
  maxServers: number;

  @OneToMany(() => UserOrm, (user) => user.studio)
  users: UserOrm[];

  @OneToMany(() => ProjectOrm, (project) => project.studio)
  projects: ProjectOrm[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
