/**
 * Track Event Use Case - Application Layer
 *
 * Track an analytics event from the game
 */

import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  IAnalyticsEventRepository,
  IProjectRepository,
  IPlayerRepository,
} from '../../domain/repositories';
import { AnalyticsEvent } from '../../domain/entities/analytics-event.entity';

export interface TrackEventRequest {
  projectId: string;
  eventName: string;
  eventData: Record<string, any>;
  playerId?: string; // Optional - can track anonymous events
}

export interface TrackEventResponse {
  eventId: string;
  message: string;
}

@Injectable()
export class TrackEventUseCase {
  constructor(
    @Inject('IAnalyticsEventRepository')
    private readonly analyticsEventRepository: IAnalyticsEventRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('IPlayerRepository')
    private readonly playerRepository: IPlayerRepository,
  ) {}

  async execute(request: TrackEventRequest): Promise<TrackEventResponse> {
    // Verify project exists
    const project = await this.projectRepository.findById(request.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Verify player exists if playerId is provided
    if (request.playerId) {
      const player = await this.playerRepository.findById(request.playerId);
      if (!player) {
        throw new Error('Player not found');
      }
    }

    // Create analytics event
    const event = AnalyticsEvent.create(
      randomUUID(),
      request.projectId,
      request.eventName,
      request.eventData,
      request.playerId,
    );

    // Save to repository
    await this.analyticsEventRepository.save(event);

    return {
      eventId: event.id,
      message: 'Event tracked successfully',
    };
  }
}
