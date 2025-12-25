/**
 * Create Project Use Case - Application Layer
 *
 * Business logic for creating a new project within a studio.
 */

import { Injectable, Inject } from '@nestjs/common';
import { Project } from '../../domain/entities';
import { IProjectRepository } from '../../domain/repositories';
import { v4 as uuidv4 } from 'uuid';

export interface CreateProjectRequest {
  studioId: string;
  name: string;
  description: string;
}

export interface CreateProjectResponse {
  projectId: string;
  name: string;
  description: string;
  createdAt: Date;
}

@Injectable()
export class CreateProjectUseCase {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(request: CreateProjectRequest): Promise<CreateProjectResponse> {
    // Validate project input
    const validation = Project.validate(request.name, request.description);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Create project
    const project = new Project(
      uuidv4(),
      request.studioId,
      request.name,
      request.description,
      new Date(),
      new Date(),
    );

    const createdProject = await this.projectRepository.create(project);

    return {
      projectId: createdProject.id,
      name: createdProject.name,
      description: createdProject.description,
      createdAt: createdProject.createdAt,
    };
  }
}
