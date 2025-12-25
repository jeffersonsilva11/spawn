/**
 * Projects Controller - Interface Layer
 *
 * Handles project and build management endpoints.
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  CreateProjectUseCase,
  UploadBuildUseCase,
} from '../../../application/use-cases';
import { CreateProjectDto, UploadBuildDto } from '../../../application/dto';
import { IProjectRepository, IBuildRepository } from '../../../domain/repositories';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(
    private readonly createProjectUseCase: CreateProjectUseCase,
    private readonly uploadBuildUseCase: UploadBuildUseCase,
    private readonly projectRepository: IProjectRepository,
    private readonly buildRepository: IBuildRepository,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createProject(@Request() req, @Body() dto: CreateProjectDto) {
    const result = await this.createProjectUseCase.execute({
      studioId: req.user.studioId,
      name: dto.name,
      description: dto.description || '',
    });

    return {
      project: {
        id: result.projectId,
        name: result.name,
        description: result.description,
        createdAt: result.createdAt,
      },
    };
  }

  @Get()
  async listProjects(@Request() req) {
    const projects = await this.projectRepository.findByStudioId(
      req.user.studioId,
    );

    return {
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        createdAt: p.createdAt,
      })),
    };
  }

  @Get(':id')
  async getProject(@Request() req, @Param('id') id: string) {
    const project = await this.projectRepository.findById(id);

    if (!project) {
      throw new Error('Project not found');
    }

    if (!project.belongsToStudio(req.user.studioId)) {
      throw new Error('Unauthorized');
    }

    return {
      project: {
        id: project.id,
        name: project.name,
        description: project.description,
        createdAt: project.createdAt,
      },
    };
  }

  @Post(':id/builds')
  @UseInterceptors(FileInterceptor('build'))
  @HttpCode(HttpStatus.CREATED)
  async uploadBuild(
    @Request() req,
    @Param('id') projectId: string,
    @Body() dto: UploadBuildDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.uploadBuildUseCase.execute({
      projectId,
      studioId: req.user.studioId,
      version: dto.version,
      file,
    });

    return {
      build: {
        id: result.buildId,
        projectId: result.projectId,
        version: result.version,
        status: result.status,
      },
    };
  }

  @Get(':id/builds')
  async listBuilds(@Request() req, @Param('id') projectId: string) {
    // Verify ownership
    const project = await this.projectRepository.findById(projectId);
    if (!project || !project.belongsToStudio(req.user.studioId)) {
      throw new Error('Unauthorized');
    }

    const builds = await this.buildRepository.findByProjectId(projectId);

    return {
      builds: builds.map((b) => ({
        id: b.id,
        version: b.version,
        status: b.status,
        createdAt: b.createdAt,
      })),
    };
  }
}
