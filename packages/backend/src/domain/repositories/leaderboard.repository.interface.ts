/**
 * Leaderboard Repository Interface - Domain Layer
 */

import { Leaderboard } from '../entities/leaderboard.entity';

export interface ILeaderboardRepository {
  /**
   * Save a leaderboard entry
   */
  save(entry: Leaderboard): Promise<Leaderboard>;

  /**
   * Find entry by ID
   */
  findById(id: string): Promise<Leaderboard | null>;

  /**
   * Find entry by player and leaderboard name
   */
  findByPlayerAndLeaderboard(
    projectId: string,
    leaderboardName: string,
    playerId: string,
  ): Promise<Leaderboard | null>;

  /**
   * Get top entries for a leaderboard (sorted by score DESC)
   */
  getTopEntries(
    projectId: string,
    leaderboardName: string,
    limit: number,
  ): Promise<Leaderboard[]>;

  /**
   * Get player's rank in a leaderboard
   */
  getPlayerRank(
    projectId: string,
    leaderboardName: string,
    playerId: string,
  ): Promise<number | null>;

  /**
   * Get all entries for a player across all leaderboards
   */
  findByPlayerId(playerId: string): Promise<Leaderboard[]>;

  /**
   * Get unique leaderboard names for a project
   */
  getLeaderboardNames(projectId: string): Promise<string[]>;

  /**
   * Count entries in a leaderboard
   */
  countByLeaderboard(
    projectId: string,
    leaderboardName: string,
  ): Promise<number>;

  /**
   * Delete a leaderboard entry
   */
  delete(id: string): Promise<void>;

  /**
   * Delete all entries for a player
   */
  deleteByPlayerId(playerId: string): Promise<void>;

  /**
   * Delete all entries for a leaderboard
   */
  deleteByLeaderboardName(
    projectId: string,
    leaderboardName: string,
  ): Promise<void>;
}
