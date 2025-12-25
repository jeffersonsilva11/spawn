/**
 * Stop Server Use Case - Application Layer
 *
 * Business logic for stopping a running server instance.
 */

import { Injectable, Inject } from '@nestjs/common';
import {
  IServerInstanceRepository,
  IProjectRepository,
} from '../../domain/repositories';
import { IOrchestratorService } from '../../domain/interfaces';

export interface StopServerRequest {
  serverId: string;
  studioId: string;
}

export interface StopServerResponse {
  serverId: string;
  status: string;
}

@Injectable()
export class StopServerUseCase {
  constructor(
    @Inject('IServerInstanceRepository')
    private readonly serverInstanceRepository: IServerInstanceRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('IOrchestratorService')
    private readonly orchestratorService: IOrchestratorService,
  ) {}

  async execute(request: StopServerRequest): Promise<StopServerResponse> {
    // Get server instance
    const server = await this.serverInstanceRepository.findById(request.serverId);
    if (!server) {
      throw new Error('Server not found');
    }

    // Verify ownership
    const project = await this.projectRepository.findById(server.projectId);
    if (!project || !project.belongsToStudio(request.studioId)) {
      throw new Error('Unauthorized: Server does not belong to your studio');
    }

    // Check if server can be stopped
    if (!server.canBeStopped()) {
      throw new Error(`Server cannot be stopped in status: ${server.status}`);
    }

    // Mark as stopping
    server.markAsStopping();
    await this.serverInstanceRepository.update(server);

    try {
      // Request orchestrator to stop container
      if (server.containerId) {
        await this.orchestratorService.stopServer(server.containerId);
      }

      // Mark as stopped
      server.markAsStopped();
      await this.serverInstanceRepository.update(server);

      return {
        serverId: server.id,
        status: server.status,
      };
    } catch (error) {
      // Mark as failed
      server.markAsFailed();
      await this.serverInstanceRepository.update(server);
      throw new Error(`Failed to stop server: ${error.message}`);
    }
  }
}
