/**
 * Get Analytics Stats Use Case - Application Layer
 *
 * Get analytics statistics for a project
 */

import { Injectable, Inject } from '@nestjs/common';
import {
  IAnalyticsEventRepository,
  IPlayerRepository,
  IProjectRepository,
} from '../../domain/repositories';

export interface GetAnalyticsStatsRequest {
  projectId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface EventStat {
  eventName: string;
  count: number;
}

export interface GetAnalyticsStatsResponse {
  totalEvents: number;
  totalPlayers: number;
  uniqueEventNames: string[];
  recentEvents: Array<{
    id: string;
    eventName: string;
    playerId?: string;
    timestamp: Date;
  }>;
  topEvents: EventStat[];
  message: string;
}

@Injectable()
export class GetAnalyticsStatsUseCase {
  constructor(
    @Inject('IAnalyticsEventRepository')
    private readonly analyticsEventRepository: IAnalyticsEventRepository,
    @Inject('IPlayerRepository')
    private readonly playerRepository: IPlayerRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    request: GetAnalyticsStatsRequest,
  ): Promise<GetAnalyticsStatsResponse> {
    // Verify project exists
    const project = await this.projectRepository.findById(request.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Get total events
    const totalEvents =
      await this.analyticsEventRepository.countByProjectId(request.projectId);

    // Get total players
    const totalPlayers =
      await this.playerRepository.countByProjectId(request.projectId);

    // Get unique event names
    const uniqueEventNames =
      await this.analyticsEventRepository.getUniqueEventNames(
        request.projectId,
      );

    // Get recent events
    const recentEventsData =
      await this.analyticsEventRepository.findByProjectId(
        request.projectId,
        10, // limit
        0, // offset
      );

    const recentEvents = recentEventsData.map((event) => ({
      id: event.id,
      eventName: event.eventName,
      playerId: event.playerId,
      timestamp: event.timestamp,
    }));

    // Get top events (count by event name)
    const topEvents: EventStat[] = [];
    for (const eventName of uniqueEventNames) {
      const count = await this.analyticsEventRepository.countByEventName(
        request.projectId,
        eventName,
      );
      topEvents.push({ eventName, count });
    }

    // Sort by count descending
    topEvents.sort((a, b) => b.count - a.count);

    return {
      totalEvents,
      totalPlayers,
      uniqueEventNames,
      recentEvents,
      topEvents: topEvents.slice(0, 10), // Top 10 events
      message: 'Analytics stats retrieved successfully',
    };
  }
}
