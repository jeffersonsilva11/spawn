/**
 * Docker Manager Service
 *
 * Manages Unity server Docker containers.
 */

import Docker from 'dockerode';
import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';

export interface StartContainerRequest {
  projectId: string;
  buildId: string;
  dockerImage: string;
  serverInstanceId: string;
}

export interface StartContainerResponse {
  containerId: string;
  ip: string;
  port: number;
}

export interface ContainerInfo {
  containerId: string;
  serverInstanceId: string;
  port: number;
  status: string;
  createdAt: Date;
}

export class DockerManager extends EventEmitter {
  private docker: Docker;
  private logger: Logger;
  private availablePorts: Set<number>;
  private runningContainers: Map<string, ContainerInfo>;
  private readonly portRangeStart: number;
  private readonly portRangeEnd: number;
  private readonly publicIp: string;
  private readonly networkName: string;
  private readonly cpuLimit: number;
  private readonly memoryLimit: string;

  constructor(config: {
    portRangeStart: number;
    portRangeEnd: number;
    publicIp: string;
    networkName: string;
    cpuLimit: number;
    memoryLimit: string;
  }) {
    super();

    this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
    this.logger = new Logger('DockerManager');

    this.portRangeStart = config.portRangeStart;
    this.portRangeEnd = config.portRangeEnd;
    this.publicIp = config.publicIp;
    this.networkName = config.networkName;
    this.cpuLimit = config.cpuLimit;
    this.memoryLimit = config.memoryLimit;

    this.availablePorts = new Set();
    this.runningContainers = new Map();

    // Initialize port pool
    for (let port = this.portRangeStart; port <= this.portRangeEnd; port++) {
      this.availablePorts.add(port);
    }

    this.logger.info(
      `Initialized with ${this.availablePorts.size} available ports (${this.portRangeStart}-${this.portRangeEnd})`,
    );
  }

  /**
   * Start a new Unity server container
   */
  async startContainer(
    request: StartContainerRequest,
  ): Promise<StartContainerResponse> {
    // Allocate port
    const port = this.allocatePort();
    if (!port) {
      throw new Error('No available ports');
    }

    try {
      this.logger.info(
        `Starting container for project ${request.projectId}, port ${port}`,
      );

      // Create container
      const container = await this.docker.createContainer({
        Image: request.dockerImage,
        name: `unity-server-${request.serverInstanceId}`,
        Env: [
          `SERVER_PORT=${port}`,
          `SERVER_ID=${request.serverInstanceId}`,
          `PROJECT_ID=${request.projectId}`,
          `BUILD_ID=${request.buildId}`,
        ],
        ExposedPorts: {
          [`${port}/tcp`]: {},
          [`${port}/udp`]: {},
        },
        HostConfig: {
          PortBindings: {
            [`${port}/tcp`]: [{ HostPort: `${port}` }],
            [`${port}/udp`]: [{ HostPort: `${port}` }],
          },
          NetworkMode: this.networkName,
          Memory: this.parseMemoryLimit(this.memoryLimit),
          NanoCpus: this.cpuLimit * 1e9, // Convert to nanocpus
          RestartPolicy: {
            Name: 'unless-stopped',
          },
        },
        User: '1000:1000', // Non-root user
      });

      // Start container
      await container.start();

      const containerInfo: ContainerInfo = {
        containerId: container.id,
        serverInstanceId: request.serverInstanceId,
        port,
        status: 'running',
        createdAt: new Date(),
      };

      this.runningContainers.set(container.id, containerInfo);

      this.logger.info(`Container ${container.id} started on port ${port}`);

      return {
        containerId: container.id,
        ip: this.publicIp,
        port,
      };
    } catch (error) {
      // Release port on failure
      this.releasePort(port);
      this.logger.error(`Failed to start container: ${error.message}`);
      throw error;
    }
  }

  /**
   * Stop and remove a container
   */
  async stopContainer(containerId: string): Promise<void> {
    const containerInfo = this.runningContainers.get(containerId);
    if (!containerInfo) {
      throw new Error('Container not found');
    }

    try {
      this.logger.info(`Stopping container ${containerId}`);

      const container = this.docker.getContainer(containerId);

      // Stop container
      await container.stop({ t: 10 }); // 10 second grace period

      // Remove container
      await container.remove();

      // Release port
      this.releasePort(containerInfo.port);

      // Remove from tracking
      this.runningContainers.delete(containerId);

      this.logger.info(`Container ${containerId} stopped and removed`);
    } catch (error) {
      this.logger.error(`Failed to stop container: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get container status
   */
  async getContainerStatus(containerId: string): Promise<any> {
    try {
      const container = this.docker.getContainer(containerId);
      const info = await container.inspect();

      return {
        containerId,
        status: info.State.Running ? 'running' : 'stopped',
        startedAt: info.State.StartedAt,
      };
    } catch (error) {
      this.logger.error(`Failed to get container status: ${error.message}`);
      throw error;
    }
  }

  /**
   * List all running containers managed by orchestrator
   */
  listContainers(): ContainerInfo[] {
    return Array.from(this.runningContainers.values());
  }

  /**
   * Clean up unhealthy containers
   */
  async cleanupUnhealthyContainers(): Promise<void> {
    this.logger.info('Cleaning up unhealthy containers...');

    for (const [containerId, info] of this.runningContainers.entries()) {
      try {
        const container = this.docker.getContainer(containerId);
        const inspectInfo = await container.inspect();

        // If container is not running, clean it up
        if (!inspectInfo.State.Running) {
          this.logger.warn(`Container ${containerId} is not running, removing...`);
          await this.stopContainer(containerId);
        }
      } catch (error) {
        // Container might not exist
        this.logger.warn(`Container ${containerId} not found, removing from tracking`);
        this.runningContainers.delete(containerId);
        this.releasePort(info.port);
      }
    }
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      runningContainers: this.runningContainers.size,
      availablePorts: this.availablePorts.size,
      totalPorts: this.portRangeEnd - this.portRangeStart + 1,
    };
  }

  /**
   * Allocate an available port
   */
  private allocatePort(): number | null {
    const port = this.availablePorts.values().next().value;
    if (port) {
      this.availablePorts.delete(port);
      return port;
    }
    return null;
  }

  /**
   * Release a port back to the pool
   */
  private releasePort(port: number): void {
    this.availablePorts.add(port);
  }

  /**
   * Parse memory limit string to bytes
   */
  private parseMemoryLimit(limit: string): number {
    const match = limit.match(/^(\d+)([kmg])?$/i);
    if (!match) {
      throw new Error(`Invalid memory limit: ${limit}`);
    }

    const value = parseInt(match[1], 10);
    const unit = (match[2] || '').toLowerCase();

    switch (unit) {
      case 'k':
        return value * 1024;
      case 'm':
        return value * 1024 * 1024;
      case 'g':
        return value * 1024 * 1024 * 1024;
      default:
        return value;
    }
  }
}
