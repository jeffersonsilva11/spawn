/**
 * Project Repository Interface - Domain Layer
 */

import { Project } from '../entities';

export interface IProjectRepository {
  findById(id: string): Promise<Project | null>;
  findByStudioId(studioId: string): Promise<Project[]>;
  create(project: Project): Promise<Project>;
  update(project: Project): Promise<Project>;
  delete(id: string): Promise<void>;
  countByStudioId(studioId: string): Promise<number>;
}
