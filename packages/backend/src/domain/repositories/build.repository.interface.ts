/**
 * Build Repository Interface - Domain Layer
 */

import { Build } from '../entities';

export interface IBuildRepository {
  findById(id: string): Promise<Build | null>;
  findByProjectId(projectId: string): Promise<Build[]>;
  findLatestByProjectId(projectId: string): Promise<Build | null>;
  create(build: Build): Promise<Build>;
  update(build: Build): Promise<Build>;
  delete(id: string): Promise<void>;
}
