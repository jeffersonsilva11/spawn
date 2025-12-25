/**
 * Servers Controller - Interface Layer
 *
 * Handles server deployment and management endpoints.
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  DeployServerUseCase,
  StopServerUseCase,
  UpdateHeartbeatUseCase,
} from '../../../application/use-cases';
import { DeployServerDto } from '../../../application/dto';
import { IServerInstanceRepository } from '../../../domain/repositories';

@Controller('servers')
export class ServersController {
  constructor(
    private readonly deployServerUseCase: DeployServerUseCase,
    private readonly stopServerUseCase: StopServerUseCase,
    private readonly updateHeartbeatUseCase: UpdateHeartbeatUseCase,
    private readonly serverInstanceRepository: IServerInstanceRepository,
  ) {}

  @Post('projects/:projectId/deploy')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async deployServer(
    @Request() req,
    @Param('projectId') projectId: string,
    @Body() dto: DeployServerDto,
  ) {
    const result = await this.deployServerUseCase.execute({
      projectId,
      studioId: req.user.studioId,
      buildId: dto.buildId,
    });

    return {
      server: {
        id: result.serverId,
        projectId: result.projectId,
        buildId: result.buildId,
        status: result.status,
        ip: result.ip,
        port: result.port,
      },
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listServers(@Request() req) {
    const servers = await this.serverInstanceRepository.findByStudioId(
      req.user.studioId,
    );

    return {
      servers: servers.map((s) => ({
        id: s.id,
        projectId: s.projectId,
        buildId: s.buildId,
        status: s.status,
        ip: s.ip,
        port: s.port,
        lastHeartbeat: s.lastHeartbeat,
        createdAt: s.createdAt,
      })),
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getServer(@Request() req, @Param('id') id: string) {
    const server = await this.serverInstanceRepository.findById(id);

    if (!server) {
      throw new Error('Server not found');
    }

    // Verify ownership through project - need to check studio
    const servers = await this.serverInstanceRepository.findByStudioId(
      req.user.studioId,
    );
    const isOwner = servers.some((s) => s.id === id);

    if (!isOwner) {
      throw new Error('Unauthorized');
    }

    return {
      server: {
        id: server.id,
        projectId: server.projectId,
        buildId: server.buildId,
        status: server.status,
        ip: server.ip,
        port: server.port,
        containerId: server.containerId,
        lastHeartbeat: server.lastHeartbeat,
        createdAt: server.createdAt,
      },
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async stopServer(@Request() req, @Param('id') id: string) {
    await this.stopServerUseCase.execute({
      serverId: id,
      studioId: req.user.studioId,
    });
  }

  @Post(':id/heartbeat')
  @HttpCode(HttpStatus.OK)
  async heartbeat(@Param('id') id: string) {
    // Public endpoint - no auth required (servers call this)
    const result = await this.updateHeartbeatUseCase.execute({
      serverId: id,
    });

    return {
      serverId: result.serverId,
      lastHeartbeat: result.lastHeartbeat,
    };
  }
}
