/**
 * Get Or Create Server Use Case - Application Layer
 *
 * Business logic for Unity SDK to get an available server or create one.
 * This is the main entry point for clients to connect to servers.
 */

import { Injectable, Inject } from '@nestjs/common';
import {
  IServerInstanceRepository,
  IProjectRepository,
  IStudioRepository,
} from '../../domain/repositories';

export interface GetOrCreateServerRequest {
  projectId: string;
  studioId: string;
}

export interface GetOrCreateServerResponse {
  serverId: string;
  ip: string;
  port: number;
  status: string;
}

@Injectable()
export class GetOrCreateServerUseCase {
  constructor(
    @Inject('IServerInstanceRepository')
    private readonly serverInstanceRepository: IServerInstanceRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('IStudioRepository')
    private readonly studioRepository: IStudioRepository,
  ) {}

  async execute(
    request: GetOrCreateServerRequest,
  ): Promise<GetOrCreateServerResponse> {
    // Verify project exists and belongs to studio
    const project = await this.projectRepository.findById(request.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (!project.belongsToStudio(request.studioId)) {
      throw new Error('Unauthorized: Project does not belong to your studio');
    }

    // Find running servers for this project
    const runningServers = await this.serverInstanceRepository.findRunningByProjectId(
      request.projectId,
    );

    // Check for healthy servers
    for (const server of runningServers) {
      if (server.isHealthy(60)) {
        // 60 seconds timeout
        const connectionInfo = server.getConnectionInfo();
        if (connectionInfo) {
          return {
            serverId: server.id,
            ip: connectionInfo.ip,
            port: connectionInfo.port,
            status: server.status,
          };
        }
      }
    }

    // No healthy server found
    // For MVP, we return an error and let the developer manually deploy via panel
    // In production, this could auto-deploy a server
    throw new Error(
      'No available server found. Please deploy a server from the web panel.',
    );
  }
}
