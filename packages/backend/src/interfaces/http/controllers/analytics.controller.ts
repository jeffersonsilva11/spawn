/**
 * Analytics Controller - HTTP Interface Layer
 *
 * Handles HTTP requests for analytics tracking and stats
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
  TrackEventUseCase,
  GetAnalyticsStatsUseCase,
} from '../../../application/use-cases';
import { ApiKeyAuthGuard } from '../guards/api-key-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('analytics')
export class AnalyticsController {
  constructor(
    private readonly trackEventUseCase: TrackEventUseCase,
    private readonly getAnalyticsStatsUseCase: GetAnalyticsStatsUseCase,
  ) {}

  /**
   * Track an analytics event (from Unity SDK)
   * POST /analytics/track
   */
  @Post('track')
  @UseGuards(ApiKeyAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async trackEvent(
    @Body()
    body: {
      projectId: string;
      eventName: string;
      eventData: Record<string, any>;
      playerId?: string;
    },
  ) {
    const result = await this.trackEventUseCase.execute({
      projectId: body.projectId,
      eventName: body.eventName,
      eventData: body.eventData,
      playerId: body.playerId,
    });

    return {
      success: true,
      eventId: result.eventId,
      message: result.message,
    };
  }

  /**
   * Get analytics stats for a project (web panel)
   * GET /analytics/projects/:projectId/stats
   */
  @Get('projects/:projectId/stats')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getStats(
    @Param('projectId') projectId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const result = await this.getAnalyticsStatsUseCase.execute({
      projectId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return {
      success: true,
      stats: {
        totalEvents: result.totalEvents,
        totalPlayers: result.totalPlayers,
        uniqueEventNames: result.uniqueEventNames,
        recentEvents: result.recentEvents,
        topEvents: result.topEvents,
      },
      message: result.message,
    };
  }
}
