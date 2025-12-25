/**
 * Load Player Data Use Case - Application Layer
 *
 * Load key-value data for a player (retrieve cloud save)
 */

import { Injectable, Inject } from '@nestjs/common';
import {
  IPlayerDataRepository,
  IPlayerRepository,
} from '../../domain/repositories';

export interface LoadPlayerDataRequest {
  playerId: string; // Player's database ID
  key?: string; // Optional - if not provided, load all data
}

export interface LoadPlayerDataResponse {
  data:
    | { key: string; value: any }[]
    | { key: string; value: any }
    | null;
  message: string;
}

@Injectable()
export class LoadPlayerDataUseCase {
  constructor(
    @Inject('IPlayerDataRepository')
    private readonly playerDataRepository: IPlayerDataRepository,
    @Inject('IPlayerRepository')
    private readonly playerRepository: IPlayerRepository,
  ) {}

  async execute(
    request: LoadPlayerDataRequest,
  ): Promise<LoadPlayerDataResponse> {
    // Verify player exists
    const player = await this.playerRepository.findById(request.playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    if (request.key) {
      // Load specific key
      const playerData =
        await this.playerDataRepository.findByPlayerIdAndKey(
          request.playerId,
          request.key,
        );

      if (!playerData) {
        return {
          data: null,
          message: 'Data not found',
        };
      }

      return {
        data: {
          key: playerData.key,
          value: playerData.value,
        },
        message: 'Data loaded successfully',
      };
    } else {
      // Load all data
      const allData =
        await this.playerDataRepository.findByPlayerId(request.playerId);

      return {
        data: allData.map((d) => ({
          key: d.key,
          value: d.value,
        })),
        message: 'All data loaded successfully',
      };
    }
  }
}
