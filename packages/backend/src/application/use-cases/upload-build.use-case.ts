/**
 * Upload Build Use Case - Application Layer
 *
 * Business logic for uploading a Unity server build.
 */

import { Build, BuildStatus } from '../../domain/entities';
import { IBuildRepository, IProjectRepository } from '../../domain/repositories';
import { IStorageService } from '../../domain/interfaces';
import { v4 as uuidv4 } from 'uuid';

export interface UploadBuildRequest {
  projectId: string;
  studioId: string;
  version: string;
  file: Express.Multer.File;
}

export interface UploadBuildResponse {
  buildId: string;
  projectId: string;
  version: string;
  status: string;
  s3Key: string;
}

export class UploadBuildUseCase {
  constructor(
    private readonly buildRepository: IBuildRepository,
    private readonly projectRepository: IProjectRepository,
    private readonly storageService: IStorageService,
  ) {}

  async execute(request: UploadBuildRequest): Promise<UploadBuildResponse> {
    // Verify project exists and belongs to studio
    const project = await this.projectRepository.findById(request.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    if (!project.belongsToStudio(request.studioId)) {
      throw new Error('Unauthorized: Project does not belong to your studio');
    }

    // Validate build input
    const validation = Build.validate(request.version, '');
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Validate file
    if (!request.file) {
      throw new Error('Build file is required');
    }

    // Check file size (max 500MB)
    const maxSizeBytes = 500 * 1024 * 1024;
    if (request.file.size > maxSizeBytes) {
      throw new Error('Build file exceeds maximum size of 500MB');
    }

    // Generate S3 key
    const buildId = uuidv4();
    const s3Key = `builds/${request.projectId}/${buildId}/${request.file.originalname}`;

    // Upload to S3
    await this.storageService.uploadFile(
      s3Key,
      request.file.buffer,
      request.file.mimetype,
    );

    // Create build record
    const build = new Build(
      buildId,
      request.projectId,
      request.version,
      s3Key,
      null, // Docker image will be built later
      BuildStatus.READY, // For MVP, mark as ready immediately
      new Date(),
      new Date(),
    );

    const createdBuild = await this.buildRepository.create(build);

    return {
      buildId: createdBuild.id,
      projectId: createdBuild.projectId,
      version: createdBuild.version,
      status: createdBuild.status,
      s3Key: createdBuild.s3Key,
    };
  }
}
