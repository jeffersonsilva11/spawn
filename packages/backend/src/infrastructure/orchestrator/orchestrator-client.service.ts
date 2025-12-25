/**
 * Orchestrator Client Service - Infrastructure Layer
 *
 * HTTP client for communicating with the Orchestrator service.
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  IOrchestratorService,
  StartServerRequest,
  StartServerResponse,
  ContainerStatus,
  ContainerInfo,
} from '../../domain/interfaces';

@Injectable()
export class OrchestratorClientService implements IOrchestratorService {
  private readonly logger = new Logger(OrchestratorClientService.name);
  private readonly client: AxiosInstance;
  private readonly orchestratorUrl: string;
  private readonly orchestratorSecret: string;

  constructor(private readonly configService: ConfigService) {
    this.orchestratorUrl = this.configService.get('ORCHESTRATOR_URL')!;
    this.orchestratorSecret = this.configService.get('ORCHESTRATOR_SECRET')!;

    this.client = axios.create({
      baseURL: this.orchestratorUrl,
      headers: {
        'X-Orchestrator-Secret': this.orchestratorSecret,
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 seconds
    });
  }

  async startServer(request: StartServerRequest): Promise<StartServerResponse> {
    try {
      this.logger.log(`Starting server for project ${request.projectId}`);

      const response = await this.client.post('/containers/start', {
        projectId: request.projectId,
        buildId: request.buildId,
        dockerImage: request.dockerImage,
        serverInstanceId: request.serverInstanceId,
      });

      this.logger.log(
        `Server started successfully: ${response.data.containerId}`,
      );

      return {
        containerId: response.data.containerId,
        ip: response.data.ip,
        port: response.data.port,
      };
    } catch (error) {
      this.logger.error(`Failed to start server: ${error.message}`, error.stack);
      throw new Error(`Orchestrator failed to start server: ${error.message}`);
    }
  }

  async stopServer(containerId: string): Promise<void> {
    try {
      this.logger.log(`Stopping container ${containerId}`);

      await this.client.delete(`/containers/${containerId}`);

      this.logger.log(`Container ${containerId} stopped successfully`);
    } catch (error) {
      this.logger.error(
        `Failed to stop container: ${error.message}`,
        error.stack,
      );
      throw new Error(`Orchestrator failed to stop server: ${error.message}`);
    }
  }

  async getContainerStatus(containerId: string): Promise<ContainerStatus> {
    try {
      const response = await this.client.get(`/containers/${containerId}`);

      return {
        containerId: response.data.containerId,
        status: response.data.status,
        ip: response.data.ip,
        port: response.data.port,
      };
    } catch (error) {
      this.logger.error(
        `Failed to get container status: ${error.message}`,
        error.stack,
      );
      throw new Error(
        `Orchestrator failed to get container status: ${error.message}`,
      );
    }
  }

  async listContainers(): Promise<ContainerInfo[]> {
    try {
      const response = await this.client.get('/containers');

      return response.data.containers || [];
    } catch (error) {
      this.logger.error(
        `Failed to list containers: ${error.message}`,
        error.stack,
      );
      throw new Error(`Orchestrator failed to list containers: ${error.message}`);
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      this.logger.warn(`Orchestrator health check failed: ${error.message}`);
      return false;
    }
  }
}
