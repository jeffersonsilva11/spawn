/**
 * Submit Score Use Case - Application Layer
 *
 * Submit a score to a leaderboard
 */

import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  ILeaderboardRepository,
  IPlayerRepository,
  IProjectRepository,
} from '../../domain/repositories';
import { Leaderboard } from '../../domain/entities/leaderboard.entity';

export interface SubmitScoreRequest {
  projectId: string;
  leaderboardName: string;
  playerId: string; // Player's database ID
  score: number;
  metadata?: Record<string, any>;
}

export interface SubmitScoreResponse {
  leaderboardName: string;
  score: number;
  rank: number | null;
  message: string;
}

@Injectable()
export class SubmitScoreUseCase {
  constructor(
    @Inject('ILeaderboardRepository')
    private readonly leaderboardRepository: ILeaderboardRepository,
    @Inject('IPlayerRepository')
    private readonly playerRepository: IPlayerRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async execute(request: SubmitScoreRequest): Promise<SubmitScoreResponse> {
    // Verify project exists
    const project = await this.projectRepository.findById(request.projectId);
    if (!project) {
      throw new Error('Project not found');
    }

    // Verify player exists
    const player = await this.playerRepository.findById(request.playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Check if player already has a score
    const existingEntry =
      await this.leaderboardRepository.findByPlayerAndLeaderboard(
        request.projectId,
        request.leaderboardName,
        request.playerId,
      );

    if (existingEntry) {
      // Update existing score
      existingEntry.updateScore(request.score);
      if (request.metadata) {
        existingEntry.updateMetadata(request.metadata);
      }
      await this.leaderboardRepository.save(existingEntry);
    } else {
      // Create new entry
      const entry = Leaderboard.create(
        randomUUID(),
        request.projectId,
        request.leaderboardName,
        request.playerId,
        request.score,
        request.metadata || {},
      );
      await this.leaderboardRepository.save(entry);
    }

    // Get player's rank
    const rank = await this.leaderboardRepository.getPlayerRank(
      request.projectId,
      request.leaderboardName,
      request.playerId,
    );

    return {
      leaderboardName: request.leaderboardName,
      score: request.score,
      rank,
      message: 'Score submitted successfully',
    };
  }
}
