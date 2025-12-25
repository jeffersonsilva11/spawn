/**
 * PlayerData Repository Interface - Domain Layer
 */

import { PlayerData } from '../entities/player-data.entity';

export interface IPlayerDataRepository {
  /**
   * Save player data
   */
  save(data: PlayerData): Promise<PlayerData>;

  /**
   * Find data by ID
   */
  findById(id: string): Promise<PlayerData | null>;

  /**
   * Find data by player ID and key
   */
  findByPlayerIdAndKey(playerId: string, key: string): Promise<PlayerData | null>;

  /**
   * Find all data for a player
   */
  findByPlayerId(playerId: string): Promise<PlayerData[]>;

  /**
   * Delete specific data entry
   */
  delete(id: string): Promise<void>;

  /**
   * Delete all data for a player
   */
  deleteByPlayerId(playerId: string): Promise<void>;
}
