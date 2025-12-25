/**
 * SDK Controller - Interface Layer
 *
 * Public API endpoints for Unity SDK.
 */

import {
  Controller,
  Get,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiKeyAuthGuard } from '../guards/api-key-auth.guard';
import { GetOrCreateServerUseCase } from '../../../application/use-cases';

@Controller('sdk')
@UseGuards(ApiKeyAuthGuard)
export class SdkController {
  constructor(
    private readonly getOrCreateServerUseCase: GetOrCreateServerUseCase,
  ) {}

  @Get('projects/:id/server')
  @HttpCode(HttpStatus.OK)
  async getServer(@Request() req, @Param('id') projectId: string) {
    const result = await this.getOrCreateServerUseCase.execute({
      projectId,
      studioId: req.user.studioId,
    });

    return {
      server: {
        id: result.serverId,
        ip: result.ip,
        port: result.port,
        status: result.status,
      },
    };
  }
}
