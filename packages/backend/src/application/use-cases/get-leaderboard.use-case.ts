/**
 * Get Leaderboard Use Case - Application Layer
 *
 * Get top scores from a leaderboard
 */

import { Injectable, Inject } from '@nestjs/common';
import {
  ILeaderboardRepository,
  IPlayerRepository,
  IProjectRepository,
} from '../../domain/repositories';

export interface GetLeaderboardRequest {
  projectId: string;
  leaderboardName: string;
  limit?: number; // Default 100
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  playerDisplayName?: string;
  score: number;
  metadata: Record<string, any>;
}

export interface GetLeaderboardResponse {
  leaderboardName: string;
  entries: LeaderboardEntry[];
  totalEntries: number;
  message: string;
}

@Injectable()
export class GetLeaderboardUseCase {
  constructor(
    @Inject('ILeaderboardRepository')
    private readonly leaderboardRepository: ILeaderboardRepository,
    @Inject('IPlayerRepository')
    private readonly playerRepository: IPlayerRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(
    request: GetLeaderboardRequest,
  ): Promise<GetLeaderboardResponse> {
    // Verify project exists
    const project = await this.projectRepository.findById(request.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    const limit = request.limit || 100;

    // Get top entries
    const topEntries = await this.leaderboardRepository.getTopEntries(
      request.projectId,
      request.leaderboardName,
      limit,
    );

    // Get total count
    const totalEntries = await this.leaderboardRepository.countByLeaderboard(
      request.projectId,
      request.leaderboardName,
    );

    // Build response with player display names
    const entries: LeaderboardEntry[] = [];
    for (let i = 0; i < topEntries.length; i++) {
      const entry = topEntries[i];
      const player = await this.playerRepository.findById(entry.playerId);

      entries.push({
        rank: i + 1,
        playerId: entry.playerId,
        playerDisplayName: player?.displayName,
        score: entry.score,
        metadata: entry.metadata,
      });
    }

    return {
      leaderboardName: request.leaderboardName,
      entries,
      totalEntries,
      message: 'Leaderboard retrieved successfully',
    };
  }
}
