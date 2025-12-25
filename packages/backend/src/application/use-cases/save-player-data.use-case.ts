/**
 * Save Player Data Use Case - Application Layer
 *
 * Save key-value data for a player (like cloud save)
 */

import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  IPlayerDataRepository,
  IPlayerRepository,
} from '../../domain/repositories';
import { PlayerData } from '../../domain/entities/player-data.entity';

export interface SavePlayerDataRequest {
  playerId: string; // Player's database ID
  key: string;
  value: any; // JSON serializable value
}

export interface SavePlayerDataResponse {
  key: string;
  value: any;
  message: string;
}

@Injectable()
export class SavePlayerDataUseCase {
  constructor(
    @Inject('IPlayerDataRepository')
    private readonly playerDataRepository: IPlayerDataRepository,
    @Inject('IPlayerRepository')
    private readonly playerRepository: IPlayerRepository,
  ) {}

  async execute(
    request: SavePlayerDataRequest,
  ): Promise<SavePlayerDataResponse> {
    // Verify player exists
    const player = await this.playerRepository.findById(request.playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    // Check if data already exists
    const existingData =
      await this.playerDataRepository.findByPlayerIdAndKey(
        request.playerId,
        request.key,
      );

    if (existingData) {
      // Update existing data
      existingData.updateValue(request.value);
      await this.playerDataRepository.save(existingData);
    } else {
      // Create new data
      const playerData = PlayerData.create(
        randomUUID(),
        request.playerId,
        request.key,
        request.value,
      );
      await this.playerDataRepository.save(playerData);
    }

    return {
      key: request.key,
      value: request.value,
      message: 'Data saved successfully',
    };
  }
}
