/**
 * Build Entity - Domain Layer
 *
 * Represents a Unity server build for a project.
 * Stored in S3 and referenced for deployments.
 * Framework-agnostic domain entity.
 */

export class Build {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public version: string,
    public s3Key: string,
    public dockerImage: string | null,
    public status: BuildStatus,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  /**
   * Mark build as ready for deployment
   */
  markAsReady(dockerImage: string): void {
    this.dockerImage = dockerImage;
    this.status = BuildStatus.READY;
    this.updatedAt = new Date();
  }

  /**
   * Mark build as failed
   */
  markAsFailed(): void {
    this.status = BuildStatus.FAILED;
    this.updatedAt = new Date();
  }

  /**
   * Check if build is ready for deployment
   */
  isReady(): boolean {
    return this.status === BuildStatus.READY && this.dockerImage !== null;
  }

  /**
   * Check if build belongs to a project
   */
  belongsToProject(projectId: string): boolean {
    return this.projectId === projectId;
  }

  /**
   * Domain validation
   */
  static validate(version: string, s3Key: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!version || version.trim().length === 0) {
      errors.push('Build version cannot be empty');
    }

    if (version.length > 50) {
      errors.push('Build version cannot exceed 50 characters');
    }

    if (!s3Key || s3Key.trim().length === 0) {
      errors.push('S3 key cannot be empty');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export enum BuildStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
}
