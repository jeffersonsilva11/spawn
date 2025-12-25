/**
 * Player Repository Interface - Domain Layer
 */

import { Player } from '../entities/player.entity';

export interface IPlayerRepository {
  /**
   * Save a player
   */
  save(player: Player): Promise<Player>;

  /**
   * Find player by ID
   */
  findById(id: string): Promise<Player | null>;

  /**
   * Find player by playerId within a project
   */
  findByPlayerId(projectId: string, playerId: string): Promise<Player | null>;

  /**
   * Find player by email within a project
   */
  findByEmail(projectId: string, email: string): Promise<Player | null>;

  /**
   * Find all players for a project
   */
  findByProjectId(projectId: string): Promise<Player[]>;

  /**
   * Check if playerId exists in project
   */
  playerIdExists(projectId: string, playerId: string): Promise<boolean>;

  /**
   * Check if email exists in project
   */
  emailExists(projectId: string, email: string): Promise<boolean>;

  /**
   * Delete a player
   */
  delete(id: string): Promise<void>;

  /**
   * Count players in a project
   */
  countByProjectId(projectId: string): Promise<number>;
}
