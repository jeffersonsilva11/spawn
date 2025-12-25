/**
 * Deploy Server Use Case - Application Layer
 *
 * Business logic for deploying a Unity server instance.
 */

import { ServerInstance, ServerStatus } from '../../domain/entities';
import {
  IServerInstanceRepository,
  IBuildRepository,
  IProjectRepository,
  IStudioRepository,
} from '../../domain/repositories';
import { IOrchestratorService } from '../../domain/interfaces';
import { v4 as uuidv4 } from 'uuid';

export interface DeployServerRequest {
  projectId: string;
  studioId: string;
  buildId?: string; // Optional - use latest if not provided
}

export interface DeployServerResponse {
  serverId: string;
  projectId: string;
  buildId: string;
  status: string;
  ip: string | null;
  port: number | null;
}

export class DeployServerUseCase {
  constructor(
    private readonly serverInstanceRepository: IServerInstanceRepository,
    private readonly buildRepository: IBuildRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly studioRepository: IStudioRepository,
    private readonly orchestratorService: IOrchestratorService,
  ) {}

  async execute(request: DeployServerRequest): Promise<DeployServerResponse> {
    // Verify project exists and belongs to studio
    const project = await this.projectRepository.findById(request.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (!project.belongsToStudio(request.studioId)) {
      throw new Error('Unauthorized: Project does not belong to your studio');
    }

    // Get studio and check server limit
    const studio = await this.studioRepository.findById(request.studioId);
    if (!studio) {
      throw new Error('Studio not found');
    }

    const runningServers = await this.serverInstanceRepository.countRunningByStudioId(
      request.studioId,
    );

    if (!studio.canCreateServer(runningServers)) {
      throw new Error(
        `Server limit reached. Maximum ${studio.maxServers} servers allowed.`,
      );
    }

    // Get build (latest or specific)
    let build;
    if (request.buildId) {
      build = await this.buildRepository.findById(request.buildId);
      if (!build || !build.belongsToProject(request.projectId)) {
        throw new Error('Build not found or does not belong to project');
      }
    } else {
      build = await this.buildRepository.findLatestByProjectId(request.projectId);
      if (!build) {
        throw new Error('No builds found for this project');
      }
    }

    if (!build.isReady()) {
      throw new Error('Build is not ready for deployment');
    }

    // Create server instance record
    const serverId = uuidv4();
    const serverInstance = new ServerInstance(
      serverId,
      request.projectId,
      build.id,
      ServerStatus.STARTING,
      null,
      null,
      null,
      null,
      new Date(),
      new Date(),
    );

    const createdServer = await this.serverInstanceRepository.create(serverInstance);

    try {
      // Request orchestrator to start container
      const orchestratorResponse = await this.orchestratorService.startServer({
        projectId: request.projectId,
        buildId: build.id,
        dockerImage: build.dockerImage || `unity-server:${build.id}`,
        serverInstanceId: serverId,
      });

      // Update server instance with container info
      createdServer.markAsRunning(
        orchestratorResponse.containerId,
        orchestratorResponse.ip,
        orchestratorResponse.port,
      );

      await this.serverInstanceRepository.update(createdServer);

      return {
        serverId: createdServer.id,
        projectId: createdServer.projectId,
        buildId: createdServer.buildId,
        status: createdServer.status,
        ip: createdServer.ip,
        port: createdServer.port,
      };
    } catch (error) {
      // Mark server as failed
      createdServer.markAsFailed();
      await this.serverInstanceRepository.update(createdServer);
      throw new Error(`Failed to deploy server: ${error.message}`);
    }
  }
}
