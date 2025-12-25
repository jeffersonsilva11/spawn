/**
 * ServerInstance Repository Interface - Domain Layer
 */

import { ServerInstance, ServerStatus } from '../entities';

export interface IServerInstanceRepository {
  findById(id: string): Promise<ServerInstance | null>;
  findByProjectId(projectId: string): Promise<ServerInstance[]>;
  findByStudioId(studioId: string): Promise<ServerInstance[]>;
  findRunningByProjectId(projectId: string): Promise<ServerInstance[]>;
  findByContainerId(containerId: string): Promise<ServerInstance | null>;
  create(serverInstance: ServerInstance): Promise<ServerInstance>;
  update(serverInstance: ServerInstance): Promise<ServerInstance>;
  delete(id: string): Promise<void>;
  countRunningByStudioId(studioId: string): Promise<number>;
  findUnhealthyServers(timeoutSeconds: number): Promise<ServerInstance[]>;
}
