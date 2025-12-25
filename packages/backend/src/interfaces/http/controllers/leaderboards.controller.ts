/**
 * Leaderboards Controller - HTTP Interface Layer
 *
 * Handles HTTP requests for leaderboard management
 */

import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  SubmitScoreUseCase,
  GetLeaderboardUseCase,
} from '../../../application/use-cases';
import { ApiKeyAuthGuard } from '../guards/api-key-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('leaderboards')
export class LeaderboardsController {
  constructor(
    private readonly submitScoreUseCase: SubmitScoreUseCase,
    private readonly getLeaderboardUseCase: GetLeaderboardUseCase,
  ) {}

  /**
   * Submit a score to a leaderboard (from Unity SDK)
   * POST /leaderboards/submit
   */
  @Post('submit')
  @UseGuards(ApiKeyAuthGuard)
  @HttpCode(HttpStatus.OK)
  async submitScore(
    @Body()
    body: {
      projectId: string;
      leaderboardName: string;
      playerId: string;
      score: number;
      metadata?: Record<string, any>;
    },
  ) {
    const result = await this.submitScoreUseCase.execute({
      projectId: body.projectId,
      leaderboardName: body.leaderboardName,
      playerId: body.playerId,
      score: body.score,
      metadata: body.metadata,
    });

    return {
      success: true,
      leaderboard: {
        name: result.leaderboardName,
        score: result.score,
        rank: result.rank,
      },
      message: result.message,
    };
  }

  /**
   * Get leaderboard rankings (both SDK and web panel)
   * GET /leaderboards/projects/:projectId/:leaderboardName
   */
  @Get('projects/:projectId/:leaderboardName')
  @HttpCode(HttpStatus.OK)
  async getLeaderboard(
    @Param('projectId') projectId: string,
    @Param('leaderboardName') leaderboardName: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.getLeaderboardUseCase.execute({
      projectId,
      leaderboardName,
      limit: limit ? parseInt(limit, 10) : undefined,
    });

    return {
      success: true,
      leaderboard: {
        name: result.leaderboardName,
        entries: result.entries,
        totalEntries: result.totalEntries,
      },
      message: result.message,
    };
  }
}
