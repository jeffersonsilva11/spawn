/**
 * Orchestrator Service Interface - Domain Layer
 *
 * Defines the contract for communicating with the Orchestrator service.
 * Infrastructure layer implements this interface.
 */

export interface IOrchestratorService {
  /**
   * Start a new server container
   */
  startServer(request: StartServerRequest): Promise<StartServerResponse>;

  /**
   * Stop a server container
   */
  stopServer(containerId: string): Promise<void>;

  /**
   * Get container status
   */
  getContainerStatus(containerId: string): Promise<ContainerStatus>;

  /**
   * List all running containers
   */
  listContainers(): Promise<ContainerInfo[]>;

  /**
   * Check orchestrator health
   */
  healthCheck(): Promise<boolean>;
}

export interface StartServerRequest {
  projectId: string;
  buildId: string;
  dockerImage: string;
  serverInstanceId: string;
}

export interface StartServerResponse {
  containerId: string;
  ip: string;
  port: number;
}

export interface ContainerStatus {
  containerId: string;
  status: 'running' | 'stopped' | 'failed';
  ip?: string;
  port?: number;
}

export interface ContainerInfo {
  containerId: string;
  serverInstanceId: string;
  status: string;
  port: number;
  uptime: number;
}
