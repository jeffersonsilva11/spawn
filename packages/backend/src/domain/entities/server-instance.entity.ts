/**
 * ServerInstance Entity - Domain Layer
 *
 * Represents a running Unity server instance in a Docker container.
 * Framework-agnostic domain entity.
 */

export class ServerInstance {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly buildId: string,
    public status: ServerStatus,
    public containerId: string | null,
    public ip: string | null,
    public port: number | null,
    public lastHeartbeat: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  /**
   * Mark server as starting
   */
  markAsStarting(): void {
    this.status = ServerStatus.STARTING;
    this.updatedAt = new Date();
  }

  /**
   * Mark server as running
   */
  markAsRunning(containerId: string, ip: string, port: number): void {
    this.status = ServerStatus.RUNNING;
    this.containerId = containerId;
    this.ip = ip;
    this.port = port;
    this.lastHeartbeat = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Mark server as stopping
   */
  markAsStopping(): void {
    this.status = ServerStatus.STOPPING;
    this.updatedAt = new Date();
  }

  /**
   * Mark server as stopped
   */
  markAsStopped(): void {
    this.status = ServerStatus.STOPPED;
    this.updatedAt = new Date();
  }

  /**
   * Mark server as failed
   */
  markAsFailed(): void {
    this.status = ServerStatus.FAILED;
    this.updatedAt = new Date();
  }

  /**
   * Update heartbeat
   */
  updateHeartbeat(): void {
    this.lastHeartbeat = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Check if server is healthy based on heartbeat
   */
  isHealthy(timeoutSeconds: number): boolean {
    if (!this.lastHeartbeat || this.status !== ServerStatus.RUNNING) {
      return false;
    }

    const now = new Date();
    const diffSeconds = (now.getTime() - this.lastHeartbeat.getTime()) / 1000;
    return diffSeconds <= timeoutSeconds;
  }

  /**
   * Check if server is running
   */
  isRunning(): boolean {
    return this.status === ServerStatus.RUNNING;
  }

  /**
   * Check if server can be stopped
   */
  canBeStopped(): boolean {
    return [ServerStatus.STARTING, ServerStatus.RUNNING].includes(this.status);
  }

  /**
   * Get connection info
   */
  getConnectionInfo(): { ip: string; port: number } | null {
    if (this.status === ServerStatus.RUNNING && this.ip && this.port) {
      return { ip: this.ip, port: this.port };
    }
    return null;
  }

  /**
   * Check if server belongs to a project
   */
  belongsToProject(projectId: string): boolean {
    return this.projectId === projectId;
  }
}

export enum ServerStatus {
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  FAILED = 'failed',
}
